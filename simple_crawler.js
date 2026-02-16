const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Output directory for extracted assets
const OUTPUT_DIR = path.join(__dirname, 'extracted_assets');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');
const METADATA_DIR = path.join(OUTPUT_DIR, 'metadata');

// Ensure output directories exist
fs.ensureDirSync(ASSETS_DIR);
fs.ensureDirSync(METADATA_DIR);
fs.ensureDirSync(path.join(ASSETS_DIR, 'images'));
fs.ensureDirSync(path.join(ASSETS_DIR, 'videos'));
fs.ensureDirSync(path.join(ASSETS_DIR, 'icons'));

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Download a file from URL
 */
async function downloadFile(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000,
      maxRedirects: 5
    });
    
    await fs.writeFile(filepath, response.data);
    const stats = await fs.stat(filepath);
    console.log(`Downloaded: ${filepath} (${(stats.size / 1024).toFixed(2)} KB)`);
    return { success: true, size: stats.size };
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Extract URLs from HTML content using regex (simpler than cheerio)
 */
function extractImageUrls(html) {
  const urls = new Set();
  
  // Extract img src attributes
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let url = match[1];
    if (url && !url.startsWith('data:')) {
      if (!url.startsWith('http')) {
        url = 'https:' + url;
      }
      urls.add(url);
    }
  }
  
  // Extract from srcset
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(html)) !== null) {
    const srcset = match[1];
    srcset.split(',').forEach(item => {
      const url = item.trim().split(' ')[0];
      if (url && !url.startsWith('data:')) {
        if (!url.startsWith('http')) {
          urls.add('https:' + url);
        } else {
          urls.add(url);
        }
      }
    });
  }
  
  return Array.from(urls);
}

/**
 * Extract video URLs from HTML
 */
function extractVideoUrls(html) {
  const urls = new Set();
  
  // Extract video source
  const videoRegex = /<video[^>]+src=["']([^"']+)["']|<source[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = videoRegex.exec(html)) !== null) {
    const url = match[1] || match[2];
    if (url && !url.startsWith('data:')) {
      if (!url.startsWith('http')) {
        urls.add('https:' + url);
      } else {
        urls.add(url);
      }
    }
  }
  
  // Extract iframe sources (YouTube, etc.)
  const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
  while ((match = iframeRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && (url.includes('youtube') || url.includes('video') || url.includes('vimeo'))) {
      urls.add(url);
    }
  }
  
  return Array.from(urls);
}

/**
 * Try to find Agua Caliente app on Google Play using common app IDs
 */
async function tryGooglePlayAppIds() {
  const possibleIds = [
    'com.aguacaliente.casino',
    'com.aguacaliente',
    'com.aguacalientecasino',
    'com.aguacaliente.resort',
    'com.aguacaliente.resortcasino',
    'com.aguacaliente.mobile',
    'com.aguacalientecasino.app'
  ];
  
  for (const appId of possibleIds) {
    const appUrl = `https://play.google.com/store/apps/details?id=${appId}`;
    console.log(`\nTrying Google Play app ID: ${appId}`);
    
    try {
      const response = await axios.get(appUrl, {
        headers: { 
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 15000,
        maxRedirects: 5
      });
      
      const html = response.data;
      
      // Check if this is the right app
      if (html.toLowerCase().includes('agua caliente') || 
          html.toLowerCase().includes('aguacaliente')) {
        console.log(`✓ Found app: ${appId}`);
        return { appId, appUrl, html };
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`✗ App ID ${appId} not found`);
      } else {
        console.log(`✗ Error checking ${appId}:`, error.message);
      }
    }
  }
  
  return null;
}

/**
 * Extract assets from Google Play Store page
 */
async function extractGooglePlayAssets(appUrl, html) {
  const results = {
    appUrl,
    screenshots: [],
    videos: [],
    icon: null,
    appName: null,
    description: null
  };
  
  // Extract app name (try multiple patterns)
  const nameMatch = html.match(/<h1[^>]*itemprop=["']name["'][^>]*>([^<]+)<\/h1>/i) ||
                    html.match(/<h1[^>]*>([^<]*agua[^<]*caliente[^<]*)<\/h1>/i) ||
                    html.match(/<title>([^<]+)<\/title>/i);
  if (nameMatch) {
    results.appName = nameMatch[1].trim();
  }
  
  // Extract description
  const descMatch = html.match(/<div[^>]*itemprop=["']description["'][^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/<div[^>]*data-g-id=["']description["'][^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    results.description = descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500);
  }
  
  // Extract all images
  const imageUrls = extractImageUrls(html);
  
  // Filter for screenshots and icons
  imageUrls.forEach(url => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('screenshot') || lowerUrl.includes('screenshots')) {
      results.screenshots.push(url);
    } else if (lowerUrl.includes('icon') || lowerUrl.includes('logo') || 
               lowerUrl.includes('512x512') || lowerUrl.includes('128x128')) {
      if (!results.icon) {
        results.icon = url;
      }
    }
  });
  
  // Extract videos
  results.videos = extractVideoUrls(html);
  
  // If no screenshots found, try to get all large images
  if (results.screenshots.length === 0) {
    imageUrls.forEach(url => {
      if (url.includes('lh3.googleusercontent.com') || 
          url.includes('play.google.com') ||
          url.match(/\d+x\d+/)) {
        results.screenshots.push(url);
      }
    });
  }
  
  return results;
}

/**
 * Try to find Agua Caliente app on Apple App Store
 */
async function tryAppleAppStore() {
  // Try searching via API or direct URL patterns
  const searchUrl = 'https://apps.apple.com/us/search?term=agua%20caliente%20casino';
  
  console.log(`\nSearching Apple App Store: ${searchUrl}`);
  
  try {
    const response = await axios.get(searchUrl, {
      headers: { 
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });
    
    const html = response.data;
    
    // Look for app links
    const appLinkMatch = html.match(/href="(\/us\/app\/[^"]*agua[^"]*\/id\d+)/i) ||
                         html.match(/href="(\/us\/app\/[^"]*caliente[^"]*\/id\d+)/i);
    
    if (appLinkMatch) {
      const appPath = appLinkMatch[1];
      const appUrl = appPath.startsWith('http') ? appPath : `https://apps.apple.com${appPath}`;
      console.log(`✓ Found app: ${appUrl}`);
      return { appUrl, html };
    }
  } catch (error) {
    console.log(`✗ Apple App Store search error:`, error.message);
  }
  
  return null;
}

/**
 * Extract assets from Apple App Store page
 */
async function extractAppleAssets(appUrl, html) {
  const results = {
    appUrl,
    screenshots: [],
    videos: [],
    icon: null,
    appName: null,
    description: null
  };
  
  // Extract app name
  const nameMatch = html.match(/<h1[^>]*class=["'][^"']*product-header__title[^"']*["'][^>]*>([^<]+)<\/h1>/i) ||
                    html.match(/<h1[^>]*>([^<]*agua[^<]*caliente[^<]*)<\/h1>/i);
  if (nameMatch) {
    results.appName = nameMatch[1].trim();
  }
  
  // Extract description
  const descMatch = html.match(/<div[^>]*class=["'][^"']*product-review__body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    results.description = descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 500);
  }
  
  // Extract images
  const imageUrls = extractImageUrls(html);
  
  imageUrls.forEach(url => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('screenshot') || lowerUrl.includes('screen-shot')) {
      results.screenshots.push(url);
    } else if (lowerUrl.includes('icon') || lowerUrl.includes('logo') ||
               lowerUrl.includes('1024x1024') || lowerUrl.includes('512x512')) {
      if (!results.icon) {
        results.icon = url;
      }
    }
  });
  
  // Extract videos
  results.videos = extractVideoUrls(html);
  
  return results;
}

/**
 * Download all assets for a store
 */
async function downloadStoreAssets(storeName, results) {
  console.log(`\n=== Downloading ${storeName} assets ===`);
  
  const storeDir = path.join(ASSETS_DIR, storeName.toLowerCase().replace(/\s+/g, '_'));
  fs.ensureDirSync(storeDir);
  fs.ensureDirSync(path.join(storeDir, 'screenshots'));
  fs.ensureDirSync(path.join(storeDir, 'videos'));
  
  const downloadedAssets = {
    screenshots: [],
    videos: [],
    icon: null
  };
  
  // Download screenshots
  console.log(`Downloading ${results.screenshots.length} screenshots...`);
  for (let i = 0; i < results.screenshots.length; i++) {
    const url = results.screenshots[i];
    const urlPath = url.split('?')[0];
    const ext = path.extname(urlPath) || '.jpg';
    const filename = `screenshot_${String(i + 1).padStart(3, '0')}${ext}`;
    const filepath = path.join(storeDir, 'screenshots', filename);
    
    const result = await downloadFile(url, filepath);
    if (result.success) {
      downloadedAssets.screenshots.push({
        url,
        filename,
        path: filepath,
        size: result.size
      });
    }
    
    // Limit to avoid too many downloads
    if (i >= 19) break;
  }
  
  // Download icon
  if (results.icon) {
    console.log('Downloading icon...');
    const urlPath = results.icon.split('?')[0];
    const ext = path.extname(urlPath) || '.png';
    const filename = `icon${ext}`;
    const filepath = path.join(storeDir, filename);
    
    const result = await downloadFile(results.icon, filepath);
    if (result.success) {
      downloadedAssets.icon = {
        url: results.icon,
        filename,
        path: filepath,
        size: result.size
      };
    }
  }
  
  // Download videos
  console.log(`Downloading ${results.videos.length} videos...`);
  for (let i = 0; i < results.videos.length; i++) {
    const url = results.videos[i];
    // Skip iframe URLs (YouTube, etc.) as they're not direct video files
    if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('iframe')) {
      downloadedAssets.videos.push({
        url,
        type: 'iframe',
        note: 'Embedded video URL'
      });
      continue;
    }
    
    const urlPath = url.split('?')[0];
    const ext = path.extname(urlPath) || '.mp4';
    const filename = `video_${String(i + 1).padStart(3, '0')}${ext}`;
    const filepath = path.join(storeDir, 'videos', filename);
    
    const result = await downloadFile(url, filepath);
    if (result.success) {
      downloadedAssets.videos.push({
        url,
        filename,
        path: filepath,
        size: result.size
      });
    }
  }
  
  return downloadedAssets;
}

/**
 * Save metadata
 */
async function saveMetadata(storeName, results, downloadedAssets) {
  const metadata = {
    store: storeName,
    appUrl: results.appUrl,
    appName: results.appName,
    description: results.description,
    assets: {
      screenshots: {
        found: results.screenshots.length,
        downloaded: downloadedAssets.screenshots.length
      },
      videos: {
        found: results.videos.length,
        downloaded: downloadedAssets.videos.filter(v => v.filename).length
      },
      icon: downloadedAssets.icon ? 1 : 0
    },
    downloadedAssets: downloadedAssets,
    crawlDate: new Date().toISOString()
  };
  
  const metadataPath = path.join(METADATA_DIR, `${storeName.toLowerCase().replace(/\s+/g, '_')}_metadata.json`);
  await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
  console.log(`\nMetadata saved to: ${metadataPath}`);
  
  return metadata;
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Agua Caliente App Crawler');
  console.log('='.repeat(60));
  
  const allResults = {};
  
  // Crawl Google Play Store
  console.log('\n[1/2] Crawling Google Play Store...');
  const googlePlayData = await tryGooglePlayAppIds();
  if (googlePlayData) {
    const results = await extractGooglePlayAssets(googlePlayData.appUrl, googlePlayData.html);
    console.log(`Found: ${results.screenshots.length} screenshots, ${results.videos.length} videos`);
    
    const downloadedAssets = await downloadStoreAssets('Google Play', results);
    const metadata = await saveMetadata('Google Play', results, downloadedAssets);
    allResults.googlePlay = metadata;
  } else {
    console.log('Could not find Agua Caliente app on Google Play Store');
  }
  
  // Crawl Apple App Store
  console.log('\n[2/2] Crawling Apple App Store...');
  const appleData = await tryAppleAppStore();
  if (appleData) {
    // Fetch full app page
    try {
      const response = await axios.get(appleData.appUrl, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 15000
      });
      const results = await extractAppleAssets(appleData.appUrl, response.data);
      console.log(`Found: ${results.screenshots.length} screenshots, ${results.videos.length} videos`);
      
      const downloadedAssets = await downloadStoreAssets('Apple App Store', results);
      const metadata = await saveMetadata('Apple App Store', results, downloadedAssets);
      allResults.appleAppStore = metadata;
    } catch (error) {
      console.log(`Error fetching Apple App Store page:`, error.message);
    }
  } else {
    console.log('Could not find Agua Caliente app on Apple App Store');
  }
  
  // Create summary report
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  const summary = {
    crawlDate: new Date().toISOString(),
    results: allResults,
    totalAssets: {
      screenshots: (allResults.googlePlay?.assets?.screenshots?.downloaded || 0) + 
                   (allResults.appleAppStore?.assets?.screenshots?.downloaded || 0),
      videos: (allResults.googlePlay?.assets?.videos?.downloaded || 0) + 
              (allResults.appleAppStore?.assets?.videos?.downloaded || 0),
      icons: (allResults.googlePlay?.assets?.icon || 0) + 
             (allResults.appleAppStore?.assets?.icon || 0)
    },
    outputDirectories: {
      assets: ASSETS_DIR,
      metadata: METADATA_DIR
    }
  };
  
  await fs.writeJSON(summaryPath, summary, { spaces: 2 });
  
  console.log('\n' + '='.repeat(60));
  console.log('Crawl Complete!');
  console.log('='.repeat(60));
  console.log(`Summary: ${summary.totalAssets.screenshots} screenshots, ${summary.totalAssets.videos} videos, ${summary.totalAssets.icons} icons`);
  console.log(`\nSummary saved to: ${summaryPath}`);
  console.log(`Assets directory: ${ASSETS_DIR}`);
  console.log(`Metadata directory: ${METADATA_DIR}`);
}

// Run the crawler
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

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
 * Use curl to fetch page (more reliable for app stores)
 */
function fetchWithCurl(url) {
  try {
    const output = execSync(`curl -s -L -H "User-Agent: ${USER_AGENT}" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" "${url}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000
    });
    return output;
  } catch (error) {
    console.error(`Curl fetch error: ${error.message}`);
    return null;
  }
}

/**
 * Download a file from URL
 */
async function downloadFile(url, filepath) {
  try {
    // Try using curl first (more reliable)
    try {
      execSync(`curl -s -L -H "User-Agent: ${USER_AGENT}" -o "${filepath}" "${url}"`, {
        timeout: 30000,
        maxBuffer: 50 * 1024 * 1024
      });
      const stats = await fs.stat(filepath);
      if (stats.size > 0) {
        console.log(`Downloaded: ${filepath} (${(stats.size / 1024).toFixed(2)} KB)`);
        return { success: true, size: stats.size };
      }
    } catch (curlError) {
      // Fallback to axios
    }
    
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
 * Extract URLs from HTML content
 */
function extractImageUrls(html) {
  const urls = new Set();
  
  // Extract img src attributes
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let url = match[1];
    if (url && !url.startsWith('data:') && !url.startsWith('javascript:')) {
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
      if (url && !url.startsWith('data:') && !url.startsWith('javascript:')) {
        if (!url.startsWith('http')) {
          urls.add('https:' + url);
        } else {
          urls.add(url);
        }
      }
    });
  }
  
  // Extract from data-src
  const dataSrcRegex = /data-src=["']([^"']+)["']/gi;
  while ((match = dataSrcRegex.exec(html)) !== null) {
    let url = match[1];
    if (url && !url.startsWith('data:') && !url.startsWith('javascript:')) {
      if (!url.startsWith('http')) {
        url = 'https:' + url;
      }
      urls.add(url);
    }
  }
  
  return Array.from(urls);
}

/**
 * Extract video URLs from HTML
 */
function extractVideoUrls(html) {
  const urls = new Set();
  
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
 * Try Google Play Store with curl
 */
async function crawlGooglePlay() {
  console.log('\n=== Crawling Google Play Store ===');
  
  const possibleIds = [
    'com.aguacaliente.casino',
    'com.aguacaliente',
    'com.aguacalientecasino',
    'com.aguacaliente.resort',
    'com.aguacaliente.resortcasino',
    'com.aguacaliente.mobile',
    'com.aguacalientecasino.app',
    'com.aguacaliente.app'
  ];
  
  for (const appId of possibleIds) {
    const appUrl = `https://play.google.com/store/apps/details?id=${appId}`;
    console.log(`Trying: ${appId}`);
    
    const html = fetchWithCurl(appUrl);
    if (!html) continue;
    
    // Check if page contains agua caliente
    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes('agua') && lowerHtml.includes('caliente')) {
      console.log(`✓ Found app: ${appId}`);
      
      const results = {
        appId,
        appUrl,
        screenshots: [],
        videos: [],
        icon: null,
        appName: null,
        description: null
      };
      
      // Extract app name
      const nameMatch = html.match(/<h1[^>]*itemprop=["']name["'][^>]*>([^<]+)<\/h1>/i) ||
                        html.match(/<h1[^>]*>([^<]*agua[^<]*caliente[^<]*)<\/h1>/i) ||
                        html.match(/<title>([^<]+)<\/title>/i);
      if (nameMatch) {
        results.appName = nameMatch[1].trim();
      }
      
      // Extract description
      const descMatch = html.match(/<div[^>]*itemprop=["']description["'][^>]*>([\s\S]{0,2000}?)<\/div>/i) ||
                         html.match(/<div[^>]*data-g-id=["']description["'][^>]*>([\s\S]{0,2000}?)<\/div>/i);
      if (descMatch) {
        results.description = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000);
      }
      
      // Extract images
      const imageUrls = extractImageUrls(html);
      
      imageUrls.forEach(url => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('screenshot') || 
            lowerUrl.includes('screenshots') ||
            (lowerUrl.includes('lh3.googleusercontent.com') && lowerUrl.match(/\d+x\d+/))) {
          results.screenshots.push(url);
        } else if (lowerUrl.includes('icon') || 
                   lowerUrl.includes('logo') || 
                   lowerUrl.includes('512x512') || 
                   lowerUrl.includes('128x128') ||
                   lowerUrl.includes('192x192')) {
          if (!results.icon || url.includes('512') || url.includes('192')) {
            results.icon = url;
          }
        }
      });
      
      // Extract videos
      results.videos = extractVideoUrls(html);
      
      // Remove duplicates
      results.screenshots = [...new Set(results.screenshots)];
      results.videos = [...new Set(results.videos)];
      
      console.log(`Found: ${results.screenshots.length} screenshots, ${results.videos.length} videos`);
      
      return results;
    }
  }
  
  return null;
}

/**
 * Try Apple App Store with curl
 */
async function crawlAppleAppStore() {
  console.log('\n=== Crawling Apple App Store ===');
  
  const searchUrl = 'https://apps.apple.com/us/search?term=agua%20caliente%20casino';
  console.log(`Searching: ${searchUrl}`);
  
  const html = fetchWithCurl(searchUrl);
  if (!html) {
    console.log('Could not fetch search page');
    return null;
  }
  
  // Look for app links
  const appLinkMatch = html.match(/href="(\/us\/app\/[^"]*\/id\d+)/i);
  if (appLinkMatch) {
    const appPath = appLinkMatch[1];
    const appUrl = `https://apps.apple.com${appPath}`;
    console.log(`Found app: ${appUrl}`);
    
    // Fetch app page
    const appHtml = fetchWithCurl(appUrl);
    if (!appHtml) return null;
    
    const results = {
      appUrl,
      screenshots: [],
      videos: [],
      icon: null,
      appName: null,
      description: null
    };
    
    // Extract app name
    const nameMatch = appHtml.match(/<h1[^>]*class=["'][^"']*product-header__title[^"']*["'][^>]*>([^<]+)<\/h1>/i) ||
                      appHtml.match(/<h1[^>]*>([^<]*agua[^<]*caliente[^<]*)<\/h1>/i);
    if (nameMatch) {
      results.appName = nameMatch[1].trim();
    }
    
    // Extract description
    const descMatch = appHtml.match(/<div[^>]*class=["'][^"']*product-review__body[^"']*["'][^>]*>([\s\S]{0,2000}?)<\/div>/i);
    if (descMatch) {
      results.description = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000);
    }
    
    // Extract images
    const imageUrls = extractImageUrls(appHtml);
    
    imageUrls.forEach(url => {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('screenshot') || 
          lowerUrl.includes('screen-shot') ||
          (lowerUrl.includes('is1-ssl.mzstatic.com') && lowerUrl.match(/\d+x\d+/))) {
        results.screenshots.push(url);
      } else if (lowerUrl.includes('icon') || 
                 lowerUrl.includes('logo') ||
                 lowerUrl.includes('1024x1024') || 
                 lowerUrl.includes('512x512')) {
        if (!results.icon || url.includes('1024')) {
          results.icon = url;
        }
      }
    });
    
    // Extract videos
    results.videos = extractVideoUrls(appHtml);
    
    // Remove duplicates
    results.screenshots = [...new Set(results.screenshots)];
    results.videos = [...new Set(results.videos)];
    
    console.log(`Found: ${results.screenshots.length} screenshots, ${results.videos.length} videos`);
    
    return results;
  }
  
  return null;
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
  
  // Download screenshots (limit to 20)
  const screenshotsToDownload = results.screenshots.slice(0, 20);
  console.log(`Downloading ${screenshotsToDownload.length} screenshots...`);
  
  for (let i = 0; i < screenshotsToDownload.length; i++) {
    const url = screenshotsToDownload[i];
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
    
    // Skip iframe URLs
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
 * Get image dimensions using identify or file command
 */
function getImageDimensions(filepath) {
  try {
    // Try identify (ImageMagick)
    const output = execSync(`identify "${filepath}" 2>/dev/null`, { encoding: 'utf8' });
    const match = output.match(/(\d+)x(\d+)/);
    if (match) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) };
    }
  } catch (e) {
    // Try file command
    try {
      const output = execSync(`file "${filepath}"`, { encoding: 'utf8' });
      const match = output.match(/(\d+)\s*x\s*(\d+)/i);
      if (match) {
        return { width: parseInt(match[1]), height: parseInt(match[2]) };
      }
    } catch (e2) {
      // Ignore
    }
  }
  return null;
}

/**
 * Save metadata
 */
async function saveMetadata(storeName, results, downloadedAssets) {
  // Get dimensions for downloaded images
  const screenshotsWithDims = downloadedAssets.screenshots.map(s => {
    const dims = getImageDimensions(s.path);
    return { ...s, dimensions: dims };
  });
  
  const iconWithDims = downloadedAssets.icon ? {
    ...downloadedAssets.icon,
    dimensions: getImageDimensions(downloadedAssets.icon.path)
  } : null;
  
  const metadata = {
    store: storeName,
    appUrl: results.appUrl || results.appId,
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
    downloadedAssets: {
      screenshots: screenshotsWithDims,
      videos: downloadedAssets.videos,
      icon: iconWithDims
    },
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
  console.log('Agua Caliente App Crawler (Enhanced)');
  console.log('='.repeat(60));
  
  const allResults = {};
  
  // Crawl Google Play Store
  const googlePlayResults = await crawlGooglePlay();
  if (googlePlayResults) {
    const downloadedAssets = await downloadStoreAssets('Google Play', googlePlayResults);
    const metadata = await saveMetadata('Google Play', googlePlayResults, downloadedAssets);
    allResults.googlePlay = metadata;
  } else {
    console.log('Could not find Agua Caliente app on Google Play Store');
  }
  
  // Crawl Apple App Store
  const appleResults = await crawlAppleAppStore();
  if (appleResults) {
    const downloadedAssets = await downloadStoreAssets('Apple App Store', appleResults);
    const metadata = await saveMetadata('Apple App Store', appleResults, downloadedAssets);
    allResults.appleAppStore = metadata;
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
  
  // Create README with findings
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  let readme = `# Agua Caliente App Assets Extraction Report\n\n`;
  readme += `**Crawl Date:** ${new Date().toISOString()}\n\n`;
  readme += `## Summary\n\n`;
  readme += `- **Total Screenshots:** ${summary.totalAssets.screenshots}\n`;
  readme += `- **Total Videos:** ${summary.totalAssets.videos}\n`;
  readme += `- **Total Icons:** ${summary.totalAssets.icons}\n\n`;
  
  if (allResults.googlePlay) {
    readme += `## Google Play Store\n\n`;
    readme += `- **App Name:** ${allResults.googlePlay.appName || 'N/A'}\n`;
    readme += `- **App URL:** ${allResults.googlePlay.appUrl || 'N/A'}\n`;
    readme += `- **Screenshots:** ${allResults.googlePlay.assets.screenshots.downloaded}\n`;
    readme += `- **Videos:** ${allResults.googlePlay.assets.videos.downloaded}\n`;
    readme += `- **Icon:** ${allResults.googlePlay.assets.icon ? 'Yes' : 'No'}\n\n`;
  }
  
  if (allResults.appleAppStore) {
    readme += `## Apple App Store\n\n`;
    readme += `- **App Name:** ${allResults.appleAppStore.appName || 'N/A'}\n`;
    readme += `- **App URL:** ${allResults.appleAppStore.appUrl || 'N/A'}\n`;
    readme += `- **Screenshots:** ${allResults.appleAppStore.assets.screenshots.downloaded}\n`;
    readme += `- **Videos:** ${allResults.appleAppStore.assets.videos.downloaded}\n`;
    readme += `- **Icon:** ${allResults.appleAppStore.assets.icon ? 'Yes' : 'No'}\n\n`;
  }
  
  readme += `## Directory Structure\n\n`;
  readme += `\`\`\`\n`;
  readme += `extracted_assets/\n`;
  readme += `├── assets/\n`;
  readme += `│   ├── google_play/\n`;
  readme += `│   │   ├── screenshots/\n`;
  readme += `│   │   ├── videos/\n`;
  readme += `│   │   └── icon.*\n`;
  readme += `│   └── apple_app_store/\n`;
  readme += `│       ├── screenshots/\n`;
  readme += `│       ├── videos/\n`;
  readme += `│       └── icon.*\n`;
  readme += `├── metadata/\n`;
  readme += `│   ├── google_play_metadata.json\n`;
  readme += `│   └── apple_app_store_metadata.json\n`;
  readme += `├── summary.json\n`;
  readme += `└── README.md\n`;
  readme += `\`\`\`\n`;
  
  await fs.writeFile(readmePath, readme);
  console.log(`README created: ${readmePath}`);
}

// Run the crawler
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

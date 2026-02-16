const axios = require('axios');
const cheerio = require('cheerio');
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
fs.ensureDirSync(path.join(ASSETS_DIR, 'graphics'));

// User agent to avoid blocking
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
        'User-Agent': USER_AGENT
      },
      timeout: 30000
    });
    
    await fs.writeFile(filepath, response.data);
    console.log(`Downloaded: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return false;
  }
}

/**
 * Get image dimensions
 */
async function getImageDimensions(filepath) {
  try {
    // Use identify command from ImageMagick if available, or node library
    const stats = await fs.stat(filepath);
    return { size: stats.size };
  } catch (error) {
    return null;
  }
}

/**
 * Crawl Google Play Store
 */
async function crawlGooglePlay() {
  console.log('\n=== Crawling Google Play Store ===');
  
  const searchTerms = [
    'agua caliente casino',
    'agua caliente',
    'agua caliente resort casino'
  ];
  
  const results = {
    appId: null,
    appName: null,
    screenshots: [],
    videos: [],
    icon: null,
    description: null,
    dimensions: null,
    metadata: {}
  };
  
  try {
    // Try direct search
    for (const term of searchTerms) {
      const searchUrl = `https://play.google.com/store/search?q=${encodeURIComponent(term)}&c=apps`;
      console.log(`Searching: ${searchUrl}`);
      
      try {
        const response = await axios.get(searchUrl, {
          headers: { 'User-Agent': USER_AGENT },
          timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Look for app links
        $('a[href*="/store/apps/details"]').each((i, elem) => {
          const href = $(elem).attr('href');
          const appIdMatch = href.match(/id=([^&]+)/);
          if (appIdMatch) {
            const appId = appIdMatch[1];
            console.log(`Found potential app ID: ${appId}`);
            
            // Check if it's agua caliente related
            const text = $(elem).text().toLowerCase();
            if (text.includes('agua') || text.includes('caliente')) {
              results.appId = appId;
              return false; // break
            }
          }
        });
        
        if (results.appId) break;
      } catch (error) {
        console.log(`Search failed for "${term}":`, error.message);
      }
    }
    
    // If we found an app ID, get details
    if (!results.appId) {
      // Try common app IDs
      const possibleIds = [
        'com.aguacaliente.casino',
        'com.aguacaliente',
        'com.aguacalientecasino',
        'com.aguacaliente.resort'
      ];
      
      for (const appId of possibleIds) {
        const appUrl = `https://play.google.com/store/apps/details?id=${appId}`;
        console.log(`Trying app ID: ${appId}`);
        
        try {
          const response = await axios.get(appUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 15000
          });
          
          if (response.data.includes('Agua Caliente') || response.data.includes('agua caliente')) {
            results.appId = appId;
            await extractGooglePlayDetails(appUrl, results);
            break;
          }
        } catch (error) {
          console.log(`App ID ${appId} not found or error:`, error.message);
        }
      }
    } else {
      const appUrl = `https://play.google.com/store/apps/details?id=${results.appId}`;
      await extractGooglePlayDetails(appUrl, results);
    }
    
  } catch (error) {
    console.error('Google Play Store crawl error:', error.message);
  }
  
  return results;
}

/**
 * Extract details from Google Play Store app page
 */
async function extractGooglePlayDetails(appUrl, results) {
  try {
    console.log(`Extracting details from: ${appUrl}`);
    const response = await axios.get(appUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract app name
    results.appName = $('h1[itemprop="name"]').text().trim() || 
                      $('h1').first().text().trim();
    
    // Extract description
    results.description = $('div[itemprop="description"]').text().trim() ||
                          $('div[data-g-id="description"]').text().trim();
    
    // Extract screenshots
    $('img[alt*="Screenshot"], img[data-src*="screenshot"], img[src*="screenshot"]').each((i, elem) => {
      let imgUrl = $(elem).attr('data-src') || $(elem).attr('src');
      if (imgUrl && !imgUrl.startsWith('http')) {
        imgUrl = 'https:' + imgUrl;
      }
      if (imgUrl && imgUrl.includes('screenshot')) {
        results.screenshots.push(imgUrl);
      }
    });
    
    // Extract icon
    const iconUrl = $('img[itemprop="image"]').attr('src') ||
                    $('img[alt*="Icon"]').attr('src') ||
                    $('img[alt*="icon"]').attr('src');
    if (iconUrl) {
      results.icon = iconUrl.startsWith('http') ? iconUrl : 'https:' + iconUrl;
    }
    
    // Extract video
    $('video source, iframe[src*="youtube"], iframe[src*="video"]').each((i, elem) => {
      const videoUrl = $(elem).attr('src');
      if (videoUrl) {
        results.videos.push(videoUrl);
      }
    });
    
    // Extract metadata
    $('div[itemprop="operatingSystem"]').each((i, elem) => {
      results.metadata.os = $(elem).text().trim();
    });
    
    $('div[itemprop="contentRating"]').each((i, elem) => {
      results.metadata.rating = $(elem).text().trim();
    });
    
    // Try to find app dimensions from JSON-LD or meta tags
    const jsonLd = $('script[type="application/ld+json"]').html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data.aggregateRating) {
          results.metadata.rating = data.aggregateRating.ratingValue;
        }
        if (data.operatingSystem) {
          results.metadata.os = data.operatingSystem;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    console.log(`Found ${results.screenshots.length} screenshots`);
    console.log(`Found ${results.videos.length} videos`);
    
  } catch (error) {
    console.error('Error extracting Google Play details:', error.message);
  }
}

/**
 * Crawl Apple App Store
 */
async function crawlAppleAppStore() {
  console.log('\n=== Crawling Apple App Store ===');
  
  const results = {
    appId: null,
    appName: null,
    screenshots: [],
    videos: [],
    icon: null,
    description: null,
    dimensions: null,
    metadata: {}
  };
  
  try {
    const searchTerms = [
      'agua caliente casino',
      'agua caliente',
      'agua caliente resort casino'
    ];
    
    for (const term of searchTerms) {
      const searchUrl = `https://apps.apple.com/us/search?term=${encodeURIComponent(term)}`;
      console.log(`Searching: ${searchUrl}`);
      
      try {
        const response = await axios.get(searchUrl, {
          headers: { 'User-Agent': USER_AGENT },
          timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Look for app links
        $('a[href*="/app/"]').each((i, elem) => {
          const href = $(elem).attr('href');
          const text = $(elem).text().toLowerCase();
          
          if (text.includes('agua') || text.includes('caliente')) {
            const appIdMatch = href.match(/\/app\/[^/]+\/id(\d+)/);
            if (appIdMatch) {
              results.appId = appIdMatch[1];
              const appUrl = href.startsWith('http') ? href : `https://apps.apple.com${href}`;
              console.log(`Found app: ${appUrl}`);
              extractAppleAppStoreDetails(appUrl, results);
              return false; // break
            }
          }
        });
        
        if (results.appId) break;
      } catch (error) {
        console.log(`Search failed for "${term}":`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Apple App Store crawl error:', error.message);
  }
  
  return results;
}

/**
 * Extract details from Apple App Store app page
 */
async function extractAppleAppStoreDetails(appUrl, results) {
  try {
    console.log(`Extracting details from: ${appUrl}`);
    const response = await axios.get(appUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 15000
    });
  
    const $ = cheerio.load(response.data);
    
    // Extract app name
    results.appName = $('h1.product-header__title').text().trim() ||
                      $('h1').first().text().trim();
    
    // Extract description
    results.description = $('div.product-review__body, div.we-truncate').text().trim();
    
    // Extract screenshots
    $('picture source, img[src*="screenshot"], img[alt*="Screenshot"]').each((i, elem) => {
      let imgUrl = $(elem).attr('srcset') || $(elem).attr('src') || $(elem).attr('data-src');
      if (imgUrl) {
        // Extract highest resolution URL from srcset
        if (imgUrl.includes(',')) {
          const urls = imgUrl.split(',');
          imgUrl = urls[urls.length - 1].trim().split(' ')[0];
        }
        if (!imgUrl.startsWith('http')) {
          imgUrl = 'https:' + imgUrl;
        }
        results.screenshots.push(imgUrl);
      }
    });
    
    // Extract icon
    const iconUrl = $('img[alt*="App Icon"], picture source[media*="icon"]').attr('srcset') ||
                    $('img[alt*="App Icon"]').attr('src');
    if (iconUrl) {
      results.icon = iconUrl.includes(',') 
        ? iconUrl.split(',')[iconUrl.split(',').length - 1].trim().split(' ')[0]
        : iconUrl;
      if (!results.icon.startsWith('http')) {
        results.icon = 'https:' + results.icon;
      }
    }
    
    // Extract video preview
    $('video source, iframe[src*="video"]').each((i, elem) => {
      const videoUrl = $(elem).attr('src');
      if (videoUrl) {
        results.videos.push(videoUrl);
      }
    });
    
    console.log(`Found ${results.screenshots.length} screenshots`);
    console.log(`Found ${results.videos.length} videos`);
    
  } catch (error) {
    console.error('Error extracting Apple App Store details:', error.message);
  }
}

/**
 * Download all assets
 */
async function downloadAssets(storeName, results) {
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
  for (let i = 0; i < results.screenshots.length; i++) {
    const url = results.screenshots[i];
    const ext = path.extname(url.split('?')[0]) || '.jpg';
    const filename = `screenshot_${i + 1}${ext}`;
    const filepath = path.join(storeDir, 'screenshots', filename);
    
    if (await downloadFile(url, filepath)) {
      const dimensions = await getImageDimensions(filepath);
      downloadedAssets.screenshots.push({
        url,
        filename,
        path: filepath,
        dimensions
      });
    }
  }
  
  // Download icon
  if (results.icon) {
    const ext = path.extname(results.icon.split('?')[0]) || '.png';
    const filename = `icon${ext}`;
    const filepath = path.join(storeDir, filename);
    
    if (await downloadFile(results.icon, filepath)) {
      const dimensions = await getImageDimensions(filepath);
      downloadedAssets.icon = {
        url: results.icon,
        filename,
        path: filepath,
        dimensions
      };
    }
  }
  
  // Download videos
  for (let i = 0; i < results.videos.length; i++) {
    const url = results.videos[i];
    const ext = path.extname(url.split('?')[0]) || '.mp4';
    const filename = `video_${i + 1}${ext}`;
    const filepath = path.join(storeDir, 'videos', filename);
    
    if (await downloadFile(url, filepath)) {
      downloadedAssets.videos.push({
        url,
        filename,
        path: filepath
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
    appId: results.appId,
    appName: results.appName,
    description: results.description,
    metadata: results.metadata,
    assets: {
      screenshots: downloadedAssets.screenshots.length,
      videos: downloadedAssets.videos.length,
      icon: downloadedAssets.icon ? 1 : 0
    },
    downloadedAssets: downloadedAssets,
    crawlDate: new Date().toISOString()
  };
  
  const metadataPath = path.join(METADATA_DIR, `${storeName.toLowerCase().replace(/\s+/g, '_')}_metadata.json`);
  await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
  console.log(`Metadata saved to: ${metadataPath}`);
  
  return metadata;
}

/**
 * Main function
 */
async function main() {
  console.log('Starting Agua Caliente App Crawler...\n');
  
  const allResults = {};
  
  // Crawl Google Play Store
  const googlePlayResults = await crawlGooglePlay();
  if (googlePlayResults.appId || googlePlayResults.screenshots.length > 0) {
    const downloadedAssets = await downloadAssets('Google Play', googlePlayResults);
    const metadata = await saveMetadata('Google Play', googlePlayResults, downloadedAssets);
    allResults.googlePlay = metadata;
  }
  
  // Crawl Apple App Store
  const appleResults = await crawlAppleAppStore();
  if (appleResults.appId || appleResults.screenshots.length > 0) {
    const downloadedAssets = await downloadAssets('Apple App Store', appleResults);
    const metadata = await saveMetadata('Apple App Store', appleResults, downloadedAssets);
    allResults.appleAppStore = metadata;
  }
  
  // Create summary report
  const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
  await fs.writeJSON(summaryPath, {
    crawlDate: new Date().toISOString(),
    results: allResults,
    totalAssets: {
      screenshots: (allResults.googlePlay?.assets?.screenshots || 0) + (allResults.appleAppStore?.assets?.screenshots || 0),
      videos: (allResults.googlePlay?.assets?.videos || 0) + (allResults.appleAppStore?.assets?.videos || 0),
      icons: (allResults.googlePlay?.assets?.icon || 0) + (allResults.appleAppStore?.assets?.icon || 0)
    }
  }, { spaces: 2 });
  
  console.log('\n=== Crawl Complete ===');
  console.log(`Summary saved to: ${summaryPath}`);
  console.log(`Assets directory: ${ASSETS_DIR}`);
  console.log(`Metadata directory: ${METADATA_DIR}`);
}

// Run the crawler
main().catch(console.error);

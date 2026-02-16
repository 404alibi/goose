const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Output directory for scraped data
const OUTPUT_DIR = path.join(__dirname, 'thisvid_data');
const VIDEOS_DIR = path.join(OUTPUT_DIR, 'videos');
const METADATA_DIR = path.join(OUTPUT_DIR, 'metadata');

// Ensure output directories exist
fs.ensureDirSync(VIDEOS_DIR);
fs.ensureDirSync(METADATA_DIR);

const BASE_URL = 'https://thisvid.com/gay-newest';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// State file to track progress
const STATE_FILE = path.join(OUTPUT_DIR, 'scraper_state.json');

/**
 * Load scraper state
 */
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return fs.readJSONSync(STATE_FILE);
    }
  } catch (error) {
    console.log('No existing state found, starting fresh');
  }
  return {
    lastPage: 0,
    lastVideoIndex: 0,
    totalVideos: 0,
    videos: []
  };
}

/**
 * Save scraper state
 */
function saveState(state) {
  fs.writeJSONSync(STATE_FILE, state, { spaces: 2 });
}

/**
 * Wait for a specified amount of time
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract video data from HTML
 */
function extractVideoData(html) {
  try {
    const $ = cheerio.load(html);
    const videos = [];
    const seenUrls = new Set();
    
    // Try multiple selectors to find video links
    const selectors = [
      'a[href*="/videos/"]',
      'a[href*="/watch"]',
      '.video-item a',
      '.thumb a',
      '[class*="video"] a',
      '[class*="thumb"] a'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const $link = $(elem);
        let href = $link.attr('href');
        
        if (!href) {
          // Try parent link
          const parent = $link.parent('a');
          if (parent.length) {
            href = parent.attr('href');
          }
        }
        
        if (href && (href.includes('/videos/') || href.includes('/watch')) && !seenUrls.has(href)) {
          seenUrls.add(href);
          
          const title = $link.attr('title') || 
                       $link.text().trim() || 
                       $link.find('img').attr('alt') ||
                       $link.find('[alt]').attr('alt') ||
                       'Untitled';
          
          const thumbnail = $link.find('img').attr('src') ||
                           $link.find('img').attr('data-src') ||
                           $link.find('img').attr('data-lazy-src') ||
                           $link.closest('.thumb, .video-item').find('img').attr('src') ||
                           null;
          
          // Make URL absolute
          let fullUrl = href;
          if (!href.startsWith('http')) {
            fullUrl = href.startsWith('/') ? `https://thisvid.com${href}` : `https://thisvid.com/${href}`;
          }
          
          videos.push({
            url: fullUrl,
            title: title.substring(0, 200).trim(), // Limit title length
            thumbnail: thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `https://thisvid.com${thumbnail}`) : null,
            scrapedAt: new Date().toISOString()
          });
        }
      });
    });
    
    return videos;
  } catch (error) {
    console.error('Error extracting video data:', error.message);
    return [];
  }
}

/**
 * Check if there's a next page and get URL
 */
function getNextPageInfo(html, currentPage) {
  try {
    const $ = cheerio.load(html);
    
    // Look for pagination elements
    const nextButton = $('a[rel="next"]').first() ||
                      $('.pagination a:last-child').first() ||
                      $('[class*="next"]').first() ||
                      $('a').filter((i, elem) => {
                        const text = $(elem).text().toLowerCase();
                        return text.includes('next') || text.includes('>');
                      }).first();
    
    if (nextButton && nextButton.length) {
      let href = nextButton.attr('href');
      if (href) {
        if (!href.startsWith('http')) {
          href = href.startsWith('/') ? `https://thisvid.com${href}` : `https://thisvid.com/${href}`;
        }
        return { hasNext: true, nextUrl: href };
      }
    }
    
    // Fallback: construct URL based on page number
    if (currentPage > 0) {
      return { hasNext: true, nextUrl: `${BASE_URL}?page=${currentPage + 1}` };
    }
    
    return { hasNext: false, nextUrl: null };
  } catch (error) {
    return { hasNext: false, nextUrl: null };
  }
}

/**
 * Scrape a single page
 */
async function scrapePage(url, pageNumber) {
  console.log(`\n[Page ${pageNumber}] Scraping: ${url}`);
  
  try {
    // Fetch page with axios
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://thisvid.com/',
        'Connection': 'keep-alive'
      },
      timeout: 30000,
      maxRedirects: 5
    });
    
    const html = response.data;
    
    // Extract video data
    const videos = extractVideoData(html);
    console.log(`Found ${videos.length} videos on page ${pageNumber}`);
    
    // Check for next page
    const pageInfo = getNextPageInfo(html, pageNumber);
    
    return {
      pageNumber,
      url,
      videos,
      hasNext: pageInfo.hasNext,
      nextUrl: pageInfo.nextUrl
    };
  } catch (error) {
    console.error(`Error scraping page ${pageNumber}:`, error.message);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
    }
    return {
      pageNumber,
      url,
      videos: [],
      hasNext: false,
      nextUrl: null,
      error: error.message
    };
  }
}

/**
 * Save video metadata
 */
async function saveVideoMetadata(videos, pageNumber) {
  const metadata = {
    pageNumber,
    scrapedAt: new Date().toISOString(),
    videoCount: videos.length,
    videos: videos
  };
  
  const metadataPath = path.join(METADATA_DIR, `page_${pageNumber}_metadata.json`);
  await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
  console.log(`Saved metadata for page ${pageNumber} to ${metadataPath}`);
}

/**
 * Main scraping function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('ThisVid.com Scraper - Gay Newest');
  console.log('='.repeat(60));
  
  const state = loadState();
  console.log(`Loaded state: ${state.totalVideos} videos scraped, last page: ${state.lastPage}`);
  
  try {
    console.log('\nStarting scraper...');
    
    let currentPage = state.lastPage || 1;
    let allVideos = [...state.videos];
    let continueScraping = true;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;
    
    while (continueScraping) {
      const url = currentPage === 1 ? BASE_URL : `${BASE_URL}?page=${currentPage}`;
      
      const result = await scrapePage(url, currentPage);
      
      if (result.videos.length > 0) {
        allVideos.push(...result.videos);
        await saveVideoMetadata(result.videos, currentPage);
        consecutiveErrors = 0;
        
        // Update state
        state.lastPage = currentPage;
        state.totalVideos = allVideos.length;
        state.videos = allVideos;
        saveState(state);
        
        console.log(`Total videos collected: ${allVideos.length}`);
        
        // Check if we should continue
        if (!result.hasNext && !result.nextUrl) {
          console.log('No more pages found. Scraping complete.');
          continueScraping = false;
        } else {
          currentPage++;
          // Add delay between pages
          await sleep(3000);
        }
      } else {
        consecutiveErrors++;
        console.log(`No videos found on page ${currentPage}. Errors: ${consecutiveErrors}/${maxConsecutiveErrors}`);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.log('Too many consecutive errors. Stopping scraper.');
          continueScraping = false;
        } else {
          currentPage++;
          await sleep(5000); // Longer delay on error
        }
      }
      
      // Limit pages for safety (remove or increase if needed)
      // Removed page limit to continue scraping
    }
    
    // Create summary
    const summary = {
      scrapedAt: new Date().toISOString(),
      totalVideos: allVideos.length,
      totalPages: currentPage - 1,
      baseUrl: BASE_URL,
      videos: allVideos
    };
    
    const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
    await fs.writeJSON(summaryPath, summary, { spaces: 2 });
    
    console.log('\n' + '='.repeat(60));
    console.log('Scraping Complete!');
    console.log('='.repeat(60));
    console.log(`Total videos scraped: ${allVideos.length}`);
    console.log(`Total pages scraped: ${currentPage - 1}`);
    console.log(`Summary saved to: ${summaryPath}`);
    console.log(`Metadata directory: ${METADATA_DIR}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  }
}

// Run the scraper
main().catch(error => {
  console.error('Scraper failed:', error);
  process.exit(1);
});

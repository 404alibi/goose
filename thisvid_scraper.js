#!/usr/bin/env node

/**
 * ThisVid.com Gay Newest Videos Scraper
 * Scrapes video information from thisvid.com/gay-newest
 */

const https = require('https');
const fs = require('fs');

class ThisVidScraper {
  constructor() {
    this.baseUrl = 'thisvid.com';
    this.path = '/gay-newest';
    this.results = [];
  }

  /**
   * Fetch HTML content from the URL
   */
  async fetchPage(page = 1, redirectCount = 0) {
    return new Promise((resolve, reject) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      const path = page > 1 ? `${this.path}/${page}/` : this.path;
      
      const options = {
        hostname: this.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
        }
      };

      console.log(`Fetching: https://${this.baseUrl}${path}`);

      const req = https.request(options, (res) => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
          const location = res.headers.location;
          console.log(`Redirecting to: ${location}`);
          
          if (location) {
            // Parse the redirect URL
            const url = new URL(location, `https://${this.baseUrl}`);
            this.baseUrl = url.hostname;
            this.path = url.pathname;
            
            // Follow the redirect
            this.fetchPage(page, redirectCount + 1).then(resolve).catch(reject);
            return;
          }
        }

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Parse video information from HTML
   */
  parseVideos(html) {
    const videos = [];
    
    // Extract video items - looking for common patterns in video listing pages
    // This regex looks for video containers with title, link, and metadata
    const videoBlockRegex = /<div[^>]*class="[^"]*(?:video-item|thumb-block|item)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const titleRegex = /<a[^>]*title="([^"]*)"[^>]*>|<h\d[^>]*>([^<]*)<\/h\d>/i;
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/i;
    const durationRegex = /(\d+:\d+)/;
    const viewsRegex = /(\d+(?:,\d+)*)\s*(?:views|Views)/i;
    const uploaderRegex = /(?:by|By)\s*<a[^>]*>([^<]*)<\/a>|(?:uploader|Uploader)[^>]*>([^<]*)</i;

    let match;
    let blockMatches = html.match(videoBlockRegex);
    
    if (!blockMatches) {
      // Try alternative pattern - direct video links
      const linkPattern = /<a[^>]*href="(\/videos\/[^"]*)"[^>]*title="([^"]*)"[^>]*>/gi;
      while ((match = linkPattern.exec(html)) !== null) {
        videos.push({
          title: this.decodeHtml(match[2]),
          url: `https://${this.baseUrl}${match[1]}`,
          duration: null,
          views: null,
          uploader: null
        });
      }
    } else {
      blockMatches.forEach(block => {
        const titleMatch = block.match(titleRegex);
        const linkMatch = block.match(linkRegex);
        const durationMatch = block.match(durationRegex);
        const viewsMatch = block.match(viewsRegex);
        const uploaderMatch = block.match(uploaderRegex);

        if (titleMatch && linkMatch) {
          const title = titleMatch[1] || titleMatch[2];
          let url = linkMatch[1];
          
          // Make URL absolute if relative
          if (url && url.startsWith('/')) {
            url = `https://${this.baseUrl}${url}`;
          }

          videos.push({
            title: this.decodeHtml(title),
            url: url,
            duration: durationMatch ? durationMatch[1] : null,
            views: viewsMatch ? viewsMatch[1] : null,
            uploader: uploaderMatch ? (uploaderMatch[1] || uploaderMatch[2]) : null
          });
        }
      });
    }

    return videos;
  }

  /**
   * Decode HTML entities
   */
  decodeHtml(html) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
    };
    
    return html.replace(/&[^;]+;/g, entity => entities[entity] || entity);
  }

  /**
   * Scrape multiple pages
   */
  async scrape(numPages = 1, saveHtml = false) {
    console.log(`Starting scrape of ${numPages} page(s)...\n`);

    for (let page = 1; page <= numPages; page++) {
      try {
        const html = await this.fetchPage(page);
        
        // Optionally save HTML for debugging
        if (saveHtml && page === 1) {
          fs.writeFileSync('thisvid_page.html', html);
          console.log('Saved HTML to thisvid_page.html for debugging');
        }
        
        const videos = this.parseVideos(html);
        
        console.log(`Page ${page}: Found ${videos.length} videos`);
        this.results.push(...videos);

        // Be respectful - add delay between requests
        if (page < numPages) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error scraping page ${page}:`, error.message);
      }
    }

    return this.results;
  }

  /**
   * Save results to JSON file
   */
  saveResults(filename = 'thisvid_results.json') {
    const data = {
      scraped_at: new Date().toISOString(),
      total_videos: this.results.length,
      source: `https://${this.baseUrl}${this.path}`,
      videos: this.results
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\nResults saved to ${filename}`);
    return filename;
  }

  /**
   * Display summary
   */
  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('SCRAPING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total videos scraped: ${this.results.length}`);
    console.log(`Source: https://${this.baseUrl}${this.path}`);
    
    if (this.results.length > 0) {
      console.log('\nFirst 5 videos:');
      this.results.slice(0, 5).forEach((video, index) => {
        console.log(`\n${index + 1}. ${video.title}`);
        console.log(`   URL: ${video.url}`);
        if (video.duration) console.log(`   Duration: ${video.duration}`);
        if (video.views) console.log(`   Views: ${video.views}`);
        if (video.uploader) console.log(`   Uploader: ${video.uploader}`);
      });
    }
    console.log('\n' + '='.repeat(60));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const numPages = parseInt(args[0]) || 1;
  const saveHtml = args.includes('--debug');

  const scraper = new ThisVidScraper();
  
  try {
    await scraper.scrape(numPages, saveHtml);
    scraper.displaySummary();
    scraper.saveResults();
    
    console.log('\nScraping completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nScraping failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = ThisVidScraper;

# ThisVid.com Gay Newest Videos Scraper

A Node.js web scraper for extracting video information from thisvid.com/gay-newest.

## Features

- Scrapes video titles, URLs, and durations from thisvid.com/gay-newest
- Supports multi-page scraping
- Handles HTTP redirects automatically
- Respectful scraping with delays between requests
- Exports results to JSON format
- Debug mode to save HTML for analysis

## Requirements

- Node.js 22+ (already available in this environment)
- No external dependencies (uses built-in `https` and `fs` modules)

## Usage

### Basic Usage

Scrape 1 page (default):
```bash
node thisvid_scraper.js
```

### Scrape Multiple Pages

Scrape 5 pages:
```bash
node thisvid_scraper.js 5
```

Scrape 10 pages:
```bash
node thisvid_scraper.js 10
```

### Debug Mode

Save HTML for debugging:
```bash
node thisvid_scraper.js 1 --debug
```

This will save the HTML content to `thisvid_page.html` for analysis.

## Output

The scraper generates a JSON file (`thisvid_results.json`) with the following structure:

```json
{
  "scraped_at": "2026-02-16T02:28:00.000Z",
  "total_videos": 15,
  "source": "https://thisvid.com/gay-newest/",
  "videos": [
    {
      "title": "Video Title",
      "url": "https://thisvid.com/videos/video-slug/",
      "duration": "1:43",
      "views": null,
      "uploader": null
    }
  ]
}
```

## Example Output

```
Starting scrape of 5 page(s)...

Fetching: https://thisvid.com/gay-newest
Redirecting to: https://thisvid.com/gay-newest/
Fetching: https://thisvid.com/gay-newest/
Page 1: Found 3 videos
Fetching: https://thisvid.com/gay-newest//2/
Page 2: Found 3 videos
...

============================================================
SCRAPING SUMMARY
============================================================
Total videos scraped: 15
Source: https://thisvid.com/gay-newest/

First 5 videos:

1. Lost Bet - Bigger Guy gets pelted with balls naked
   URL: https://thisvid.com/videos/lost-bet-bigger-guy-gets-pelted-with-balls-naked/
   Duration: 1:43

2. The only good use for its head
   URL: https://thisvid.com/videos/the-only-good-use-for-its-head/
   Duration: 0:42
...
============================================================

Results saved to thisvid_results.json

Scraping completed successfully!
```

## Features Explained

### Redirect Handling
The scraper automatically follows HTTP redirects (301, 302, 303, 307, 308) up to 5 levels deep.

### Rate Limiting
A 2-second delay is added between page requests to be respectful to the server.

### HTML Parsing
The scraper uses regex patterns to extract:
- Video titles
- Video URLs
- Video durations
- View counts (when available)
- Uploader information (when available)

### Error Handling
- Gracefully handles HTTP errors
- Continues scraping even if individual pages fail
- Provides detailed error messages

## Programmatic Usage

You can also use the scraper as a module:

```javascript
const ThisVidScraper = require('./thisvid_scraper.js');

async function example() {
  const scraper = new ThisVidScraper();
  
  // Scrape 3 pages
  await scraper.scrape(3);
  
  // Get results
  console.log(scraper.results);
  
  // Save to custom filename
  scraper.saveResults('my_results.json');
}

example();
```

## Notes

- The scraper currently finds approximately 3 videos per page
- This may vary depending on the website's HTML structure
- The parsing logic can be enhanced by analyzing the HTML structure with `--debug` mode

## Limitations

- Views and uploader information may not always be available depending on the page structure
- The number of videos per page depends on the website's layout
- Some metadata fields may be null if not found in the HTML

## Ethical Considerations

- This scraper includes delays between requests to avoid overwhelming the server
- Use responsibly and in accordance with the website's terms of service
- Consider the website's robots.txt file
- Do not use scraped data for commercial purposes without permission

## Troubleshooting

### No videos found
Run with `--debug` flag to save the HTML and inspect the page structure:
```bash
node thisvid_scraper.js 1 --debug
```

### Connection errors
- Check your internet connection
- The website may be blocking automated requests
- Try increasing the delay between requests

## License

This scraper is provided as-is for educational purposes.

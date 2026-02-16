# ThisVid.com Scraper

A Python-based web scraper for extracting video metadata from thisvid.com/gay-newest.

## Overview

This scraper extracts video information from the "Gay Newest" section of ThisVid.com, including:
- Video URLs and IDs
- Titles
- Thumbnails
- Duration
- View counts
- Upload timestamps
- Quality indicators (HD, etc.)
- Rating percentages

## Files

- **scraper_thisvid.py** - Main scraper implementation
- **thisvid_scraped_data.json** - Output file containing scraped data
- **test_fetch.py** - Utility script for debugging HTML structure
- **thisvid_raw.html** - Raw HTML snapshot for inspection

## Requirements

```bash
python3 -m pip install requests beautifulsoup4 --user
```

## Usage

### Basic Usage

```bash
python3 scraper_thisvid.py
```

This will scrape the first 3 pages (default) and save results to `thisvid_scraped_data.json`.

### Customization

Edit the `main()` function in `scraper_thisvid.py` to adjust:

```python
# Change number of pages to scrape
num_pages = 5  # Default is 3

# Change delay between requests (seconds)
videos = scraper.scrape_multiple_pages(num_pages=num_pages, delay=2.0)

# Change output filename
output_file = scraper.save_to_json(videos, filename="custom_output.json")
```

## Output Format

The scraper generates a JSON file with the following structure:

```json
{
  "source": "https://thisvid.com/gay-newest",
  "scraped_at": "2026-02-16T02:27:27.932262",
  "total_videos": 36,
  "videos": [
    {
      "url": "https://thisvid.com/videos/example-video/",
      "id": "example-video",
      "thumbnail": "https://media.thisvid.com/...",
      "title": "Example Video Title",
      "duration": "1:43",
      "views": "1234",
      "uploaded": "1 minute ago",
      "quality": "HD",
      "percent": "0%",
      "scraped_at": "2026-02-16T02:27:23.281906"
    }
  ]
}
```

## Implementation Details

### HTML Structure

The scraper targets the following HTML elements:
- **Container**: `div.thumbs-items`
- **Video items**: `a.tumbpu` (individual video links)
- **Thumbnail**: `img.lazy-load` with `data-original` attribute
- **Title**: `span.title` or `a[title]` attribute
- **Duration**: `span.duration`
- **Views**: `span.view`
- **Upload time**: `span.date`
- **Quality**: `span.quality`
- **Rating**: `span.percent`

### Key Features

1. **User-Agent Spoofing**: Uses browser-like headers to avoid blocking
2. **Rate Limiting**: 2-second delay between page requests
3. **Error Handling**: Graceful handling of missing elements and network errors
4. **Lazy Loading Support**: Extracts images from `data-original` attributes
5. **URL Normalization**: Converts relative URLs to absolute URLs

### Class: `ThisVidScraper`

#### Methods

- `__init__(base_url)` - Initialize scraper with base URL
- `fetch_page(page_num)` - Fetch HTML content for a specific page
- `parse_video_item(item)` - Extract metadata from a single video element
- `scrape_page(page_num)` - Scrape all videos from a single page
- `scrape_multiple_pages(num_pages, delay)` - Scrape multiple pages with delay
- `save_to_json(videos, filename)` - Save scraped data to JSON file

## Example Output

Successfully scraped 36 videos across 3 pages:

```
Starting ThisVid scraper for /gay-newest
Scraping page 1/3...
Fetching: https://thisvid.com/gay-newest
Found 12 video items on page 1
Scraping page 2/3...
Fetching: https://thisvid.com/gay-newest/2
Found 12 video items on page 2
Scraping page 3/3...
Fetching: https://thisvid.com/gay-newest/3
Found 12 video items on page 3

Total videos scraped: 36
Saved 36 videos to thisvid_scraped_data.json
```

## Debug Tools

### test_fetch.py

Use this script to inspect the HTML structure and verify selectors:

```bash
python3 test_fetch.py
```

This will:
- Fetch the first page
- Save raw HTML to `thisvid_raw.html`
- Test various CSS selectors
- Print discovered HTML class names

## Notes

- The scraper respects rate limiting with 2-second delays between requests
- Only scrapes publicly accessible data
- Does not require authentication
- Does not download video files, only metadata
- Designed for educational and research purposes

## Date Created

2026-02-16

## Author

Automated scraper implementation

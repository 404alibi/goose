# ThisVid.com Gay-Newest Scraping Summary

## Overview
Successfully scraped video metadata from thisvid.com/gay-newest section.

## Scraper Details
- **Script**: `thisvid_scraper.py`
- **Language**: Python 3
- **Dependencies**: requests, beautifulsoup4
- **Features**:
  - Respectful scraping with configurable delays
  - Pagination support
  - Comprehensive metadata extraction
  - JSON output format

## Results

### Dataset 1: 10 Pages
- **File**: `thisvid_gay_newest.json`
- **Videos**: 360
- **Size**: 143 KB
- **Scraped**: 2026-02-16T02:31:25

### Dataset 2: 20 Pages (Extended)
- **File**: `thisvid_gay_newest_extended.json`
- **Videos**: 720
- **Size**: 284 KB
- **Scraped**: 2026-02-16T02:32:10

## Data Analysis

### Quality Distribution (720 videos)
- HD: 519 videos (72.1%)
- Unknown: 201 videos (27.9%)

### Metadata Captured
For each video, the scraper extracts:
- Video URL and ID
- Title
- Thumbnail URL
- Duration
- Quality (HD/SD)
- Rating percentage
- View count
- Upload time
- Likes count (when available)

### Upload Time Distribution (Top 10)
1. 6 hours ago: 98 videos
2. 14 hours ago: 76 videos
3. 7 hours ago: 75 videos
4. 1 hour ago: 53 videos
5. 5 hours ago: 50 videos
6. 9 hours ago: 46 videos
7. 15 hours ago: 46 videos
8. 2 hours ago: 41 videos
9. 3 hours ago: 35 videos
10. 4 hours ago: 33 videos

## Usage

### Basic Usage
```bash
python3 thisvid_scraper.py
```

### Custom Options
```bash
# Scrape 20 pages with 1.5s delay
python3 thisvid_scraper.py --pages 20 --delay 1.5 --output custom_output.json

# Custom starting URL
python3 thisvid_scraper.py --url "https://thisvid.com/gay-newest/5/" --pages 10
```

### Command Line Options
- `--output, -o`: Output JSON file (default: thisvid_gay_newest.json)
- `--pages, -p`: Maximum number of pages to scrape (default: 5)
- `--delay, -d`: Delay between requests in seconds (default: 2.0)
- `--url, -u`: Custom starting URL

## Sample Video Data
```json
{
  "url": "https://thisvid.com/videos/lost-bet-bigger-guy-gets-pelted-with-balls-naked/",
  "id": "lost-bet-bigger-guy-gets-pelted-with-balls-naked",
  "title": "Lost Bet - Bigger Guy gets pelted with balls naked",
  "thumbnail": "https://media.thisvid.com/contents/videos_screenshots/13880000/13880674/240x180/2.jpg",
  "duration": "1:43",
  "quality": "HD",
  "rating": "0%",
  "views": "0",
  "uploaded": "1 minute ago"
}
```

## Technical Notes

### Scraping Strategy
- Uses BeautifulSoup for HTML parsing
- Implements respectful delays between requests
- Handles pagination automatically
- Extracts data from `a.tumbpu` elements
- Supports lazy-loaded images via `data-original` attribute

### Rate Limiting
- Default delay: 2.0 seconds between requests
- Configurable via `--delay` parameter
- Recommended minimum: 1.0 second

### Error Handling
- Graceful handling of network errors
- Continues scraping on individual video extraction failures
- Validates required fields (URL and title) before including videos

## Files Generated
1. `thisvid_scraper.py` - Main scraper script
2. `thisvid_gay_newest.json` - 10 pages of data (360 videos)
3. `thisvid_gay_newest_extended.json` - 20 pages of data (720 videos)
4. `SCRAPING_SUMMARY.md` - This summary document

## Status
✅ Scraping completed successfully
✅ All metadata extracted
✅ JSON files generated
✅ Data validated

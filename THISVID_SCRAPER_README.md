# ThisVid.com Gay-Newest Scraper

A Python-based web scraper for extracting video metadata from the thisvid.com/gay-newest section. This scraper uses only Python's standard library (no external dependencies required) and can scrape single or multiple pages of video listings.

## Features

- ✅ **Zero dependencies** - Uses only Python standard library
- ✅ **Multi-page scraping** - Scrape 1 to N pages with configurable delays
- ✅ **Multiple output formats** - JSON and CSV export
- ✅ **Comprehensive metadata** - Extracts title, URL, duration, quality, rating, views, upload time, and thumbnails
- ✅ **Error handling** - Retry logic and graceful failure handling
- ✅ **Configurable** - Command-line arguments for flexible usage
- ✅ **Respectful scraping** - Built-in delays between requests

## Requirements

- Python 3.6 or higher
- Internet connection
- No external libraries required (uses standard library only)

## Installation

No installation needed! Just download the script:

```bash
# Download the scraper
curl -O https://raw.githubusercontent.com/yourusername/yourrepo/main/thisvid_scraper.py

# Make it executable (optional)
chmod +x thisvid_scraper.py
```

Or simply clone this repository:

```bash
git clone https://github.com/yourusername/yourrepo.git
cd yourrepo
```

## Usage

### Basic Usage

Scrape the first page (default):

```bash
python3 thisvid_scraper.py
```

This will create two files:
- `thisvid_gay_newest.json` - JSON format
- `thisvid_gay_newest.csv` - CSV format

### Advanced Usage

#### Scrape Multiple Pages

```bash
# Scrape first 5 pages
python3 thisvid_scraper.py --pages 5

# Scrape pages 3-7 (5 pages starting from page 3)
python3 thisvid_scraper.py --start 3 --pages 5

# Scrape 10 pages with 3-second delay between requests
python3 thisvid_scraper.py --pages 10 --delay 3.0
```

#### Custom Output Files

```bash
# Custom output filenames
python3 thisvid_scraper.py --pages 3 --output my_videos.json --csv my_videos.csv

# Using short flags
python3 thisvid_scraper.py --pages 3 -o videos.json -c videos.csv
```

#### Complete Example

```bash
# Scrape 5 pages starting from page 2, with 2.5s delay, custom output
python3 thisvid_scraper.py --start 2 --pages 5 --delay 2.5 -o result.json -c result.csv
```

### Command-Line Arguments

| Argument | Short | Default | Description |
|----------|-------|---------|-------------|
| `--pages` | - | `1` | Number of pages to scrape |
| `--start` | - | `1` | Starting page number |
| `--output` | `-o` | `thisvid_gay_newest.json` | Output JSON filename |
| `--csv` | `-c` | `thisvid_gay_newest.csv` | Output CSV filename |
| `--delay` | - | `2.0` | Delay between requests (seconds) |
| `--help` | `-h` | - | Show help message |

## Output Format

### JSON Structure

```json
[
  {
    "url": "https://thisvid.com/videos/example-video/",
    "title": "Example Video Title",
    "quality": "HD",
    "duration": "10:30",
    "rating": "85%",
    "views": "1234",
    "upload_time": "2 hours ago",
    "thumbnail": "https://media.thisvid.com/contents/videos_screenshots/.../2.jpg",
    "video_id": "example-video",
    "page_number": 1,
    "scraped_at": "2026-02-16T02:27:44.907481"
  }
]
```

### CSV Format

CSV file with the following columns:

| Column | Description |
|--------|-------------|
| `video_id` | Unique video identifier |
| `title` | Video title |
| `url` | Full URL to the video page |
| `duration` | Video duration (MM:SS or H:MM:SS) |
| `quality` | Video quality (HD, SD, or empty) |
| `rating` | User rating percentage (0%-100%) |
| `views` | Number of views |
| `upload_time` | Relative upload time (e.g., "2 hours ago") |
| `thumbnail` | URL to thumbnail image |
| `page_number` | Which page this video was scraped from |
| `scraped_at` | ISO 8601 timestamp of when scraping occurred |

## Extracted Data Fields

Each video entry contains the following metadata:

- **URL**: Direct link to the video page
- **Title**: Video title
- **Quality**: Video quality indicator (HD, SD, or blank for standard)
- **Duration**: Video length in MM:SS format
- **Rating**: User rating percentage (0%-100%)
- **Views**: Number of views
- **Upload Time**: Relative time since upload (e.g., "5 minutes ago")
- **Thumbnail**: URL to the video thumbnail image
- **Video ID**: Unique identifier extracted from URL
- **Page Number**: Which page this video was found on
- **Scraped At**: Timestamp of when the data was collected

## Examples

### Example 1: Quick Single-Page Scrape

```bash
python3 thisvid_scraper.py
```

Output:
```
ThisVid.com Gay-Newest Scraper
================================================================================
Scraping pages 1 to 1
Delay between requests: 2.0s
================================================================================
Fetching page 1: https://thisvid.com/gay-newest
Successfully fetched 96929 characters
Extracted 36 videos from page 1
Saved 36 videos to thisvid_gay_newest.json
Saved 36 videos to thisvid_gay_newest.csv

================================================================================
SCRAPED 36 VIDEOS FROM THISVID.COM/GAY-NEWEST
================================================================================

Quality Distribution:
  SD: 6 videos
  HD: 30 videos
...
```

### Example 2: Scrape Multiple Pages

```bash
python3 thisvid_scraper.py --pages 3 --delay 1.5
```

This will:
- Scrape pages 1, 2, and 3
- Wait 1.5 seconds between each page request
- Extract approximately 108 videos (36 per page)
- Save all results to JSON and CSV files

### Example 3: Batch Processing

```bash
# Scrape different ranges and save separately
python3 thisvid_scraper.py --start 1 --pages 5 -o batch1.json -c batch1.csv
python3 thisvid_scraper.py --start 6 --pages 5 -o batch2.json -c batch2.csv
python3 thisvid_scraper.py --start 11 --pages 5 -o batch3.json -c batch3.csv
```

## Implementation Details

### Architecture

The scraper is built with a modular design:

1. **ThisVidParser** - Custom HTML parser class that extends `HTMLParser`
   - Extracts video metadata from HTML structure
   - Handles both relative and absolute URLs
   - Parses quality badges, durations, ratings, views, and timestamps

2. **fetch_page()** - HTTP fetching with retry logic
   - Uses standard library `urllib`
   - Includes proper User-Agent headers
   - 3 retry attempts with timeout handling

3. **scrape_thisvid_gay_newest()** - Main scraping function
   - Handles pagination
   - Enriches data with video IDs and timestamps

4. **Output functions** - Save to JSON and CSV
   - JSON with pretty-printing and UTF-8 support
   - CSV with proper escaping and encoding

### HTML Parsing Strategy

The scraper uses Python's built-in `HTMLParser` to extract video data from the page structure:

```
<a href="/videos/..." title="...">
  <span class="thumb">
    <img data-original="..." />
    <span class="quality">HD</span>
    <span class="duration">10:30</span>
    <span class="percent">85%</span>
    <span class="view">1234</span>
    <span class="date">2 hours ago</span>
  </span>
  <span class="title">Video Title</span>
</a>
```

The parser tracks state as it encounters these elements and assembles complete video records.

## Best Practices

### Respectful Scraping

1. **Use delays**: Always include a delay between requests (default is 2 seconds)
2. **Don't overload**: Avoid scraping too many pages in a single session
3. **Off-peak hours**: Consider running during off-peak hours
4. **User-Agent**: The scraper includes a proper browser User-Agent

### Rate Limiting

Recommended delay settings based on number of pages:

- **1-5 pages**: 1.5-2 seconds (default)
- **6-10 pages**: 2-3 seconds
- **11+ pages**: 3-5 seconds

Example:
```bash
# For scraping many pages, use longer delays
python3 thisvid_scraper.py --pages 20 --delay 3.0
```

### Error Handling

The scraper includes robust error handling:

- **Network errors**: Retries up to 3 times with exponential backoff
- **Parse errors**: Gracefully skips malformed entries
- **Timeout protection**: 30-second timeout on HTTP requests

## Troubleshooting

### Common Issues

**Issue**: No videos scraped
- **Solution**: Check your internet connection and verify the site is accessible

**Issue**: HTTP errors (403, 503, etc.)
- **Solution**: Increase the `--delay` parameter, try again later, or check if the site is blocking your IP

**Issue**: Incomplete data for some videos
- **Solution**: This is normal - some videos may have missing metadata on the source page

**Issue**: Different number of videos per page
- **Solution**: The site may show different numbers of videos per page based on content availability

### Debugging

Add debug output by modifying the script:

```python
# At the top of the fetch_page function
print(f"DEBUG: Fetching {url}")

# In the parser
print(f"DEBUG: Found video: {self.current_video}")
```

## Limitations

- Only scrapes publicly available metadata (no private videos)
- Does not download actual video files (metadata only)
- Requires internet connection
- Subject to website structure changes
- Rate limiting may affect large scraping jobs

## Legal & Ethical Considerations

⚠️ **Important**: This scraper is for educational and research purposes only.

- **Respect robots.txt**: Check the site's robots.txt file
- **Terms of Service**: Review and comply with the website's ToS
- **Personal Use**: Intended for personal research and data analysis
- **Rate Limiting**: Use appropriate delays to avoid overloading servers
- **Copyright**: Metadata may be subject to copyright; respect content ownership
- **Privacy**: Be mindful of privacy implications when sharing scraped data

## Contributing

Contributions are welcome! Areas for improvement:

- Add support for other sections (top-rated, most-popular, etc.)
- Implement incremental scraping (resume from last position)
- Add data deduplication
- Create data analysis/visualization tools
- Add database export options

## Version History

- **v1.0** (2026-02-16)
  - Initial release
  - Single and multi-page scraping
  - JSON and CSV export
  - Command-line interface
  - Zero dependencies implementation

## License

This project is provided as-is for educational purposes. Use responsibly and at your own risk.

## Author

Created as part of the Goose AI project automation.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the examples
3. Verify your Python version (3.6+)
4. Check your internet connection

---

**Disclaimer**: This tool is provided for educational and research purposes only. Users are responsible for complying with all applicable laws, terms of service, and ethical guidelines when using this scraper.

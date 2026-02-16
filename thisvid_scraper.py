#!/usr/bin/env python3
"""
ThisVid.com Gay-Newest Section Scraper

This script scrapes video metadata from thisvid.com/gay-newest page,
including titles, URLs, durations, view counts, ratings, and upload times.
"""

import re
import json
import csv
from datetime import datetime
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError


class ThisVidParser(HTMLParser):
    """Custom HTML parser for extracting video data from ThisVid pages."""
    
    def __init__(self):
        super().__init__()
        self.videos = []
        self.current_video = {}
        self.in_video_link = False
        self.in_title_span = False
        self.current_attrs = {}
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        # Detect video link container
        if tag == 'a' and 'href' in attrs_dict and '/videos/' in attrs_dict.get('href', ''):
            self.in_video_link = True
            href = attrs_dict['href']
            # Handle both absolute and relative URLs
            if href.startswith('http'):
                video_url = href
            else:
                video_url = 'https://thisvid.com' + href
            
            self.current_video = {
                'url': video_url,
                'title': attrs_dict.get('title', ''),
                'quality': '',
                'duration': '',
                'rating': '',
                'views': '',
                'upload_time': '',
                'thumbnail': ''
            }
        
        # Inside a video link, extract details
        if self.in_video_link:
            # Thumbnail image
            if tag == 'img' and 'data-original' in attrs_dict:
                self.current_video['thumbnail'] = 'https:' + attrs_dict['data-original']
            
            # Quality badge
            if tag == 'span' and attrs_dict.get('class') == 'quality':
                self.current_attrs['next_is'] = 'quality'
            
            # Duration
            if tag == 'span' and attrs_dict.get('class') == 'duration':
                self.current_attrs['next_is'] = 'duration'
            
            # Rating percentage
            if tag == 'span' and attrs_dict.get('class') == 'percent':
                self.current_attrs['next_is'] = 'rating'
            
            # Views
            if tag == 'span' and attrs_dict.get('class') == 'view':
                self.current_attrs['next_is'] = 'views'
            
            # Upload time
            if tag == 'span' and attrs_dict.get('class') == 'date':
                self.current_attrs['next_is'] = 'upload_time'
            
            # Title span
            if tag == 'span' and attrs_dict.get('class') == 'title':
                self.in_title_span = True
    
    def handle_data(self, data):
        data = data.strip()
        if not data or not self.in_video_link:
            return
        
        # Assign data based on what element we're in
        next_type = self.current_attrs.get('next_is')
        
        if next_type == 'quality':
            self.current_video['quality'] = data
            self.current_attrs['next_is'] = None
        elif next_type == 'duration':
            self.current_video['duration'] = data
            self.current_attrs['next_is'] = None
        elif next_type == 'rating':
            self.current_video['rating'] = data
            self.current_attrs['next_is'] = None
        elif next_type == 'upload_time':
            self.current_video['upload_time'] = data
            self.current_attrs['next_is'] = None
        elif next_type == 'views':
            # Views come after an icon, might be a number
            if data.isdigit() or data == '0':
                self.current_video['views'] = data
                self.current_attrs['next_is'] = None
    
    def handle_endtag(self, tag):
        # End of video link - save the video data
        if tag == 'a' and self.in_video_link:
            self.in_video_link = False
            self.in_title_span = False
            
            # Only add if we have a valid URL and title
            if self.current_video.get('url') and self.current_video.get('title'):
                self.videos.append(self.current_video.copy())
            
            self.current_video = {}
            self.current_attrs = {}


def fetch_page(url, max_retries=3):
    """
    Fetch HTML content from a URL with retry logic.
    
    Args:
        url: The URL to fetch
        max_retries: Maximum number of retry attempts
        
    Returns:
        HTML content as string, or None on failure
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
    
    for attempt in range(max_retries):
        try:
            request = Request(url, headers=headers)
            with urlopen(request, timeout=30) as response:
                return response.read().decode('utf-8', errors='ignore')
        except HTTPError as e:
            print(f"HTTP Error {e.code}: {e.reason} (attempt {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                return None
        except URLError as e:
            print(f"URL Error: {e.reason} (attempt {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                return None
        except Exception as e:
            print(f"Unexpected error: {e} (attempt {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                return None
    
    return None


def extract_video_id(url):
    """Extract video ID from URL."""
    match = re.search(r'/videos/([^/]+)/', url)
    return match.group(1) if match else ''


def scrape_thisvid_gay_newest(page_num=1):
    """
    Scrape video metadata from thisvid.com/gay-newest page.
    
    Args:
        page_num: Page number to scrape (default: 1)
        
    Returns:
        List of dictionaries containing video metadata
    """
    if page_num == 1:
        url = "https://thisvid.com/gay-newest"
    else:
        url = f"https://thisvid.com/gay-newest/{page_num}"
    
    print(f"Fetching page {page_num}: {url}")
    html_content = fetch_page(url)
    
    if not html_content:
        print(f"Failed to fetch page {page_num}")
        return []
    
    print(f"Successfully fetched {len(html_content)} characters")
    
    # Parse the HTML
    parser = ThisVidParser()
    parser.feed(html_content)
    
    # Enrich video data
    for video in parser.videos:
        video['video_id'] = extract_video_id(video['url'])
        video['page_number'] = page_num
        video['scraped_at'] = datetime.now().isoformat()
    
    print(f"Extracted {len(parser.videos)} videos from page {page_num}")
    return parser.videos


def save_to_json(videos, filename='thisvid_gay_newest.json'):
    """Save video data to JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(videos)} videos to {filename}")


def save_to_csv(videos, filename='thisvid_gay_newest.csv'):
    """Save video data to CSV file."""
    if not videos:
        print("No videos to save")
        return
    
    fieldnames = ['video_id', 'title', 'url', 'duration', 'quality', 'rating', 
                  'views', 'upload_time', 'thumbnail', 'page_number', 'scraped_at']
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(videos)
    
    print(f"Saved {len(videos)} videos to {filename}")


def print_summary(videos):
    """Print a summary of scraped videos."""
    if not videos:
        print("No videos found")
        return
    
    print("\n" + "="*80)
    print(f"SCRAPED {len(videos)} VIDEOS FROM THISVID.COM/GAY-NEWEST")
    print("="*80)
    
    # Quality distribution
    quality_counts = {}
    for video in videos:
        quality = video.get('quality', 'SD')
        quality_counts[quality] = quality_counts.get(quality, 0) + 1
    
    print(f"\nQuality Distribution:")
    for quality, count in sorted(quality_counts.items()):
        print(f"  {quality or 'SD'}: {count} videos")
    
    # Sample videos
    print(f"\nSample Videos (first 5):")
    print("-" * 80)
    for i, video in enumerate(videos[:5], 1):
        print(f"{i}. {video['title']}")
        print(f"   URL: {video['url']}")
        print(f"   Duration: {video['duration']} | Quality: {video['quality'] or 'SD'} | "
              f"Rating: {video['rating']} | Views: {video['views']} | "
              f"Uploaded: {video['upload_time']}")
        print()


def main():
    """Main function to run the scraper."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Scrape video metadata from thisvid.com/gay-newest',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape the first page only
  python3 thisvid_scraper.py
  
  # Scrape first 5 pages
  python3 thisvid_scraper.py --pages 5
  
  # Scrape pages 3-7
  python3 thisvid_scraper.py --start 3 --pages 5
  
  # Custom output filenames
  python3 thisvid_scraper.py --pages 3 --output videos.json --csv videos.csv
        """
    )
    
    parser.add_argument(
        '--pages', 
        type=int, 
        default=1,
        help='Number of pages to scrape (default: 1)'
    )
    
    parser.add_argument(
        '--start',
        type=int,
        default=1,
        help='Starting page number (default: 1)'
    )
    
    parser.add_argument(
        '--output', '-o',
        default='thisvid_gay_newest.json',
        help='Output JSON filename (default: thisvid_gay_newest.json)'
    )
    
    parser.add_argument(
        '--csv', '-c',
        default='thisvid_gay_newest.csv',
        help='Output CSV filename (default: thisvid_gay_newest.csv)'
    )
    
    parser.add_argument(
        '--delay',
        type=float,
        default=2.0,
        help='Delay between page requests in seconds (default: 2.0)'
    )
    
    args = parser.parse_args()
    
    print("ThisVid.com Gay-Newest Scraper")
    print("="*80)
    print(f"Scraping pages {args.start} to {args.start + args.pages - 1}")
    print(f"Delay between requests: {args.delay}s")
    print("="*80)
    
    all_videos = []
    
    # Scrape multiple pages
    for page_num in range(args.start, args.start + args.pages):
        videos = scrape_thisvid_gay_newest(page_num)
        all_videos.extend(videos)
        
        # Delay between requests (except after last page)
        if page_num < args.start + args.pages - 1 and args.delay > 0:
            print(f"Waiting {args.delay}s before next request...")
            import time
            time.sleep(args.delay)
    
    if all_videos:
        # Save results
        save_to_json(all_videos, args.output)
        save_to_csv(all_videos, args.csv)
        
        # Print summary
        print_summary(all_videos)
        
        print("\n" + "="*80)
        print("SCRAPING COMPLETE")
        print("="*80)
        print(f"Total videos scraped: {len(all_videos)}")
        print(f"Pages scraped: {args.pages}")
        print(f"Output files:")
        print(f"  - {args.output}")
        print(f"  - {args.csv}")
    else:
        print("ERROR: No videos were scraped")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())

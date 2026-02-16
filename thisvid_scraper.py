#!/usr/bin/env python3
"""
ThisVid.com Gay-Newest Video Scraper
Extracts video metadata from thisvid.com/gay-newest page
"""

import re
import json
from html.parser import HTMLParser
from typing import List, Dict, Optional


class ThisVidParser(HTMLParser):
    """Parse ThisVid HTML to extract video information"""
    
    def __init__(self):
        super().__init__()
        self.videos = []
        self.current_video = None
        self.in_video_link = False
        self.in_title_span = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        # Detect video link start
        if tag == 'a' and attrs_dict.get('class') == 'tumbpu':
            self.in_video_link = True
            self.current_video = {
                'url': attrs_dict.get('href', ''),
                'title': attrs_dict.get('title', ''),
                'thumbnail': '',
                'duration': '',
                'quality': '',
                'views': 0,
                'rating_percent': '',
                'upload_time': '',
                'screenshot_count': 0
            }
        
        # Extract thumbnail and screenshot count from img tag
        if self.in_video_link and tag == 'img' and 'lazy-load' in attrs_dict.get('class', ''):
            self.current_video['thumbnail'] = attrs_dict.get('data-original', '')
            screenshot_count = attrs_dict.get('data-cnt', '0')
            self.current_video['screenshot_count'] = int(screenshot_count) if screenshot_count.isdigit() else 0
        
        # Extract metadata from span tags
        if self.in_video_link and tag == 'span':
            span_class = attrs_dict.get('class', '')
            
            if span_class == 'quality':
                self.current_video['quality'] = 'HD'
            elif span_class == 'title':
                self.in_title_span = True
    
    def handle_data(self, data):
        if not self.in_video_link or not self.current_video:
            return
            
        data = data.strip()
        if not data:
            return
        
        # Extract duration (format: MM:SS)
        if re.match(r'^\d+:\d+$', data):
            self.current_video['duration'] = data
        
        # Extract rating percentage
        if data.endswith('%'):
            self.current_video['rating_percent'] = data
        
        # Extract views (icon followed by number)
        if data.isdigit() and self.current_video.get('views') == 0:
            self.current_video['views'] = int(data)
        
        # Extract upload time (relative time)
        if any(keyword in data.lower() for keyword in ['minute', 'hour', 'day', 'week', 'month', 'year', 'ago']):
            self.current_video['upload_time'] = data
        
        # Title in span
        if self.in_title_span:
            self.current_video['title'] = data
            self.in_title_span = False
    
    def handle_endtag(self, tag):
        if tag == 'a' and self.in_video_link:
            if self.current_video and self.current_video.get('url'):
                # Clean up the video data
                if not self.current_video['quality']:
                    self.current_video['quality'] = 'SD'
                
                # Make URL absolute if relative
                if self.current_video['url'].startswith('/'):
                    self.current_video['url'] = 'https://thisvid.com' + self.current_video['url']
                
                # Make thumbnail URL absolute if relative
                if self.current_video['thumbnail'].startswith('//'):
                    self.current_video['thumbnail'] = 'https:' + self.current_video['thumbnail']
                
                self.videos.append(self.current_video)
            
            self.in_video_link = False
            self.current_video = None


def parse_thisvid_html(html_content: str) -> List[Dict]:
    """Parse ThisVid HTML and return list of video dictionaries"""
    parser = ThisVidParser()
    parser.feed(html_content)
    return parser.videos


def extract_page_info(html_content: str) -> Dict:
    """Extract page metadata"""
    info = {
        'page_title': '',
        'total_videos': 0,
        'showing_range': '',
        'pagination': {
            'current_page': 1,
            'total_pages': 0
        }
    }
    
    # Extract title
    title_match = re.search(r'<title>(.+?)</title>', html_content)
    if title_match:
        info['page_title'] = title_match.group(1)
    
    # Extract showing range (e.g., "Showing 1 - 36 of 1507826 videos")
    showing_match = re.search(r'Showing\s+(\d+)\s*-\s*(\d+)\s+of\s+([\d,]+)\s+videos', html_content)
    if showing_match:
        info['showing_range'] = f"{showing_match.group(1)}-{showing_match.group(2)}"
        total_str = showing_match.group(3).replace(',', '')
        info['total_videos'] = int(total_str)
    
    # Extract pagination info
    pages_match = re.search(r'pagination-last[^>]*href="/gay-newest/(\d+)/', html_content)
    if pages_match:
        info['pagination']['total_pages'] = int(pages_match.group(1))
    
    return info


def main():
    """Main function to parse the scraped HTML"""
    # Read the cached HTML file
    html_file = '/home/vercel-sandbox/.cache/goose/computer_controller/web_20260216_022606.txt'
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
    except FileNotFoundError:
        print(f"Error: Could not find HTML file at {html_file}")
        return
    
    # Extract page info
    page_info = extract_page_info(html_content)
    
    # Parse videos
    videos = parse_thisvid_html(html_content)
    
    # Create output structure
    output = {
        'scrape_date': '2026-02-16',
        'source_url': 'https://thisvid.com/gay-newest/',
        'page_info': page_info,
        'videos_count': len(videos),
        'videos': videos
    }
    
    # Save to JSON file
    output_file = '/vercel/sandbox/thisvid_gay_newest_scraped.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Successfully scraped {len(videos)} videos")
    print(f"✓ Page shows: {page_info['showing_range']} of {page_info['total_videos']:,} total videos")
    print(f"✓ Total pages available: {page_info['pagination']['total_pages']:,}")
    print(f"✓ Output saved to: {output_file}")
    
    # Print sample of first 3 videos
    print("\n" + "="*80)
    print("SAMPLE DATA (first 3 videos):")
    print("="*80)
    for i, video in enumerate(videos[:3], 1):
        print(f"\nVideo {i}:")
        print(f"  Title: {video['title']}")
        print(f"  URL: {video['url']}")
        print(f"  Duration: {video['duration']}")
        print(f"  Quality: {video['quality']}")
        print(f"  Views: {video['views']}")
        print(f"  Rating: {video['rating_percent']}")
        print(f"  Uploaded: {video['upload_time']}")
        print(f"  Thumbnail: {video['thumbnail'][:80]}...")


if __name__ == '__main__':
    main()

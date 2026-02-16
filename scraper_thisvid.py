#!/usr/bin/env python3
"""
Scraper for thisvid.com/gay-newest
Extracts video information from the gay newest videos page
"""

import json
import sys
from datetime import datetime
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
import time


class ThisVidScraper:
    """Scraper for thisvid.com gay newest videos"""
    
    def __init__(self, base_url: str = "https://thisvid.com/gay-newest"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def fetch_page(self, page_num: int = 1) -> Optional[str]:
        """Fetch a page from thisvid.com"""
        try:
            url = f"{self.base_url}/{page_num}" if page_num > 1 else self.base_url
            print(f"Fetching: {url}", file=sys.stderr)
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching page {page_num}: {e}", file=sys.stderr)
            return None
    
    def parse_video_item(self, item) -> Optional[Dict]:
        """Parse a single video item from the page"""
        try:
            video_data = {}
            
            # Item is the <a> tag with class "tumbpu"
            if item.name == 'a' and item.get('href'):
                video_data['url'] = item['href']
                if not video_data['url'].startswith('http'):
                    video_data['url'] = 'https://thisvid.com' + video_data['url']
                # Extract ID from URL
                video_id = video_data['url'].split('/')[-2] if '/' in video_data['url'] else ''
                video_data['id'] = video_id
            else:
                return None
            
            # Extract thumbnail from data-original attribute
            img_elem = item.find('img', class_='lazy-load')
            if img_elem and img_elem.get('data-original'):
                video_data['thumbnail'] = 'https:' + img_elem['data-original'] if img_elem['data-original'].startswith('//') else img_elem['data-original']
            
            # Extract title from span.title or a title attribute
            title_elem = item.find('span', class_='title')
            if title_elem:
                video_data['title'] = title_elem.get_text(strip=True)
            elif item.get('title'):
                video_data['title'] = item.get('title')
            
            # Extract duration
            duration_elem = item.find('span', class_='duration')
            if duration_elem:
                video_data['duration'] = duration_elem.get_text(strip=True)
            
            # Extract views from span.view
            view_elem = item.find('span', class_='view')
            if view_elem:
                video_data['views'] = view_elem.get_text(strip=True).replace('0', '').strip()
            
            # Extract upload time from span.date
            date_elem = item.find('span', class_='date')
            if date_elem:
                video_data['uploaded'] = date_elem.get_text(strip=True)
            
            # Extract quality (HD, etc)
            quality_elem = item.find('span', class_='quality')
            if quality_elem:
                video_data['quality'] = quality_elem.get_text(strip=True)
            
            # Extract percent (rating/completion)
            percent_elem = item.find('span', class_='percent')
            if percent_elem:
                video_data['percent'] = percent_elem.get_text(strip=True)
            
            # Add scrape timestamp
            video_data['scraped_at'] = datetime.utcnow().isoformat()
            
            return video_data if video_data.get('url') else None
            
        except Exception as e:
            print(f"Error parsing video item: {e}", file=sys.stderr)
            return None
    
    def scrape_page(self, page_num: int = 1) -> List[Dict]:
        """Scrape videos from a single page"""
        html = self.fetch_page(page_num)
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        videos = []
        
        # Find the thumbs-items container and all <a> tags with class "tumbpu"
        thumbs_container = soup.find('div', class_='thumbs-items')
        
        if thumbs_container:
            video_items = thumbs_container.find_all('a', class_='tumbpu')
        else:
            # Fallback: try to find all tumbpu links
            video_items = soup.find_all('a', class_='tumbpu')
        
        print(f"Found {len(video_items)} video items on page {page_num}", file=sys.stderr)
        
        for item in video_items:
            video_data = self.parse_video_item(item)
            if video_data:
                videos.append(video_data)
        
        return videos
    
    def scrape_multiple_pages(self, num_pages: int = 5, delay: float = 2.0) -> List[Dict]:
        """Scrape multiple pages with delay between requests"""
        all_videos = []
        
        for page_num in range(1, num_pages + 1):
            print(f"Scraping page {page_num}/{num_pages}...", file=sys.stderr)
            videos = self.scrape_page(page_num)
            all_videos.extend(videos)
            
            if page_num < num_pages:
                time.sleep(delay)
        
        return all_videos
    
    def save_to_json(self, videos: List[Dict], filename: str = "thisvid_scraped_data.json"):
        """Save scraped videos to JSON file"""
        output_data = {
            'source': self.base_url,
            'scraped_at': datetime.utcnow().isoformat(),
            'total_videos': len(videos),
            'videos': videos
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(videos)} videos to {filename}", file=sys.stderr)
        return filename


def main():
    """Main execution function"""
    print("Starting ThisVid scraper for /gay-newest", file=sys.stderr)
    
    scraper = ThisVidScraper()
    
    # Scrape first 3 pages (configurable)
    num_pages = 3
    videos = scraper.scrape_multiple_pages(num_pages=num_pages, delay=2.0)
    
    print(f"\nTotal videos scraped: {len(videos)}", file=sys.stderr)
    
    if videos:
        # Save to JSON
        output_file = scraper.save_to_json(videos)
        print(f"Results saved to: {output_file}", file=sys.stderr)
        
        # Print first video as sample
        print("\nSample video data:", file=sys.stderr)
        print(json.dumps(videos[0], indent=2), file=sys.stderr)
    else:
        print("No videos were scraped. Check the HTML structure or selectors.", file=sys.stderr)
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

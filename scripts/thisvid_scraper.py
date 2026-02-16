#!/usr/bin/env python3
"""
Scraper for thisvid.com/gay-newest
Extracts video metadata from the gay newest videos section
"""

import json
import time
import sys
from typing import List, Dict, Optional
from datetime import datetime
from urllib.parse import urljoin, urlparse, parse_qs
import argparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: Required packages not installed.")
    print("Install with: pip install requests beautifulsoup4")
    sys.exit(1)


class ThisVidScraper:
    """Scraper for thisvid.com gay newest videos"""
    
    BASE_URL = "https://thisvid.com"
    NEWEST_URL = "https://thisvid.com/gay-newest"
    
    def __init__(self, delay: float = 2.0, max_pages: int = 5):
        """
        Initialize scraper
        
        Args:
            delay: Delay between requests in seconds (be respectful)
            max_pages: Maximum number of pages to scrape
        """
        self.delay = delay
        self.max_pages = max_pages
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
    def fetch_page(self, url: str) -> Optional[BeautifulSoup]:
        """
        Fetch and parse a page
        
        Args:
            url: URL to fetch
            
        Returns:
            BeautifulSoup object or None on error
        """
        try:
            print(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Add delay to be respectful
            time.sleep(self.delay)
            
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}", file=sys.stderr)
            return None
    
    def extract_video_info(self, video_element) -> Optional[Dict]:
        """
        Extract video information from a video element
        
        Args:
            video_element: BeautifulSoup element containing video info (a.tumbpu)
            
        Returns:
            Dictionary with video metadata or None
        """
        try:
            video_data = {}
            
            # Extract video URL and ID
            video_url = video_element.get('href')
            if video_url:
                video_data['url'] = urljoin(self.BASE_URL, video_url)
                
                # Extract video ID from URL
                path_parts = urlparse(video_url).path.strip('/').split('/')
                if len(path_parts) >= 2:
                    video_data['id'] = path_parts[-1]
            
            # Extract title
            title = video_element.get('title')
            if title:
                video_data['title'] = title
            else:
                # Fallback to span.title
                title_elem = video_element.find('span', class_='title')
                if title_elem:
                    video_data['title'] = title_elem.get_text(strip=True)
            
            # Extract thumbnail (uses lazy loading with data-original)
            img_elem = video_element.find('img')
            if img_elem:
                thumb_url = img_elem.get('data-original') or img_elem.get('data-src') or img_elem.get('src')
                if thumb_url and not thumb_url.startswith('data:'):
                    # Add protocol if missing
                    if thumb_url.startswith('//'):
                        thumb_url = 'https:' + thumb_url
                    video_data['thumbnail'] = thumb_url
            
            # Extract duration
            duration_elem = video_element.find('span', class_='duration')
            if duration_elem:
                video_data['duration'] = duration_elem.get_text(strip=True)
            
            # Extract quality (HD, SD, etc.)
            quality_elem = video_element.find('span', class_='quality')
            if quality_elem:
                video_data['quality'] = quality_elem.get_text(strip=True)
            
            # Extract rating percentage
            percent_elem = video_element.find('span', class_='percent')
            if percent_elem:
                video_data['rating'] = percent_elem.get_text(strip=True)
            
            # Extract views
            view_elem = video_element.find('span', class_='view')
            if view_elem:
                views_text = view_elem.get_text(strip=True)
                video_data['views'] = views_text
            
            # Extract upload date
            date_elem = video_element.find('span', class_='date')
            if date_elem:
                video_data['uploaded'] = date_elem.get_text(strip=True)
            
            # Extract likes info
            likes_elem = video_element.find('span', class_='likes')
            if likes_elem:
                likes_text = likes_elem.get_text(strip=True)
                if likes_text and likes_text != 'LIKES':
                    video_data['likes'] = likes_text
            
            # Only return if we have at least a URL and title
            if 'url' in video_data and 'title' in video_data:
                return video_data
            
            return None
            
        except Exception as e:
            print(f"Error extracting video info: {e}", file=sys.stderr)
            return None
    
    def scrape_page(self, url: str) -> tuple[List[Dict], Optional[str]]:
        """
        Scrape a single page for videos
        
        Args:
            url: URL to scrape
            
        Returns:
            Tuple of (list of video data dicts, next page URL or None)
        """
        soup = self.fetch_page(url)
        if not soup:
            return [], None
        
        videos = []
        
        # Find all video links (a.tumbpu elements)
        video_links = soup.find_all('a', class_='tumbpu')
        
        print(f"Found {len(video_links)} video links")
        
        for video_link in video_links:
            video_info = self.extract_video_info(video_link)
            if video_info:
                videos.append(video_info)
        
        # Find next page link
        next_page = None
        
        # First try to find explicit "next" link
        next_link = (
            soup.find('a', class_='next') or
            soup.find('a', rel='next') or
            soup.find('a', string='Next') or
            soup.find('a', string='»')
        )
        
        if next_link and next_link.get('href'):
            next_page = urljoin(self.BASE_URL, next_link['href'])
        
        # If no explicit next link, look for numbered pagination
        if not next_page:
            pagination = soup.find('div', class_='pagination')
            if pagination:
                # Find the active page
                active = pagination.find('li', class_=lambda x: x and 'active' in x)
                if active:
                    # Get current page number
                    current_page_text = active.get_text(strip=True)
                    try:
                        current_page = int(current_page_text)
                        # Look for next page number
                        next_page_num = current_page + 1
                        next_link = pagination.find('a', string=str(next_page_num))
                        if next_link and next_link.get('href'):
                            next_page = urljoin(self.BASE_URL, next_link['href'])
                    except ValueError:
                        pass
                
                # Fallback: just get all numbered links and find the next one
                if not next_page:
                    links = pagination.find_all('a', href=True)
                    for link in links:
                        text = link.get_text(strip=True)
                        if text.isdigit():
                            # Take the first numbered link as next page
                            next_page = urljoin(self.BASE_URL, link['href'])
                            break
        
        return videos, next_page
    
    def scrape_all(self, start_url: Optional[str] = None) -> List[Dict]:
        """
        Scrape multiple pages starting from start_url
        
        Args:
            start_url: Starting URL (defaults to NEWEST_URL)
            
        Returns:
            List of all video data dictionaries
        """
        all_videos = []
        current_url = start_url or self.NEWEST_URL
        page_count = 0
        
        print(f"Starting scrape from: {current_url}")
        print(f"Max pages: {self.max_pages}")
        print(f"Delay between requests: {self.delay}s")
        print("-" * 60)
        
        while current_url and page_count < self.max_pages:
            page_count += 1
            print(f"\nPage {page_count}/{self.max_pages}")
            
            videos, next_url = self.scrape_page(current_url)
            
            if videos:
                all_videos.extend(videos)
                print(f"Extracted {len(videos)} videos (total: {len(all_videos)})")
            else:
                print("No videos found on this page")
            
            current_url = next_url
            
            if not current_url:
                print("\nNo more pages found")
                break
        
        print("-" * 60)
        print(f"Scraping complete! Total videos: {len(all_videos)}")
        
        return all_videos
    
    def save_results(self, videos: List[Dict], output_file: str):
        """
        Save scraped videos to JSON file
        
        Args:
            videos: List of video data dictionaries
            output_file: Output file path
        """
        output_data = {
            'scraped_at': datetime.now().isoformat(),
            'source': self.NEWEST_URL,
            'total_videos': len(videos),
            'videos': videos
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nResults saved to: {output_file}")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Scrape video metadata from thisvid.com/gay-newest'
    )
    parser.add_argument(
        '--output', '-o',
        default='thisvid_gay_newest.json',
        help='Output JSON file (default: thisvid_gay_newest.json)'
    )
    parser.add_argument(
        '--pages', '-p',
        type=int,
        default=5,
        help='Maximum number of pages to scrape (default: 5)'
    )
    parser.add_argument(
        '--delay', '-d',
        type=float,
        default=2.0,
        help='Delay between requests in seconds (default: 2.0)'
    )
    parser.add_argument(
        '--url', '-u',
        help='Custom starting URL (default: thisvid.com/gay-newest)'
    )
    
    args = parser.parse_args()
    
    # Create scraper
    scraper = ThisVidScraper(delay=args.delay, max_pages=args.pages)
    
    # Scrape videos
    videos = scraper.scrape_all(start_url=args.url)
    
    # Save results
    if videos:
        scraper.save_results(videos, args.output)
        
        # Print summary
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total videos scraped: {len(videos)}")
        
        if videos:
            print(f"\nSample video:")
            sample = videos[0]
            for key, value in sample.items():
                print(f"  {key}: {value}")
    else:
        print("\nNo videos were scraped. Check the URL and try again.")
        sys.exit(1)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Thisvid.com scraper for gay-newest section
Extracts video metadata from thisvid.com/gay-newest
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
from typing import List, Dict, Optional
import re


class ThisvidScraper:
    """Scraper for thisvid.com/gay-newest section"""

    def __init__(self):
        self.base_url = "https://thisvid.com/gay-newest"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    def fetch_page(self, page: int = 1) -> Optional[str]:
        """Fetch a page from thisvid.com/gay-newest"""
        try:
            url = f"{self.base_url}/?page={page}" if page > 1 else self.base_url
            print(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching page {page}: {e}")
            return None

    def extract_video_data(self, html: str) -> List[Dict]:
        """Extract video data from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        videos = []

        # Find all video links with class 'tumbpu'
        video_links = soup.find_all('a', class_='tumbpu', href=re.compile(r'/videos/'))

        print(f"Found {len(video_links)} video items")

        for link in video_links:
            try:
                video_data = self._parse_video_item(link)
                if video_data:
                    videos.append(video_data)
            except Exception as e:
                print(f"Error parsing video item: {e}")
                continue

        return videos

    def _parse_video_item(self, link) -> Optional[Dict]:
        """Parse individual video item from link element"""
        video = {}

        # Extract title and URL from the link
        video['title'] = link.get('title', '').strip()
        video['url'] = link.get('href', '')
        if video['url'] and not video['url'].startswith('http'):
            video['url'] = f"https://thisvid.com{video['url']}"

        # Extract video ID from URL
        if video.get('url'):
            match = re.search(r'/videos/(\d+)/', video['url'])
            if match:
                video['video_id'] = match.group(1)

        # Extract thumbnail from img data-original attribute
        img = link.find('img', class_='lazy-load')
        if img:
            thumbnail = img.get('data-original') or img.get('src')
            if thumbnail and not thumbnail.startswith('data:'):
                if not thumbnail.startswith('http'):
                    thumbnail = f"https:{thumbnail}"
                video['thumbnail'] = thumbnail

            # Also get the image count if available
            data_cnt = img.get('data-cnt')
            if data_cnt:
                video['image_count'] = int(data_cnt)

        # Look for metadata in the parent or sibling elements
        # Get parent container to find metadata
        parent = link.find_parent('div')
        if parent:
            # Extract duration
            duration_elem = parent.find('div', class_='duration') or parent.find(class_=re.compile(r'time-duration'))
            if duration_elem:
                video['duration'] = duration_elem.text.strip()

            # Extract views
            views_elem = parent.find(class_=re.compile(r'views|view'))
            if views_elem:
                views_text = views_elem.text.strip()
                video['views'] = self._parse_number(views_text)

            # Extract upload date
            date_elem = parent.find(class_=re.compile(r'date|time-added'))
            if date_elem:
                video['upload_date'] = date_elem.text.strip()

            # Extract uploader
            uploader_elem = parent.find(class_=re.compile(r'user|uploader|author'))
            if uploader_elem:
                uploader_link = uploader_elem.find('a')
                if uploader_link:
                    video['uploader'] = uploader_link.text.strip()
                else:
                    video['uploader'] = uploader_elem.text.strip()

            # Extract rating/likes
            rating_elem = parent.find(class_=re.compile(r'rating|vote'))
            if rating_elem:
                video['rating'] = rating_elem.text.strip()

        # Return None if no title was found
        return video if video.get('title') else None

    def _parse_number(self, text: str) -> Optional[int]:
        """Parse number from text (handles K, M suffixes)"""
        text = text.strip().upper()
        match = re.search(r'([\d.]+)\s*([KM])?', text)
        if match:
            num = float(match.group(1))
            suffix = match.group(2)
            if suffix == 'K':
                return int(num * 1000)
            elif suffix == 'M':
                return int(num * 1000000)
            else:
                return int(num)
        return None

    def scrape(self, num_pages: int = 5, delay: float = 2.0) -> List[Dict]:
        """
        Scrape multiple pages

        Args:
            num_pages: Number of pages to scrape
            delay: Delay between requests in seconds

        Returns:
            List of video data dictionaries
        """
        all_videos = []

        for page in range(1, num_pages + 1):
            print(f"\n--- Scraping page {page}/{num_pages} ---")
            html = self.fetch_page(page)

            if not html:
                print(f"Failed to fetch page {page}, stopping")
                break

            videos = self.extract_video_data(html)
            all_videos.extend(videos)

            print(f"Extracted {len(videos)} videos from page {page}")
            print(f"Total videos so far: {len(all_videos)}")

            # Delay before next request
            if page < num_pages:
                time.sleep(delay)

        return all_videos

    def save_results(self, videos: List[Dict], output_file: str = "thisvid_results.json"):
        """Save results to JSON file"""
        data = {
            'scraped_at': datetime.now().isoformat(),
            'source': self.base_url,
            'total_videos': len(videos),
            'videos': videos
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"\nResults saved to {output_file}")
        return output_file


def main():
    """Main function"""
    print("Thisvid.com Scraper - Gay Newest Section")
    print("=" * 50)

    scraper = ThisvidScraper()

    # Scrape first 5 pages
    videos = scraper.scrape(num_pages=5, delay=2.0)

    # Save results
    output_file = scraper.save_results(videos)

    # Print summary
    print("\n" + "=" * 50)
    print(f"Scraping complete!")
    print(f"Total videos scraped: {len(videos)}")
    print(f"Output file: {output_file}")

    # Show sample of first few videos
    if videos:
        print("\nSample of scraped videos:")
        for i, video in enumerate(videos[:3], 1):
            print(f"\n{i}. {video.get('title', 'N/A')}")
            print(f"   URL: {video.get('url', 'N/A')}")
            print(f"   Duration: {video.get('duration', 'N/A')}")
            print(f"   Views: {video.get('views', 'N/A')}")


if __name__ == "__main__":
    main()

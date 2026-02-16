#!/usr/bin/env python3
"""Test script to fetch and inspect the HTML structure"""

import requests
from bs4 import BeautifulSoup

url = "https://thisvid.com/gay-newest"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

print(f"Fetching: {url}")
response = requests.get(url, headers=headers, timeout=30)
print(f"Status: {response.status_code}")
print(f"Content length: {len(response.text)}")

# Save raw HTML for inspection
with open('thisvid_raw.html', 'w', encoding='utf-8') as f:
    f.write(response.text)
print("Saved raw HTML to thisvid_raw.html")

# Parse and look for common video container patterns
soup = BeautifulSoup(response.text, 'html.parser')

# Check for various common selectors
selectors = [
    ('div.item', soup.find_all('div', class_='item')),
    ('div.video-item', soup.find_all('div', class_='video-item')),
    ('div.thumb', soup.find_all('div', class_='thumb')),
    ('article.video', soup.find_all('article', class_='video')),
    ('div.video', soup.find_all('div', class_='video')),
    ('div[id*="video"]', soup.find_all('div', id=lambda x: x and 'video' in x.lower())),
    ('div[class*="video"]', soup.find_all('div', class_=lambda x: x and 'video' in str(x).lower())),
    ('a[href*="/videos/"]', soup.find_all('a', href=lambda x: x and '/videos/' in x)),
]

print("\nChecking common selectors:")
for selector_desc, elements in selectors:
    print(f"  {selector_desc}: {len(elements)} found")

# Print some class names to help identify structure
print("\nTop-level div classes found:")
divs = soup.find_all('div', limit=50)
classes = set()
for div in divs:
    if div.get('class'):
        classes.update(div.get('class'))

for cls in sorted(classes)[:30]:
    print(f"  - {cls}")

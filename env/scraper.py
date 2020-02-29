import json
import urllib.parse
import urllib.request

urls = [
    "https://thingspeak.com/channels/810768/feed.json",
    "https://thingspeak.com/channels/814173/feed.json",
    "https://thingspeak.com/channels/814176/feed.json",
    "https://thingspeak.com/channels/814180/feed.json",
    "https://thingspeak.com/channels/814241/feed.json"
]

for link in urls:
    with urllib.request.urlopen(link) as url:
        data = json.loads(url.read().decode())
        
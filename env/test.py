import json
import urllib.parse
import urllib.encode

jstr = open("sample.json", "r").read();
j = json.loads(jstr)

info = j["channel"];

src_id = info["id"];
location_name = "Dagupan";
latitude = info["latitude"];
longitude = info["latitude"];

values_register = {
    "packet_type": "register",
    "src_id": src_id,
    "location_name": location_name,
    "latitude": latitude,
    "longitude": longitude
}

url = 

data = urllib.parse.urlencode(values_register)
req = 

values_data = {
    "packet_type": "data",
    "src_id": src_id,
}


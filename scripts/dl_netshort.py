import urllib.request
import re

url = 'https://play.google.com/store/apps/details?id=com.netshort.abroad&hl=en'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        srcs = re.findall(r'<img[^>]+src="([^"]+googleusercontent[^"]+)"', html)
        print('Found img srcs:', len(srcs))
        saved = 0
        for i, s in enumerate(srcs):
            clean = s.replace('&amp;', '&').split('=')[0] + '=w1080'
            if 'abBbNR' not in clean: # skip app icon
                try:
                    req_img = urllib.request.Request(clean, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_img) as r:
                        data = r.read()
                        with open(f'public/brands/netshort_poster_{saved}.jpg', 'wb') as out:
                            out.write(data)
                        print(f'Saved high-res poster {saved}: {len(data)} bytes')
                        saved += 1
                        if saved >= 5:
                            break
                except Exception as e:
                    print(f'Error {i}: {e}')
except Exception as e:
    print('Error:', e)

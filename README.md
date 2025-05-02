A Shoulder Surfer Chrome extension will observe the pages the user navigates to, and send those URLs to a backend service. 

With manifest v3, declarativeNetRequest API does not have access to HTTP responses. 

## Techniques
To be manifest v3 compliant, there are several ways this could be accomplished: 

### Devtools API 
Devtools API can access HTTP responses

TODO

### Content script + DOM scraping

Injected content scripts to scrape DOM of pages user visits

Must be able to detect when the page is finished loading

### Remote headless service
This is a more lightweight approach that offloads the responsibility of scraping the page to a backend service

- Uses onSendHeaders API to send HTTP request headers to the backend service
- Backend service uses Puppeteer to scrape the page, using headers

## Known issues
- Single-page applications won't work
- Script identifies "user clicked" links by checking if request.type == "main_frame". Not all websites will use this type of requests as the user navigates through the site. One such site is Github
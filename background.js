// background.js

// TODO: replace with your actual scraper service URL
const SCRAPER_SERVICE_BASE    = "http://127.0.0.1:8080";
const COOKIE_JAR_ENDPOINT     = `${SCRAPER_SERVICE_BASE}/cookie-jar`;
const SCRAPE_ENDPOINT         = `${SCRAPER_SERVICE_BASE}/scrape`;
const SCRAPE_HEADERS_ENDPOINT = `${SCRAPER_SERVICE_BASE}/scrapewithheaders`;



chrome.webRequest.onSendHeaders.addListener(
    details => {
      // log the URL and details.type
      console.log(`${details.url} - ${details.type}`);
      
      // only capture top-level navigations
      if (details.type !== 'main_frame') return;
  
      fetch(SCRAPE_HEADERS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url:     details.url,
          headers: details.requestHeaders
        })
      }).catch(err => console.error('Header-sync failed:', err));
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );
  
// The following listeners are not necessary if script is offloading scraping to backend service
// Commented out for now

// In-memory queue of URLs waiting to be scraped
// const pendingUrls = new Set();

// Listen for top-level link navigations add to queue
/*
chrome.webNavigation.onCommitted.addListener(details => {
  if (details.frameId === 0 && details.transitionType === 'link') {
    pendingUrls.add(details.url);
  }
});

// Receive "page ready" messages from content_script.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'pageReady' && message.url) {
    const url = message.url;
    if (pendingUrls.has(url)) {
      pendingUrls.delete(url);
      fetch(SCRAPE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      }).catch(err => console.error('Scrape request failed:', err));
    }
  }
});

*/
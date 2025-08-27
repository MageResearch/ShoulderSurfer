// content_script.js
(() => {
    console.log("Content script loaded and running");
    const DEBOUNCE_TIME_MS = 500;
    let inFlightRequests = 0;
    let loadFired = false;
    let debounceTimer = null;
    let clickWatchingEnabled = false;
  
    // Monkey-patch window.fetch to track AJAX calls
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(...args) {
      inFlightRequests++;
      const promise = originalFetch(...args);
      promise.finally(() => {
        inFlightRequests--;
        checkReady();
      });
      return promise;
    };
  
    // Monkey-patch XMLHttpRequest to track AJAX calls
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(...args) {
      this._url = args[1];
      return originalOpen.apply(this, args);
    };
    XMLHttpRequest.prototype.send = function(...args) {
      inFlightRequests++;
      this.addEventListener('loadend', () => {
        inFlightRequests--;
        checkReady();
      });
      return originalSend.apply(this, args);
    };
  
    function checkReady() {
      if (!loadFired || !clickWatchingEnabled) return;
      if (inFlightRequests === 0) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(sendPageReady, DEBOUNCE_TIME_MS);
      }
    }
  
    function sendPageReady() {
      if (!clickWatchingEnabled) return;
      chrome.runtime.sendMessage({
        type: 'pageReady',
        url: window.location.href
      });
    }
  
    // Initialize click watching state from storage
    chrome.storage.local.get(['clickWatchingEnabled'], function(result) {
      clickWatchingEnabled = result.clickWatchingEnabled || false;
      console.log('Click watching initialized:', clickWatchingEnabled);
    });

    // Listen for messages from popup to toggle click watching
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.type === 'toggleClickWatching') {
        clickWatchingEnabled = request.enabled;
        console.log('Click watching toggled:', clickWatchingEnabled);
        
        // If enabling, check if we should send page ready immediately
        if (clickWatchingEnabled && loadFired && inFlightRequests === 0) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(sendPageReady, DEBOUNCE_TIME_MS);
        }
      }
    });

    // Listen for the window load event to start idle detection
    window.addEventListener('load', () => {
      loadFired = true;
      checkReady();
    });
  })();
  
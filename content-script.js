// content_script.js
(() => {
    console.log("Content script loaded and running");
    const DEBOUNCE_TIME_MS = 500;
    let inFlightRequests = 0;
    let loadFired = false;
    let debounceTimer = null;
  
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
      if (!loadFired) return;
      if (inFlightRequests === 0) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(sendPageReady, DEBOUNCE_TIME_MS);
      }
    }
  
    function sendPageReady() {
      chrome.runtime.sendMessage({
        type: 'pageReady',
        url: window.location.href
      });
    }
  
    // Listen for the window load event to start idle detection
    window.addEventListener('load', () => {
      loadFired = true;
      checkReady();
    });
  })();
  
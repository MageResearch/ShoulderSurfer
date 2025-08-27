document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const status = document.getElementById('status');

    // Get current state and update UI
    chrome.storage.local.get(['clickWatchingEnabled'], function(result) {
        const isEnabled = result.clickWatchingEnabled || false;
        updateUI(isEnabled);
    });

    // Handle toggle button click
    toggleButton.addEventListener('click', function() {
        chrome.storage.local.get(['clickWatchingEnabled'], function(result) {
            const currentState = result.clickWatchingEnabled || false;
            const newState = !currentState;
            
            // Save new state
            chrome.storage.local.set({ clickWatchingEnabled: newState }, function() {
                updateUI(newState);
                
                // Send message to all content scripts to update their state
                chrome.tabs.query({}, function(tabs) {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, {
                            type: 'toggleClickWatching',
                            enabled: newState
                        }).catch(() => {
                            // Ignore errors for tabs that don't have the content script
                        });
                    });
                });
            });
        });
    });

    function updateUI(isEnabled) {
        if (isEnabled) {
            toggleButton.textContent = 'Disable';
            toggleButton.className = 'toggle-button enabled';
            status.textContent = 'Click watching is ON';
        } else {
            toggleButton.textContent = 'Enable';
            toggleButton.className = 'toggle-button disabled';
            status.textContent = 'Click watching is OFF';
        }
    }
});
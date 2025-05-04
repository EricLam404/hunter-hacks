/// <reference types="chrome" />
let lastExternalTabId: number | null = null;

let quizOpened = false;

// milliseconds between screenshots
const CAPTURE_INTERVAL = 60_000; 
let lastCaptureTime = 0;

let sessionData = {
    originalUrl: "",
    topic: ""
  };
  
//For the background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log("Background service worker loaded.");
  });
  
// ── Listen for pass/fail messages from the quiz UI ─────────────────
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === 'quizFailed') {
      console.log('🔒 Quiz failed – redirecting your last external tab.');
      if (lastExternalTabId !== null && sessionData.originalUrl) {
        chrome.tabs.update(lastExternalTabId, {
          url: sessionData.originalUrl
        });
      }
    }
    if (message.action === 'quizPassed') {
        lastCaptureTime = Date.now();
        quizOpened = false;
    
        // use book.jpg as the notification icon
        const iconPath = chrome.runtime.getURL('book1.jpg');
        chrome.notifications.create(
          'victory',
          {
            type:    'basic',
            iconUrl: iconPath,
            title:   'You win this time!',
            message: "I'll be back…",
          },
          (notifId) => {
            setTimeout(() => {
              chrome.notifications.clear(notifId, () => {});
            }, 5000);
          }
        );
        
    // 🚪 Now close the quiz popup tab itself…
    if (sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
        console.log('🔒 Closed quiz popup tab');
      }
      }
  });

  
  
  // Listen for tab updates 
  chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      handleTabChange(tab);
    }
  });
  
  // Listen for tab activation
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabChange(tab);
  });

  // Listen for messages from the content script or popup
  chrome.runtime.onMessage.addListener((message, _unusedSender, sendResponse) => {
    if (message.action === "saveOriginalUrl") {
      sessionData.originalUrl = message.url;
      console.log("🌐 Original URL saved:", sessionData.originalUrl);
    }
  
    if (message.action === "saveTopic") {
      sessionData.topic = message.topic;
      console.log("🧠 Topic saved:", sessionData.topic);
    }
  
    if (message.action === "getSessionData") {
      sendResponse(sessionData);
    }
  });
  
  //Logic to handle tab being changed
  async function handleTabChange(tab: chrome.tabs.Tab) {
    const url = tab.url || ""; // Extract the URL from the tab object
    if (
        url &&
        !url.startsWith("chrome://") &&
        !url.startsWith(`chrome-extension://${chrome.runtime.id}`)
      ) {
        lastExternalTabId = tab.id!;
      }

    //Skip if the lass capture time is less than the interval
    const now = Date.now();
    if (now - lastCaptureTime < CAPTURE_INTERVAL) {
      console.log(
        `⏳ Skipping capture. Next allowed in ${Math.ceil(
          (CAPTURE_INTERVAL - (now - lastCaptureTime)) / 1000
        )}s.`
      );
      return;
    }
    lastCaptureTime = now;


    
    // ✅ Only check if user is off-task
    if (sessionData.originalUrl && url.includes(sessionData.originalUrl)) {
      console.log("✅ Still on original site.");
      quizOpened = false; // Reset quizOpened when on the original site
      return;
    }
  
    chrome.windows.getCurrent({}, (window) => {
      if (window.id !== undefined) {
        chrome.tabs.captureVisibleTab(window.id, { format: "jpeg", quality: 30 }, async (dataUrl) => {
          if (!dataUrl) return;
  
          const base64Image = dataUrl.split(",")[1];
  
          const payload = {
            url,
            screenshot: base64Image,
            topic: sessionData.topic
          };
  

          try {
            // 🔁 Send to backend
            const response = await fetch("http://localhost:3000/verify-activity", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });
    
            const result = await response.json();
            console.log("🧠 Relevance result:", result);
    
            // ✅ Trigger quiz if off-topic
            if (!result.isRelevant && !url.includes(sessionData.originalUrl)) {
                console.log("🚨 Page is off-topic and not the original URL");
              
                if (!quizOpened) {
                  console.log("🔁 Opening quiz popup...");
                  chrome.windows.create({
                    url: `chrome-extension://${chrome.runtime.id}/index.html#/quiz`,
                    type: "popup",
                    width: 360,
                    height: 500
                  });
                  quizOpened = true;
                }
              }
              
            
          } catch (err) {
            console.error("❌ Error verifying activity:", err);
          }
        });
      }
    });
  }
  


// Run once per minute to check the current tab
setInterval(async () => {
    // Query the currently active tab in the current window
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
  
    // Trigger screenshot and analysis
    handleTabChange(tab);
  }, 60_000); // 60,000 ms = 1 minute
  
  // Optional: Also run screenshot logic immediately when tab changes
  chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => { // _ is a placeholder for tabId
    if (changeInfo.status === "complete") {
      handleTabChange(tab);
    }
  });
  
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabChange(tab);
  });
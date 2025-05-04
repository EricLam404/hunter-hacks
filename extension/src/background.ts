/// <reference types="chrome" />

let sessionData = {
    originalUrl: "",
    topic: ""
  };
  
//For the background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log("Background service worker loaded.");
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
    const url = tab.url || "";
    if (!url || url.startsWith("chrome://")) return;
  
    // ✅ Only check if user is off-task
    if (sessionData.originalUrl && url.includes(sessionData.originalUrl)) {
      console.log("✅ Still on original site.");
      return;
    }
  
    chrome.windows.getCurrent({}, (window) => {
      if (window.id !== undefined) {
        chrome.tabs.captureVisibleTab(window.id, { format: "jpeg", quality: 30 }, async (dataUrl) => {
          if (!dataUrl) return;
  
          const base64Image = dataUrl.split(",")[1];
  
          const payload = {
            url,
            screenshot: base64Image
          };
  
          const response = await fetch("http://localhost:3000/verify-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
  
          const result = await response.json();
  
          console.log("📸 Sent screenshot for", url);
          console.log("🧠 Relevance result:", result);
  
          // ❌ If not relevant, force them back to quiz page
          if (!result.isRelevant) {
            chrome.tabs.create({ url: "chrome-extension://" + chrome.runtime.id + "/index.html#/quiz" });
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
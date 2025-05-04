/// <reference types="chrome" />

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
  
  //Logic to handle tab being changed
  async function handleTabChange(tab: chrome.tabs.Tab) {
    const url = tab.url || "";
    
    // Gets current Chrome window to capture url
    chrome.windows.getCurrent({}, (window) => {
      if (window.id !== undefined) {
        //capture a screenshot of the visible tab in PNG format
        chrome.tabs.captureVisibleTab(window.id, { format: "jpeg", quality: 30 }, async (dataUrl) => {
          if (!dataUrl) return;
            // Convert the data URL to a base64 string
          const base64Image = dataUrl.split(",")[1];
        
          // Create a payload to send to the server
          const payload = {
            url,    //current URL
            screenshot: base64Image //ss as base64 string
          };
          
          // Send the screenshot to the server + URL to backend
          await fetch("http://localhost:3000/verify-activity", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
  
          console.log("Screenshot sent for:", url);
        });
      }
    });
  }
  
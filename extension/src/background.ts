/// <reference types="chrome" />
let lastExternalTabId: number | null = null;

let quizOpened = false;
// Flag to track if the quiz is already opened
let trackingEnabled = true;
// let intervalId: number;
//let checkIntervalId: number | null = null;

// milliseconds between screenshots
const CAPTURE_INTERVAL = 60_000;
let lastCaptureTime = 0;

export let sessionData = {
    originalUrl: "",
    topic: "",
};

// background.ts, near the top:
chrome.action.onClicked.addListener(() => {
    console.log("🖱️ Service worker woke via toolbar click");
});

//For the background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log("Background service worker loaded.");
});

//Listener- schedule a periodic tab check
// checkIntervalId = window.setInterval(() => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0]) handleTabChange(tabs[0]);
//     });
//   }, CAPTURE_INTERVAL);

// ── Listen for pass/fail messages from the quiz UI ─────────────────
// checkIntervalId = window.setInterval(async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (tab) handleTabChange(tab);
//   }, CAPTURE_INTERVAL);

// 2) Listen for messages (including our stopTracking)
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "stopTracking") {
        chrome.alarms.clear("captureAlarm", () => {
            console.log("⏹️ captureAlarm cleared — tracking stopped");
        });
        return;
    }
    if (message.action === "startTracking") {
        chrome.alarms.create("captureAlarm", { periodInMinutes: 1 });
        console.log("▶️ capture Alarm created — tracking resumed");
        return;
    }
    //Start tracking if desired
    if (message.action === "quizFailed") {
        console.log("🔒 Quiz failed – redirecting and closing popup.");

        // 1) Force the last external tab back to the original URL
        if (lastExternalTabId !== null && sessionData.originalUrl) {
            chrome.tabs.update(lastExternalTabId, {
                url: sessionData.originalUrl,
            });
        }

        // 2) Close the quiz popup tab itself
        if (sender.tab && sender.tab.id) {
            chrome.tabs.remove(sender.tab.id);
        }

        // 3) Tear down the session so nothing else fires
        quizOpened = false;
        lastCaptureTime = 0;
    }
    if (message.action === "quizPassed") {
        lastCaptureTime = Date.now();
        quizOpened = false;

        // use book.jpg as the notification icon
        const iconPath = chrome.runtime.getURL("book1.jpg");
        chrome.notifications.create(
            "victory",
            {
                type: "basic",
                iconUrl: iconPath,
                title: "You win this time!",
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
            console.log("🔒 Closed quiz popup tab");
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
    if (!trackingEnabled) return;

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
    console.log("🔍 Checking tab:", url);

    // ✅ Only check if user is off-task
    if (sessionData.originalUrl && url.includes(sessionData.originalUrl)) {
        console.log("✅ Still on original site.");
        quizOpened = false; // Reset quizOpened when on the original site
        return;
    }

    chrome.windows.getCurrent({}, (window) => {
        if (window.id !== undefined) {
            chrome.tabs.captureVisibleTab(
                window.id,
                { format: "jpeg", quality: 30 },
                async (dataUrl) => {
                    if (!dataUrl) return;

                    const base64Image = dataUrl.split(",")[1];

                    const payload = {
                        url,
                        screenshot: base64Image,
                        topic: sessionData.topic,
                    };

                    try {
                        // 🔁 Send to backend
                        const response = await fetch(
                            "http://localhost:3000/verify-activity",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                            }
                        );

                        const result = await response.json();
                        console.log("🧠 Relevance result:", result);

                        // ✅ Trigger quiz if off-topic
                        if (
                            !result.isRelevant &&
                            !url.includes(sessionData.originalUrl)
                        ) {
                            console.log(
                                "🚨 Page is off-topic and not the original URL"
                            );

                            if (!quizOpened) {
                                console.log("🔁 Opening quiz popup...");
                                chrome.windows.create({
                                    url: `chrome-extension://${chrome.runtime.id}/index.html#/quiz`,
                                    type: "popup",
                                    width: 360,
                                    height: 500,
                                });
                                quizOpened = true;
                            }
                        }
                    } catch (err) {
                        console.error("❌ Error verifying activity:", err);
                    }
                }
            );
        }
    });
}

// Run once per minute to check the current tab
// setInterval(async () => {
//     // Query the currently active tab in the current window
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (!tab) return;

//     // Trigger screenshot and analysis
//     handleTabChange(tab);
//   }, 60_000); // 60,000 ms = 1 minute

// checkIntervalId = window.setInterval(async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (!tab) return;
//     handleTabChange(tab);
//   }, 60_000); // 60,000 ms = 1 minute, change here if you want to wait longer

// Optional: Also run screenshot logic immediately when tab changes
chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    // _ is a placeholder for tabId
    if (changeInfo.status === "complete") {
        handleTabChange(tab);
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    handleTabChange(tab);
});

// 1) When the extension is installed or reloaded, schedule a 1-minute alarm
chrome.runtime.onInstalled.addListener(() => {
    console.log("🔔 Scheduling capture Alarm every minute");
    chrome.alarms.create("captureAlarm", { periodInMinutes: 0.25 });
});

// 2) Respond to the alarm firing
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== "captureAlarm") return;
    console.log("⏰ Alarm fired — capturing tab");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) handleTabChange(tabs[0]);
    });
});

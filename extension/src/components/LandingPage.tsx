import { useNavigate } from "react-router-dom";
import { getActiveTabURL } from "../utils/urlTracker";
import RippleButton from "./RippleButton.tsx";
import { useEffect, useState } from "react";
import "../LandingPage.css";

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<{
    originalUrl: string | null;
    topic: string | null;
  }>({ originalUrl: null, topic: null });

  useEffect(() => {
    chrome.runtime.sendMessage({ action: "getSessionData" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error getting session data:",
          chrome.runtime.lastError.message
        );
        return;
      }
      setSessionData(response);
    });
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      const url = await getActiveTabURL();

      localStorage.setItem("original_url", url);
      chrome.runtime.sendMessage(
        {
          action: "saveOriginalUrl",
          url: url,
        },
        () => {
          console.log("✅ Sent original URL to background:", url);
          navigate("/topic");
        }
      );
    } catch (err) {
      console.error("Failed to get URL:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log("sessionData", sessionData);

  if (sessionData.topic) {
    return (
      <div className="landing">
        <h1>Welcome back!</h1>
        <p>Your last topic was: {sessionData.topic}</p>
        <RippleButton onClick={() => navigate("/topic")}>
          Set new topic
        </RippleButton>

        {isTracking ? (
          <button
            className="base-button stop-tracking-btn"
            onClick={() => {
              chrome.runtime.sendMessage({ action: "stopTracking" });
              console.log("🛑 Stopped taking pictures");
              setIsTracking(false);
              // ▶️ Option A: no window.close(), let the button text update
            }}
          >
            Pause Session
          </button>
        ) : (
          <button
            className="base-button stop-tracking-btn"
            onClick={() => {
              chrome.runtime.sendMessage({ action: "startTracking" });
              console.log("▶️ Continue screenshots");
              setIsTracking(true);
              // ▶️ Option A: no window.close(), let the button text update
            }}
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="landing">
      <h1>Welcome to Asian Mom Simulator!</h1>
      <RippleButton onClick={handleStart}>
        {loading ? "Loading..." : "Welcome!"}
      </RippleButton>
    </div>
  );
};

export default LandingPage;

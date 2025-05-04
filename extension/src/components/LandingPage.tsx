import { useNavigate } from 'react-router-dom';
import { getActiveTabURL } from '../utils/urlTracker';
import RippleButton from "./RippleButton.tsx"; // Import the RippleButton
import { useState } from 'react';
import '../LandingPage.css';
const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleStart = async () => {
    try {
      setLoading(true);
      const url = await getActiveTabURL();
      
      // Save in localStorage (optional), and send to background script
      localStorage.setItem("original_url", url);
      chrome.runtime.sendMessage({
        action: "saveOriginalUrl",
        url: url
      }, () => {
        console.log("✅ Sent original URL to background:", url);
        navigate("/topic");
      });
    } catch (err) {
      console.error("Failed to get URL:", err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="landing">
      <h1>Welcome to Asian Mom Simulator!</h1>
      <RippleButton onClick={handleStart}>{loading ? "Loading..." : "Welcome!"}</RippleButton>
    </div>
  );
};

export default LandingPage;

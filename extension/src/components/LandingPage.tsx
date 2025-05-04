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
      localStorage.setItem("original_url", url);     // saving the original URL to local storage then moves to quiz page
      navigate("/quiz");                             
    } catch (err) {
      console.error("Failed to get URL:", err);
    }finally {
      setLoading(false); // Reset loading state
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

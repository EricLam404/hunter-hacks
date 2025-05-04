import { useNavigate } from 'react-router-dom';
import { getActiveTabURL } from '../utils/urlTracker';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      const url = await getActiveTabURL();           
      localStorage.setItem("original_url", url);     // saving the original URL to local storage then moves to quiz page
      navigate("/quiz");                             
    } catch (err) {
      console.error("Failed to get URL:", err);
    }
  };

  return (
    <div className="landing">
      <h1>Welcome to Asian Mom Simulator!</h1>
      <button onClick={handleStart}>Get Started</button>
    </div>
  );
};

export default LandingPage;

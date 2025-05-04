import { useState } from "react";
import '../App.css'

const TopicPage = () => {
  const [topic, setTopic] = useState("");


  const handleSubmit = () => {
    if (!topic.trim()) return;

    // Save topic to background service worker
    chrome.runtime.sendMessage({ action: "saveTopic", topic }, () => {
      localStorage.setItem("topic", topic);
      console.log("✅ Topic sent to background:", topic);
      window.close(); // closes the popup
    });
  };

  return (
    <div className = "container">
      <div className="topic-box">
        <p >Enter Your Topic</p>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis"
          className="topic-box input"
        />
        <button onClick={handleSubmit} className="input-box">
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default TopicPage;

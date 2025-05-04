import { useState } from "react";

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
    <div className="container">
      <h2 className="topic-box">Enter Your Topic</h2>
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
  );
};

export default TopicPage;

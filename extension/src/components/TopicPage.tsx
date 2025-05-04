import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TopicPage = () => {
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!topic.trim()) return;

    chrome.runtime.sendMessage({ action: "saveTopic", topic }, () => {
      console.log("✅ Topic sent to background:", topic);
      navigate("/quiz");
    });
  };

  return (
    <div className="topic-container">
      <h2>Enter Your Topic</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Photosynthesis"
        className="topic-input"
      />
      <button onClick={handleSubmit} className="topic-button">
        Start Quiz
      </button>
    </div>
  );
};

export default TopicPage;

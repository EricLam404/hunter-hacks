// QuizPage.tsx
import { useState, useEffect } from 'react';
import { Quiz } from '../quiz';
import { getActiveTabURL } from '../utils/urlTracker';

const QuizPage = () => {
  //const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState('');
  //const [showInput, setShowInput] = useState<boolean>(true);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [corrects, setCorrects] = useState<number>(0);
  const [inputTopic,setInputTopic] = useState<string>("");
  const [tracker,setTracker] = useState<boolean>(true);
  useEffect(() => {
    console.log("\nuse Effect: ");
    console.log("quiz length: " + quiz.length);
    console.log(quiz);
    console.log("current Index: " + currentIndex);
    console.log("corrects: " + corrects);
  }, [quiz, currentIndex, corrects]);

  useEffect(() => {
    const savedQuizzes = localStorage.getItem("quizList");
    const savedCorrects = localStorage.getItem("corrects");
    const savedCurrentIndex = localStorage.getItem("currentIndex");

    if (savedCurrentIndex !== null) {
      setCurrentIndex(Number(savedCurrentIndex));
    }

    if (savedQuizzes) {
      try {
        const parsed = JSON.parse(savedQuizzes);
        if (Array.isArray(parsed)) {
          setQuiz(parsed.map(q => new Quiz(q.question, q.choices, q.answer)));
        } else {
          console.warn("Parsed quiz data is not an array");
        }
      } catch (err) {
        console.error("Failed to parse quiz list:", err);
      }
    }

    if (savedCorrects) {
      setCorrects(JSON.parse(savedCorrects));
    }

    if (savedCurrentIndex) {
      setCorrects(JSON.parse(savedCurrentIndex));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quizList", JSON.stringify(quiz));
    localStorage.setItem("corrects", JSON.stringify(corrects));
    localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
  }, [quiz, corrects, currentIndex]);
  const handleTracking = (): void =>{
    if(tracker == true){
      setTracker(false);
    }else{
      setTracker(true);
    }

  }
  const fetchQuizFromAPI = async (topic: string) => {
    console.log("fetchQuizFromAPI was called");
  
    if (topic !== "") {
      try {
        const url = localStorage.getItem("original_url") || "";
        console.log("📦 Fetched original_url from storage:", url);
  
        // ✅ Save the session (url + topic)
        await saveSession(url, topic);
  
        // ✅ Then generate the quiz
        console.log("Generating quiz for topic:", topic);
        const response = await fetch("http://localhost:3000/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ topic })
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }
  
        const data = await response.json();
        console.log("Fetched quiz data:", data);
  
        const newQuizzes = data.map((q: Quiz) =>
          new Quiz(q.question, q.options, q.answer)
        );
  
        setQuiz(newQuizzes);
        setCurrentIndex(0);
        setCorrects(0);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      }
    } else {
      alert("❌ Please enter a topic");
    }
  };
  

  const QuizPopup: React.FC<{ quiz: Quiz, onAnswer: (choice: string) => void }> = ({ quiz, onAnswer }) => {
    return (
      <div className="quiz">
        <h3>{quiz.question}</h3>
        {quiz.options.map((choice, i) => (
          <button key={i} onClick={() => onAnswer(choice)}>
            {choice}
          </button>
        ))}
      </div>
    );
  };

  // const handleUrl = (): void => {
  //   if (showInput) {
  //     setShowInput(false);
  //     console.log(url);
  //   } else {
  //     setShowInput(true);
  //   }
  // };

  useEffect(() => {
    if(tracker){
      getActiveTabURL().then(setCurrentUrl).catch(console.error);
    }
    console.log(currentUrl);
  }, []);

  // Retrieves the original url from local storage and log console to check
  useEffect(() => {
    const originalUrl = localStorage.getItem("original_url");
    console.log("Original URL from Landing Page:", originalUrl);
  }, []);

  const saveSession = async (url: string, topic: string) => {
    try {
      const response = await fetch("http://localhost:3000/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ original_url: url, topic })
      });
  
      const data = await response.json();
      console.log("✅ Session saved:", data);
    } catch (error) {
      console.error("❌ Error saving session:", error);
    }
  };
  
  return (
    <>
      {/* <div style={{ padding: '1rem', width: '250px' }}>
        <h3>Current Tab URL:</h3>
        <p style={{ wordWrap: 'break-word' }}>{currentUrl || 'Loading...'}</p>
      </div> */}

      <div className="container">
        <div className="header">
          <a></a>
          <h1>Asian Mother Simulator!</h1>
        </div>

        <div className = "topic-box">
          {quiz.length == 0 && (<p>Enter Topic!</p>)}
          {quiz.length == 0 && (<input
            className="topic"
            placeholder = "Please enter a topic!"
            onChange={(e) => setInputTopic(e.target.value)}
          />)}
          {quiz.length == 0 && (<button className="dev" onClick={() => fetchQuizFromAPI(inputTopic)}> Quiz TEMPORARY </button>)}
        </div>
          
        <div className="input-box">
          {/* {showInput && quiz.length == 0 &&(
            <input
              type="text"
              value={url}
              placeholder = "textbook url"
              onChange={(e) => setUrl(e.target.value)}
            />
          )}
          {showInput && quiz.length == 0 && <button onClick={handleUrl}>Enter</button>}
          {!showInput && quiz.length == 0 && <button onClick={handleUrl}>Return</button>}
          {quiz.length == 0 && (
          <div>
            {showInput ? (
              <p>Insert link of textbook</p>
            ) : (
              <p>Link inputted!</p>
            )}
          </div>
          )} */}
          {currentIndex < quiz.length && (
            <QuizPopup
              quiz={quiz[currentIndex]}
              onAnswer={(choice: string) => {
                const correct = choice === quiz[currentIndex].answer;
                alert(correct ? "Correct!" : "Incorrect!");
                let newCorrects = corrects;
                if (correct) {
                  newCorrects = corrects + 1;
                  setCorrects(newCorrects);
                }
                if (currentIndex + 1 < quiz.length) {
                  setCurrentIndex(prev => prev + 1);
                } else {
                  let calc = Math.round((newCorrects / quiz.length) * 100);
                  alert("Quiz complete! you got: " + calc + "%");
                  alert(calc > 90 ? "nice" : "do better");
                  setQuiz([]);
                  setCorrects(0);
                  setCurrentIndex(0);
                  calc = 0;
                }
              }}
            />
          )}
          <div className = "footer">
            {quiz.length == 0 && (
            <button onClick={() => handleTracking()}> {tracker ? "Stop tracking" : "Start tracking"}
            </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizPage;

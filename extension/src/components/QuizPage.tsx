// QuizPage.tsx
import { useState, useEffect } from 'react';
import { Quiz } from '../quiz';
import { getActiveTabURL } from '../utils/urlTracker';

const QuizPage = () => {
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState('');
  const [showInput, setShowInput] = useState<boolean>(true);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [corrects, setCorrects] = useState<number>(0);

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

  const fetchQuizFromAPI = async (topic: string) => {
    console.log("fetchQuizFromAPI was called");
    try {
      const response = await fetch("http://localhost:3000/generate", {
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

  const handleUrl = (): void => {
    if (showInput) {
      setShowInput(false);
      console.log(url);
    } else {
      setShowInput(true);
    }
  };

  useEffect(() => {
    getActiveTabURL().then(setCurrentUrl).catch(console.error);
    console.log(currentUrl);
  }, []);

  // Retrieves the original url from local storage and log console to check
  useEffect(() => {
    const originalUrl = localStorage.getItem("original_url");
    console.log("Original URL from Landing Page:", originalUrl);
  }, []);
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

        <div className="input-box">
          {showInput && (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}
          {showInput && <button onClick={handleUrl}>Enter</button>}
          {!showInput && <button onClick={handleUrl}>Return</button>}

          {showInput ? (
            <p>Insert link of textbook</p>
          ) : (
            <p>Link inputted!</p>
          )}

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
                }
              }}
            />
          )}
        </div>

        <button className="dev" onClick={() => fetchQuizFromAPI("science")}>
          Quiz Example TEMPORARY
        </button>
      </div>
    </>
  );
};

export default QuizPage;

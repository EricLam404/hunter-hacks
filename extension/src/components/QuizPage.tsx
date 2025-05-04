// QuizPage.tsx
import { useState, useEffect } from 'react';
import { Quiz } from '../quiz';
// import { getActiveTabURL } from '../utils/urlTracker';

const QuizPage = () => {
  //const [url, setUrl] = useState("");
  // const [currentUrl, setCurrentUrl] = useState('');
  //const [showInput, setShowInput] = useState<boolean>(true);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [corrects, setCorrects] = useState<number>(0);
  // const [inputTopic,setInputTopic] = useState<string>("");
// const [tracker,setTracker] = useState<boolean>(true);
const [selected, setSelected] = useState<string | null>(null);

  
  
  // ---------------------------------------------------------------------------
  // 1) Auto-load the topic saved earlier and fetch the quiz immediately
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const storedTopic = localStorage.getItem("topic");
    console.log("ℹ️ [QuizPage] useEffect firing, storedTopic =", storedTopic);
    if (storedTopic) {
      fetchQuizFromAPI(storedTopic).catch(e => {
        console.error("💥 fetchQuizFromAPI threw:", e);
        alert("Error fetching quiz—see console");
      });
    } else {
      console.warn("⚠️ No topic found in localStorage");
    }
  }, []);
  

  // ---------------------------------------------------------------------------
  // 2) Persist quiz progress in localStorage (optional)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem('quizList', JSON.stringify(quiz));
    localStorage.setItem('corrects', JSON.stringify(corrects));
    localStorage.setItem('currentIndex', JSON.stringify(currentIndex));
  }, [quiz, corrects, currentIndex]);

  // ---------------------------------------------------------------------------
  // 3) Utility: Save session info when generating quiz
  // ---------------------------------------------------------------------------
  const saveSession = async (url: string, topic: string) => {
    try {
      await fetch('http://localhost:3000/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_url: url, topic }),
      });
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  };

  // ---------------------------------------------------------------------------
  // 4) Generate quiz from API using the provided topic
  // ---------------------------------------------------------------------------
  const fetchQuizFromAPI = async (topic: string) => {
    console.log('🔄 fetchQuizFromAPI called with topic:', topic);
    if (!topic) {
      alert('No topic provided.');
      return;
    }

    try {
      const originalUrl = localStorage.getItem('original_url') || '';
      console.log('📦 Original URL for session:', originalUrl);
      await saveSession(originalUrl, topic);

      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error('Failed to fetch quiz');

      const data = await response.json();
      console.log('✅ Quiz data received:', data);

      // Map API response into Quiz instances
      const newQuizzes = data.map((q: any) => new Quiz(q.question, q.options, q.answer));
      setQuiz(newQuizzes);
      setCurrentIndex(0);
      setCorrects(0);
    } catch (err) {
      console.error('❌ Error fetching quiz:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // 5) Quiz display component
  // ---------------------------------------------------------------------------
  const QuizPopup: React.FC<{ quiz: Quiz; onAnswer: (c: string) => void }> = ({ quiz, onAnswer }) => {
    return (
      <div className="quiz">
        <h3>{quiz.question}</h3>
        {quiz.options.map((choice) => {
          // figure out which button to color
          const isSelected = selected === choice;
          const isCorrect  = selected !== null && choice === quiz.answer;
          const isWrong    = selected !== null && isSelected && choice !== quiz.answer;
  
          // decide background color inline
          const bgColor = isCorrect
            ? '#2ecc71'    // green when correct
            : isWrong
            ? '#e74c3c'    // red when wrong
            : '#1a1a1a';   // default button background
  
          return (
            <button
              key={choice}
              disabled={selected !== null}       // only one click allowed
              onClick={() => selected === null && onAnswer(choice)}
              style={{
                backgroundColor: bgColor,        // inline style wins over CSS
                color: '#fff',                   // keep text white
                width: '100%',                   // full-width buttons
                padding: '0.75rem',
                margin: '0.25rem 0',
                border: 'none',
                borderRadius: '6px',
                cursor: selected === null ? 'pointer' : 'default',
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>
    );
  };
  

  // ---------------------------------------------------------------------------
  // 6) Track active tab URL (optional UI or debugging)
  // ---------------------------------------------------------------------------
  // useEffect(() => {
  //   if (tracker) {
  //     getActiveTabURL().then(setCurrentUrl).catch(console.error);
  //   }
  // }, []);

  // ---------------------------------------------------------------------------
  // 7) Handle user's answer selection
  // ---------------------------------------------------------------------------
  const handleAnswer = (choice: string) => {
    // 1) mark which they clicked & update score
    setSelected(choice);
    if (choice === quiz[currentIndex].answer) {
      setCorrects(c => c + 1);
    }
  
    // Are we on the last question?
    const isLast = currentIndex + 1 >= quiz.length;
  
    // schedule either “next question” or “end of quiz”
    window.setTimeout(() => {
      if (!isLast) {
        // 2a) move to the next question
        setSelected(null);
        setCurrentIndex(i => i + 1);
      } else {
        // 2b) quiz is over: compute final score
        const score = corrects + (choice === quiz[currentIndex].answer ? 1 : 0);
        
        // notify background of pass/fail
        if (score === quiz.length) {
          console.log("🎉 Quiz passed!");
          chrome.runtime.sendMessage({ action: "quizPassed" });
        } else {
          console.log("💥 Quiz failed — score:", score);
          chrome.runtime.sendMessage({ action: "quizFailed" });
        }
  
        // reset your quiz UI for next time
        setSelected(null);
        setQuiz([]);           // clear all questions
        setCurrentIndex(0);
        setCorrects(0);
      }
    }, 1500);
  };
  
  //Handles the start and stop tracking button
  // const handleStopClick = () => {
  //   chrome.runtime.sendMessage({ action: "stopTracking" });
  //   window.close(); // if you want the popup to auto‐close
  // };
  
  

  // useEffect(() => {
  //   console.log("\nuse Effect: ");
  //   console.log("quiz length: " + quiz.length);
  //   console.log(quiz);
  //   console.log("current Index: " + currentIndex);
  //   console.log("corrects: " + corrects);
  // }, [quiz, currentIndex, corrects]);

  // useEffect(() => {
  //   const savedQuizzes = localStorage.getItem("quizList");
  //   const savedCorrects = localStorage.getItem("corrects");
  //   const savedCurrentIndex = localStorage.getItem("currentIndex");

  //   if (savedCurrentIndex !== null) {
  //     setCurrentIndex(Number(savedCurrentIndex));
  //   }

  //   if (savedQuizzes) {
  //     try {
  //       const parsed = JSON.parse(savedQuizzes);
  //       if (Array.isArray(parsed)) {
  //         setQuiz(parsed.map(q => new Quiz(q.question, q.choices, q.answer)));
  //       } else {
  //         console.warn("Parsed quiz data is not an array");
  //       }
  //     } catch (err) {
  //       console.error("Failed to parse quiz list:", err);
  //     }
  //   }

  //   if (savedCorrects) {
  //     setCorrects(JSON.parse(savedCorrects));
  //   }

  //   if (savedCurrentIndex) {
  //     setCorrects(JSON.parse(savedCurrentIndex));
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem("quizList", JSON.stringify(quiz));
  //   localStorage.setItem("corrects", JSON.stringify(corrects));
  //   localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
  // }, [quiz, corrects, currentIndex]);
  // const handleTracking = (): void =>{
  //   if(tracker == true){
  //     setTracker(false);
  //   }else{
  //     setTracker(true);
  //   }

  // }
  // const fetchQuizFromAPI = async (topic: string) => {
  //   console.log("fetchQuizFromAPI was called");
  
  //   if (topic !== "") {
  //     try {
  //       const url = localStorage.getItem("original_url") || "";
  //       console.log("📦 Fetched original_url from storage:", url);
  
  //       // ✅ Save the session (url + topic)
  //       await saveSession(url, topic);
  
  //       // ✅ Then generate the quiz
  //       console.log("Generating quiz for topic:", topic);
  //       const response = await fetch("http://localhost:3000/api/generate", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({ topic })
  //       });
  
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch quiz");
  //       }
  
  //       const data = await response.json();
  //       console.log("Fetched quiz data:", data);
  
  //       const newQuizzes = data.map((q: Quiz) =>
  //         new Quiz(q.question, q.options, q.answer)
  //       );
  
  //       setQuiz(newQuizzes);
  //       setCurrentIndex(0);
  //       setCorrects(0);
  //     } catch (err) {
  //       console.error("Error fetching quiz:", err);
  //     }
  //   } else {
  //     alert("❌ Please enter a topic");
  //   }
  // };
  

  // const QuizPopup: React.FC<{ quiz: Quiz, onAnswer: (choice: string) => void }> = ({ quiz, onAnswer }) => {
  //   return (
  //     <div className="quiz">
  //       <h3>{quiz.question}</h3>
  //       {quiz.options.map((choice, i) => (
  //         <button key={i} onClick={() => onAnswer(choice)}>
  //           {choice}
  //         </button>
  //       ))}
  //     </div>
  //   );
  // };

  // // const handleUrl = (): void => {
  // //   if (showInput) {
  // //     setShowInput(false);
  // //     console.log(url);
  // //   } else {
  // //     setShowInput(true);
  // //   }
  // // };

  // useEffect(() => {
  //   if(tracker){
  //     getActiveTabURL().then(setCurrentUrl).catch(console.error);
  //   }
  //   console.log(currentUrl);
  // }, []);

  // // Retrieves the original url from local storage and log console to check
  // useEffect(() => {
  //   const originalUrl = localStorage.getItem("original_url");
  //   console.log("Original URL from Landing Page:", originalUrl);
  // }, []);

  // const saveSession = async (url: string, topic: string) => {
  //   try {
  //     const response = await fetch("http://localhost:3000/save-session", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({ original_url: url, topic })
  //     });
  
  //     const data = await response.json();
  //     console.log("✅ Session saved:", data);
  //   } catch (error) {
  //     console.error("❌ Error saving session:", error);
  //   }
  // };
  
  return (
    <>
      {/* <div style={{ padding: '1rem', width: '250px' }}>
        <h3>Current Tab URL:</h3>
        <p style={{ wordWrap: 'break-word' }}>{currentUrl || 'Loading...'}</p>
      </div> */}

      <div className="container">
        <div className="header">
          <a></a>
          <h1>WYD?</h1>
        </div>

       {/* Loading message */}
        {quiz.length === 0 && <p>Generating quiz, please wait…</p>}

{/* 

        <div className = "topic-box">
          {quiz.length == 0 && (<p>Enter Topic!</p>)}
          {quiz.length == 0 && (<input
            className="topic"
            placeholder = "Please enter a topic!"
            onChange={(e) => setInputTopic(e.target.value)}
          />)}
          {quiz.length == 0 && (<button className="dev" onClick={() => fetchQuizFromAPI(inputTopic)}> Quiz TEMPORARY </button>)}
        </div> */}
{/*          
        <div className="input-box">
           {showInput && quiz.length == 0 &&(
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
          {/* <div className="input-box">
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
          )} */}

      {/* Display quiz questions when ready */}
      <div className="input-box">
        {currentIndex < quiz.length && (
          <QuizPopup quiz={quiz[currentIndex]} onAnswer={handleAnswer} />
        )}
          <div className = "footer">
            {(
                <button
                  className="base-button stop-tracking-btn"
                  onClick={() => {
                    // 1) Tell the background script to stop all tracking
                    chrome.runtime.sendMessage({ action: 'stopTracking' });
                    // 2) Immediately close this popup
                    window.close();
                }}
              >
                Stop tracking
              </button>

            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizPage;

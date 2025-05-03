import { useState,useEffect } from 'react'
import "./App.css"
import { Quiz } from "./quiz.tsx"
export function App() {
  //Textbook URL
  const [url,setUrl] = useState("");
  //Textbook Input
  const [showInput,setShowInput] = useState<boolean>(true);

  //List of Quizzes
  const [quiz,setQuiz] = useState<Quiz[]>([]);
  //Index of current Quiz
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  //Amount of Corrects of a Question
  const [corrects, setCorrects] = useState<number>(0);

  // const [quizzesCompleted,SetQuizzesCompleted] = useState<boolean>(false);

  //const [saveData,setSaveData] = useState<boolean>(true);
  //console logging each useState to make sure each value is correct
  useEffect(() => {
    console.log("\nuse Effect: ")
    console.log("quiz length: " + quiz.length);
    console.log(quiz);
    console.log("current Index: " + currentIndex);
    console.log("corrects: " + corrects);

  }, [quiz,currentIndex,corrects]);
  
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

    if(savedCorrects){
      setCorrects(JSON.parse(savedCorrects));
    }

    if(savedCurrentIndex){
      setCorrects(JSON.parse(savedCurrentIndex));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("quizList", JSON.stringify(quiz));
    localStorage.setItem("corrects", JSON.stringify(corrects));
    localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
  }, [quiz,corrects,currentIndex ]);
  //removes all the localstorage
  // const handleReset = () => {
  //   setQuiz([]);  // Clear the quiz list
  //   setCurrentIndex(0); // Reset the current index to 0
  //   setCorrects(0); // Reset the score/correct answers count
  //   localStorage.removeItem("quizList"); // Clear quizList from localStorage
  //   localStorage.removeItem("corrects"); // Clear correct answers from localStorage
  //   localStorage.removeItem("currentIndex"); // Clear currentIndex from localStorage
  // };

  /* 
    To display the Quiz in our tab
  */ 
  type QuizPopupProps = {
    quiz: Quiz;
    onAnswer: (choice: string) => void;
  };
  const QuizPopup: React.FC<QuizPopupProps> = ({ quiz, onAnswer }) => {
    return (
      <div className="container">
        <div className="quiz">
          <h3>{quiz.question}</h3>
          {quiz.choices.map((choice, i) => (
            <button key={i} onClick={() => onAnswer(choice)}>
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleUrl = (): void => {
    if(showInput == true){
      setShowInput(false);
      console.log(url);

      //send urlto the openAI and scan content;
    }else{
      setShowInput(true);
    }
  };
/*
  input a specific question,choie, and answer to the quiz array
*/ 
  const handleQuiz = (
    question: string,
    choices: string[],
    answer: string
  ): void => {

    //  TESTING
    try {
      const q = new Quiz(question, choices, answer);
      for(let i =0; i < 3;i++){
        setQuiz(prev => [...prev, q]);
      }
    } catch (err) {
      console.error("Failed to create quiz:", err);
    }
  };

  return (
    <>
      <div className = "container">
        <div className = "header">
          {/* logo and name*/} 
          <a></a>
          <h1>Title</h1>
        </div>
        <div className="input-box">

          {/* url input*/}
          {showInput && (<input type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}/>)}
          {/* enter*/}
          {showInput && (<button 
          onClick={() => handleUrl()}>Enter</button>)}

          {/* return*/}
          {!showInput && (<button 
          onClick={() => handleUrl()}>return</button>)}

          {showInput && (<p>Insert link of textbook</p>)}
          {!showInput && (<p>Link inputed!</p>)}

          {/* quiz stuff*/}
          {currentIndex < quiz.length && (
          <QuizPopup
            quiz={quiz[currentIndex]}
            onAnswer={(choice: string) => {
              
              //checking if they were correct or not
              const correct = choice == quiz[currentIndex].answer;
              alert(correct ? "Correct!" : "Incorrect!");
              let newCorrects = corrects;
              if(correct){
                newCorrects = corrects + 1;
                setCorrects(newCorrects);
                console.log(newCorrects);
              }
              // tracks current quiz the user is on
              if (currentIndex + 1 < quiz.length) {
                setCurrentIndex(prev => prev + 1);
              } 
              else {
                let calc = Math.round((newCorrects/quiz.length)*100);
                alert("Quiz complete! you got: " + calc + "%");
                if(calc > 90){
                  alert("nice");
                }else if(calc < 90){
                  alert("do better");
                  //open link on their shit
                }
                //deletes quizzes
                setQuiz([]); 
                setCorrects(0);
                setCurrentIndex(0);
                calc = 0;
              }
            }}
            />
          )}
        </div>
        {/* This is temporary*/} 
       <button className = "dev" onClick={()=> handleQuiz("Question",["1","2","3","Answer"],"Answer")}>Quiz Example</button>
       {/* <button className = "dev" onClick={()=> handleReset()}>reset </button> */}
      </div>
    </>
  )
  
}

export default App

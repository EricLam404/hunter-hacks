import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import TopicPage from "./components/TopicPage"; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/topic" element={<TopicPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;

// export function App() {
//   //const [count, setCount] = useState(0)
//   const [url,setUrl] = useState("");
//   const [currentUrl,setCurrentUrl] = useState('');
  
//   const [showInput,setShowInput] = useState<boolean>(true);

//   //List of Quizzes
//   const [quiz,setQuiz] = useState<Quiz[]>([]);
//   //Index of current Quiz
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   //Amount of Corrects of a Question
//   const [corrects, setCorrects] = useState<number>(0);

//   // const [quizzesCompleted,SetQuizzesCompleted] = useState<boolean>(false);

//   //const [saveData,setSaveData] = useState<boolean>(true);
//   //console logging each useState to make sure each value is correct
//   useEffect(() => {
//     console.log("\nuse Effect: ")
//     console.log("quiz length: " + quiz.length);
//     console.log(quiz);
//     console.log("current Index: " + currentIndex);
//     console.log("corrects: " + corrects);

//   }, [quiz,currentIndex,corrects]);
  
//   useEffect(() => {
//     const savedQuizzes = localStorage.getItem("quizList");
//     const savedCorrects = localStorage.getItem("corrects");
//     const savedCurrentIndex = localStorage.getItem("currentIndex");
//     if (savedCurrentIndex !== null) {
//       setCurrentIndex(Number(savedCurrentIndex));
//     }

//     if (savedQuizzes) {
//       try {
//         const parsed = JSON.parse(savedQuizzes);
//         if (Array.isArray(parsed)) {
//           setQuiz(parsed.map(q => new Quiz(q.question, q.choices, q.answer)));
//         } else {
//           console.warn("Parsed quiz data is not an array");
//         }
//       } catch (err) {
//         console.error("Failed to parse quiz list:", err);
//       }
//     }

//     if(savedCorrects){
//       setCorrects(JSON.parse(savedCorrects));
//     }

//     if(savedCurrentIndex){
//       setCorrects(JSON.parse(savedCurrentIndex));
//     }
//   }, []);
  
//   useEffect(() => {
//     localStorage.setItem("quizList", JSON.stringify(quiz));
//     localStorage.setItem("corrects", JSON.stringify(corrects));
//     localStorage.setItem("currentIndex", JSON.stringify(currentIndex));
//   }, [quiz,corrects,currentIndex ]);
//   //removes all the localstorage
//   // const handleReset = () => {
//   //   setQuiz([]);  // Clear the quiz list
//   //   setCurrentIndex(0); // Reset the current index to 0
//   //   setCorrects(0); // Reset the score/correct answers count
//   //   localStorage.removeItem("quizList"); // Clear quizList from localStorage
//   //   localStorage.removeItem("corrects"); // Clear correct answers from localStorage
//   //   localStorage.removeItem("currentIndex"); // Clear currentIndex from localStorage
//   // };

//   /* 
//     To display the Quiz in our tab
//   */ 
//     const fetchQuizFromAPI = async (topic: string) => {
//       try {
//         const response = await fetch("http://localhost:3000/generate", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({ topic })
//         });
  
//         if (!response.ok) {
//           throw new Error("Failed to fetch quiz");
//         }
        
//         const data = await response.json();
//         console.log("Fetched quiz data:", data);
    
//         const newQuizzes = data.map((q: Quiz) => 
//           new Quiz(q.question, q.options, q.answer)
//         );
  
//         setQuiz(newQuizzes);
//         setCurrentIndex(0);
//         setCorrects(0);
//       } catch (err) {
//         console.error("Error fetching quiz:", err);
//       }
//     };
//   type QuizPopupProps = {
//     quiz: Quiz;
//     onAnswer: (choice: string) => void;
//   };
//   const QuizPopup: React.FC<QuizPopupProps> = ({ quiz, onAnswer }) => {
//     return (
//         <div className="quiz">
//           <h3>{quiz.question}</h3>
//           {quiz.options.map((choice, i) => (
//             <button key={i} onClick={() => onAnswer(choice)}>
//               {choice}
//             </button>
//           ))}
//         </div>
//     );
//   };

//   const handleUrl = (): void => {
//     if(showInput == true){
//       setShowInput(false);
//       console.log(url);

//       //send url to the openAI and scan content;
//     }else{
//       setShowInput(true);
//     }
//   };
// /*
//   input a specific question,choie, and answer to the quiz array
// */ 
//   // const handleQuiz = (
//   //   question: string,
//   //   choices: string[],
//   //   answer: string
//   // ): void => {

//   //   //  TESTING
//   //   try {
//   //     const q = new Quiz(question, choices, answer);
//   //     for(let i =0; i < 3;i++){
//   //       setQuiz(prev => [...prev, q]);
//   //     }
//   //   } catch (err) {
//   //     console.error("Failed to create quiz:", err);
//   //   }
//   // };
  
//   useEffect(() => {
//     getActiveTabURL().then(setCurrentUrl).catch(console.error);
//     console.log(currentUrl);
//   }, []);

//   return (
//     <>
//     <div style={{ padding: '1rem', width: '250px' }}>
//       <h3>Current Tab URL:</h3>
//       <p style={{ wordWrap: 'break-word' }}>{currentUrl || 'Loading...'}</p>
//     </div>

//       <div className = "container">
//         <div className = "header">
//           {/* logo and name*/} 
//           <a></a>
//           <h1>Title</h1>
//         </div>
//         <div className="input-box">

//           {/* url input*/}
//           {showInput && (<input type="text" 
//           value={url} 
//           onChange={(e) => setUrl(e.target.value)}/>)}
//           {/* enter*/}
//           {showInput && (<button 
//           onClick={() => handleUrl()}>Enter</button>)}

//           {/* return*/}
//           {!showInput && (<button 
//           onClick={() => handleUrl()}>return</button>)}

//           {showInput && (<p>Insert link of textbook</p>)}
//           {!showInput && (<p>Link inputed!</p>)}

//           {/* quiz stuff*/}
//           {currentIndex < quiz.length && (
//           <QuizPopup
//             quiz={quiz[currentIndex]}
//             onAnswer={(choice: string) => {
              
//               //checking if they were correct or not
//               const correct = choice == quiz[currentIndex].answer;
//               alert(correct ? "Correct!" : "Incorrect!");
//               let newCorrects = corrects;
//               if(correct){
//                 newCorrects = corrects + 1;
//                 setCorrects(newCorrects);
//               }
//               // tracks current quiz the user is on
//               if (currentIndex + 1 < quiz.length) {
//                 setCurrentIndex(prev => prev + 1);
//               } 
//               else {
//                 let calc = Math.round((newCorrects/quiz.length)*100);
//                 alert("Quiz complete! you got: " + calc + "%");
//                 if(calc > 90){
//                   alert("nice");
//                 }else if(calc < 90){
//                   alert("do better");
//                   //open link on their shit
//                 }
//                 //deletes quizzes
//                 setQuiz([]); 
//                 setCorrects(0);
//                 setCurrentIndex(0);
//                 calc = 0;
//               }
//             }}
//             />
//           )}
//         </div>
//         {/* This is temporary*/} 
//        <button className = "dev" onClick={()=> fetchQuizFromAPI("science")}>Quiz Example TEMPORARY</button>
//        {/* <button className = "dev" onClick={()=> handleReset()}>reset </button> */}
//       </div>
//     </>
//   )
  
// }

// export default App

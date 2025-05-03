import { useState } from 'react'
import "./App.css"
import { Quiz } from "./popup.tsx"
export function App() {
  //const [count, setCount] = useState(0)
  const [url,setUrl] = useState("");
  const [showInput,setShowInput] = useState<boolean>(true);
  const [quiz,setQuiz] = useState<Quiz[]>([]);
  
  const handleUrl = (): void => {
    if(showInput == true){
      setShowInput(false);
      console.log(url);

      //send urlto the openAI and scan content;
    }else{
      setShowInput(true);
    }
  };
  const displayQuiz = (): void => {
    quiz.forEach((q, index) => {
      console.log(`Question ${index + 1}: ${q.question}`);
      console.log("Choices:");
      q.choices.forEach((choice, i) => {
        //65 being ASCII value is A
        console.log(`  ${String.fromCharCode(65 + i)}. ${choice}`);
      });
    });
  }
  const handleQuiz = (): void => {
    const q = new Quiz("yes?", ["no","3","4","2"]);
    setQuiz(prev => [...prev, q]);
    console.log(quiz);
    displayQuiz();
  }

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
        </div>
        {/* This is temporary*/} 
       <button onClick={()=> handleQuiz()}>wewe</button>
      </div>
    </>
  )
  
}

export default App

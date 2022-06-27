import React, { useState, useEffect } from 'react';
import "./App.css";
import questions from "./data";

function App() {

  // Properties
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedArray,setSelectedArray]=useState([]);
  const [correctArray,setCorrectArray]=useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [feedbackImage, setFeedbackImage] = useState("");
  const [bestScore, setBestScore] = useState("");
  const [score, setScore] = useState(0);
  const [transition, setTransition] = useState("");

  const answerCorrect = .1;
  const answerIncorrect = .2;
  const answerMissed = .3;
  const questionNextDelay = 500;

  //shuffle the distractors
  const shuffleMatrix = (matrix) =>{
     for(let i = matrix.length-1; i > 0; i--){
          const j = Math.floor(Math.random() * i);
          const temp = matrix[i];
          matrix[i] = matrix[j];
          matrix[j] = temp;
     }
     return matrix;
   }

  //distractor was clicked
  const handleClick= (i) => {
    if (isActive == false) return;
    //change selected state
    let tempArray = [...selectedArray]
    if(tempArray[i] == i) {
      tempArray[i] = null;
    }else{
      tempArray[i] = i
      //this only has one answer, toggle off the others
      if (questions[currentQuestion].qtype == "samc"){
        for (let t of tempArray){
          if (tempArray[t] != i){
            tempArray[t] = null;
          }
        }
      }
    }
    //check if submit button is available
    let cnt = 0;
    for (let t of tempArray){
      if (tempArray[t] != null){
        cnt++;
        setIsDisabled(false);
        break;
      }
    }
    if (cnt==0) setIsDisabled(true);

    //change distractor state
    setSelectedArray(tempArray)
  }

  //check answer on submit
  const checkAnswer = () => {
    //disable click events
    setIsActive(false);
    //disable submit button
    setIsDisabled(true);

    let numCorrect = 0;
    let tempArray = [...correctArray];
    //for each item of the distractors array, check if answer is a correct one
    let correctAnsArr = [];
    for (let option of questions[currentQuestion].options) {
      if (option.isCorrect == true){
        correctAnsArr.push(option.id)
      }
    }
    //check if selected answer is correct or incorrect
    for (let curItem of selectedArray){
      //item has been selected
      if (curItem != null){
        //selected answer exists in correct array - match
        if (correctAnsArr.includes(curItem)){
          tempArray[curItem] = curItem+answerCorrect;
          numCorrect++;
        }else{ //selected answer does not exist in correct array - incorrect
          tempArray[curItem] = curItem+answerIncorrect;
        }
      }
    }
    //got all correct
    if (numCorrect == correctAnsArr.length){
      setScore(score + 1);
    }else{
      //check for correct answers not selected
      for (let corItem of correctAnsArr){
        //did not select correct answer
        if (!selectedArray.includes(corItem)){
            tempArray[corItem] = corItem+answerMissed;
        }
      }
    }
    setTransition('');
    setCorrectArray(tempArray);
  }

  //check next question
  const nextQuestion = () => {
    setTransition('fadeInAndOut');
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        resetRound();
        setCurrentQuestion(currentQuestion + 1);
      }else{
        //change feedback based on score
        let decimal = (score / questions.length)
        if (decimal == 1){
          setFeedback("You're a Trivia Master!");
          setFeedbackImage("perfect");
        }else if (decimal >= .7){
          setFeedback("Great Job!");
          setFeedbackImage("good");
        }else if (decimal >= .4){
          setFeedback("Not too bad.");
          setFeedbackImage("notbad");
        }else{
          setFeedback("You can do better.");
          setFeedbackImage("uhoh");
        }

        //local storage of best score and date
        let curBestScore = null;
        let curBestDate = null;
        //check if stored value exists
        if (localStorage.getItem('tlg-test-game-score') === null) {
          localStorage.setItem('tlg-test-game-score', decimal);
          localStorage.setItem('tlg-test-game-date', new Date().toLocaleDateString());
        }else{
          curBestScore = localStorage.getItem('tlg-test-game-score');
          curBestDate = localStorage.getItem('tlg-test-game-date');
          //check if new value is >= stored value
          if (decimal >= curBestScore){
            curBestScore = decimal;
            curBestDate = new Date().toLocaleDateString();
            localStorage.setItem('tlg-test-game-score', curBestScore);
            localStorage.setItem('tlg-test-game-date', curBestDate);
          }

          setBestScore("Your best score so far is "+ (curBestScore*100) +
          "%, which you last got on "+ curBestDate + ".");
        }
        setTransition('fadeIn');
        setShowResults(true);
      }
    }, questionNextDelay);
  }

  /* Resets the distractors & submit button */
  const resetRound = () => {
    setIsActive(true);
    setCorrectArray([]);
    setSelectedArray([]);
    setIsDisabled(true);
  };

  /* Resets the game back to default */
  const restartGame = () => {
    
    shuffleMatrix(questions);
    for (let i=0;i<questions.length;i++){
      shuffleMatrix(questions[i].options);
    }

    setTransition('fadeIn');
    resetRound();
    setScore(0);
    setCurrentQuestion(0);
    setShowResults(false);
  };


  return (
    <div className="App">

      {/* Show results or show the question  */}
      {showResults ? (
        /* Results */
        <div className={`final-results
           ${ feedbackImage }
           ${transition}
        `}>
            <h1>{feedback}</h1>

            <p>You scored {(score / questions.length) * 100}%<br/>
            by getting {score} out of {questions.length} questions correct.</p>
            <p>{bestScore}</p>

            <button className="retry" onClick={() => restartGame()}>Play again</button>

        </div>
      ) : (
        /* Question Card  */
        <div className="question-card">
            {/* Current Question  */}
            <div className="current-status">
              <span tabIndex="1">Question: {currentQuestion + 1} of {questions.length}</span>
              <span tabIndex="1">Score: {score}</span>
            </div>

            <h3 className="question-text" tabIndex="1" className={transition}>{questions[currentQuestion].text}</h3>

            {/* List of distractors  */}
            <ul className={transition}>
              {questions[currentQuestion].options.map((option) => {
                return (
                  <li
                    role="button"
                    tabIndex="1"
                    key={option.id}
                    disabled={!isActive}
                    className={`
                      ${ selectedArray[option.id]==option.id? "selected" : "" }
                      ${ correctArray[option.id]==(option.id+answerCorrect)? "correct" : "" }
                      ${ correctArray[option.id]==(option.id+answerIncorrect)? "incorrect" : "" }
                      ${ correctArray[option.id]==(option.id+answerMissed)? "missed" : "" }
                    `}
                    onClick={() => handleClick(option.id)}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        handleClick(option.id)
                      }
                    }}
                  >
                    {option.text}
                  </li>
                );
              })}
            </ul>

            {isActive ? (
              <button onClick={checkAnswer} disabled={isDisabled} className={transition}>
                Submit
              </button>
              ):(
                <button onClick={nextQuestion} className={transition}>
                  Next
                </button>
              )
            }
        </div>
      )}

      <div id="preload">
        <img rel="preload" src="./img/perfect.png" as="image" />
        <img rel="preload" src="./img/good.png" as="image" />
        <img rel="preload" src="./img/ok.png" as="image" />
        <img rel="preload" src="./img/uhoh.png" as="image" />
      </div>

    </div>
  );
}

export default App;

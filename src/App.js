import React, { useState } from "react";
import "./App.css";

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

  const questions = [
    {
      text: "If you have 10 mangos and another person gives you 12 more, how‌ ‌many‌ ‌mangos‌ ‌will‌ ‌you‌ ‌have‌ ‌in‌ ‌total?‌",
      qtype: "samc",
      options: [
        { id: 0, text: "1 mango", isCorrect: false },
        { id: 1, text: "2 mangos", isCorrect: false },
        { id: 2, text: "10 mangos", isCorrect: false },
        { id: 3, text: "22 mangos", isCorrect: true }
      ],
    },
    {
      text: "If‌ ‌a‌ ‌train‌ ‌is‌ ‌supposed‌ ‌to‌ ‌reach‌ ‌the‌ ‌station‌ ‌at‌ ‌4:10‌ ‌am‌. but‌ ‌it‌ ‌is ‌35‌ ‌minutes‌ late,‌ ‌at‌ ‌what‌ ‌time‌ ‌will ‌the‌ ‌train‌ ‌reach‌ ‌the‌ ‌station?‌ ‌",
      qtype: "samc",
      options: [
        { id: 0, text: "4:45 am", isCorrect: true },
        { id: 1, text: "3:00 am", isCorrect: false },
        { id: 2, text: "4:45 pm", isCorrect: false },
        { id: 3, text: "6:00 pm", isCorrect: false }
      ],
    },
    {
      text: "Which of these animals can fly? (Select all that apply)",
      qtype: "mamc",
      options: [
        { id: 0, text: "Cats", isCorrect: false },
        { id: 1, text: "Bats", isCorrect: true },
        { id: 2, text: "Birds", isCorrect: true },
        { id: 3, text: "Worms", isCorrect: false }
      ],
    },
    {
      text: "Which of the following is a list of colors?",
      qtype: "samc",
      options: [
        { id: 0, text: "Dog, cat, fish", isCorrect: false },
        { id: 1, text: "Earth, Mars, Venus, Saturn, Mercury, Jupiter, Neptune, Uranus", isCorrect: false },
        { id: 2, text: "Guitar, drums, piano, harmonica, tambourine, trumpet", isCorrect: false },
        { id: 3, text: "Red, orange, yellow, green, blue, indigo, violet", isCorrect: true }
      ],
    },
    {
      text: "If you are reading a book and are on page 374, what will the number of the next page be?",
      qtype: "samc",
      options: [
        { id: 0, text: "375", isCorrect: true },
        { id: 1, text: "373", isCorrect: false },
        { id: 2, text: "474", isCorrect: false },
        { id: 3, text: "400", isCorrect: false }
      ],
    },
  ];

  /* A distractor was clicked */
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

  /*check answer on submit */
  const checkAnswer = () => {
    //disable click events
    setIsActive(false);
    //disable submit button
    setIsDisabled(true);

    let numCorrect = 0;
    let tempArray = [...correctArray];
    //for each item of the distractors array, check if answer is
    let correctAnsArr = [];
    for (let option of questions[currentQuestion].options) {
      if (option.isCorrect == true){
        correctAnsArr.push(option.id)
      }
    }

    for (let curItem of selectedArray){
      if (curItem != null){
        if (correctAnsArr.includes(curItem)){
          tempArray[curItem] = curItem;
          numCorrect++;
        }else{
          tempArray[curItem] = curItem+"-";
        }
      }
    }
    setCorrectArray(tempArray);

    if (numCorrect == correctAnsArr.length){
      var newscore = score + 1;
      setScore(newscore);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        resetRound();
        setCurrentQuestion(currentQuestion + 1);
      }else{
        //change feedback based on score
        let decimal = (newscore / questions.length)
        if (decimal == 1){
          setFeedback("You're a Trivia Master!");
          setFeedbackImage("perfect");
        }else if (decimal >= .7){
          setFeedback("Great Job!");
          setFeedbackImage("good");
        }else if (decimal >= .4){
          setFeedback("Not too bad.");
          setFeedbackImage("ok");
        }else{
          setFeedback("You can do better.");
          setFeedbackImage("uhoh");
        }

        //local storage of best score and date
        let curBestScore = null;
        let curBestDate = null;

        if (localStorage.getItem('tlg-test-game-score') === null) {
          localStorage.setItem('tlg-test-game-score', decimal);
          localStorage.setItem('tlg-test-game-date', new Date().toLocaleDateString());
        }else{
          curBestScore = localStorage.getItem('tlg-test-game-score');
          curBestDate = localStorage.getItem('tlg-test-game-date');

          if (decimal > curBestScore){
            curBestScore = decimal;
            curBestDate = new Date().toLocaleDateString();
            localStorage.setItem('tlg-test-game-score', curBestScore);
            localStorage.setItem('tlg-test-game-date', curBestDate);
          }

          setBestScore("Your best score so far is "+ (curBestScore*100) +
          "%, which you got on "+ curBestDate + ".");
        }

        setShowResults(true);
      }
    }, 800);
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
        <div className={`final-results ${ feedbackImage }`}>
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
          <h2>

          </h2>
          <h3 className="question-text" tabIndex="1">{questions[currentQuestion].text}</h3>

          {/* List of distractors  */}
          <ul>
            {questions[currentQuestion].options.map((option) => {
              return (
                <li
                  role="button"
                  tabIndex="1"
                  key={option.id}
                  className={`
                    ${ selectedArray[option.id]==option.id? "selected" : "" }
                    ${ correctArray[option.id]==option.id? "correct" : "" }
                    ${ correctArray[option.id]==(option.id+"-")? "incorrect" : "" }
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
          <button onClick={checkAnswer} disabled={isDisabled} >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

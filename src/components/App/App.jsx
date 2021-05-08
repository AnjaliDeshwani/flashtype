import React from "react";
import "./App.css";
import Nav from "./../Nav/Nav";
import Landing from "../Landing/Landing";
import Footer from "./../Footer/Footer";
import ChallengeSection from "../ChallengeSection/ChallengeSection";
import { SAMPLE_PARAGRAPHS } from "./../../data/sampleParagraphs";

const TotalTime = 60;
const ServiceURL = "http://metaphorpsum.com/paragraphs/2/9";
const DefaultState = {
  slectedParagraph: "",
  timerStarted: false,
  timeRemaining: TotalTime,
  words: 0,
  characters: 0,
  wpm: 0,
  testInfo: [],
};

class App extends React.Component {
  state = DefaultState;

  fetchNewParagraphFallback = () => {
    const data =
      SAMPLE_PARAGRAPHS[Math.floor(Math.random() * SAMPLE_PARAGRAPHS.length)];
    const selectedParagraphArray = data.split("");
    const testInfo = selectedParagraphArray.map((selectedLetter) => {
      return {
        testLetter: selectedLetter,
        status: "notAttempted",
      };
    });
    this.setState({ ...DefaultState, testInfo, selectedParagraph: data });
  };

  fetchNewParagraph = () => {
    fetch(ServiceURL)
      .then((response) => response.text())
      .then((data) => {
        const selectedParagraphArray = data.split("");
        const testInfo = selectedParagraphArray.map((selectedLetter) => {
          return {
            testLetter: selectedLetter,
            status: "notAttempted",
          };
        });
        this.setState({ ...DefaultState, testInfo, selectedParagraph: data });
      });
  };

  componentDidMount() {
    //this.fetchNewParagraph();
    this.fetchNewParagraphFallback();
  }

  startTimer = () => {
    this.setState({ timerStarted: true });
    const timer = setInterval(() => {
      if (this.state.timeRemaining > 0) {
        //change the WPM
        const timeSpent = TotalTime - this.state.timeRemaining;
        const wpm =
          timeSpent > 0 ? (this.state.words / timeSpent) * TotalTime : 0;
        this.setState({
          timeRemaining: this.state.timeRemaining - 1,
          wpm: parseInt(wpm),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);
  };

  startAgain = () => this.fetchNewParagraphFallback();

  handleUserInput = (inputValue) => {
    if (!this.state.timerStarted) this.startTimer();
    console.log(inputValue);
    /* 
    1. Handle the underflow case - all the characters should be shown as non-attempted- no further computation should be there -early exit
    2. Hnadle the overflow case- When user has completed the whole paragraph typing, no more comparisons should be there-early exit
    3. Handle the backspace case
           -Mark the [index+1] element as non attempted(irrespective of whether the index is less than zero)
           -But, don't forget to check for the over-flow case here
           (index + 1 -> out of bound, when index === length-1)
    4. Update the status in the test info
         -Find out the last character in the input value and it's index --it would be O(1)
         - Check if the character at same index in testInfo (state) matches
            Yes -> "Correct"
            No -> "Incorrect"
    5. Irrespective of the case,characters, words, speed(wpm) can be updated
    */

    const characters = inputValue.length;
    const words = inputValue.split(" ").length;
    const index = characters - 1;

    //1 (one case is remaining if user backspace the whole word)
    if (index < 0) {
      this.setState({
        testInfo: [
          {
            testLetter: this.state.testInfo[0].testLetter,
            status: "notAttempted",
          },
          ...this.state.testInfo.slice(1),
        ],
        characters,
        words,
      });
      return;
    }

    //2
    if (index >= this.state.slectedParagraph.length) {
      this.setState({ characters, words });
      return;
    }

    // Make a copy of testInfo
    const testInfo = this.state.testInfo;
    if (!(index === this.state.slectedParagraph.length - 1))
      testInfo[index + 1].status = "notAttempted";

    //Check for the correct typed letter
    const isCorrect = inputValue[index] === testInfo[index].testLetter;

    //Update the testInfo
    testInfo[index].status = isCorrect ? "correct" : "incorrect";

    //Update the state
    this.setState({ testInfo, words, characters });
  };

  render() {
    return (
      <div className="app">
        {/* Nav Section */}
        <Nav />

        {/* Landing Page */}
        <Landing />

        {/* Challenge Section */}
        <ChallengeSection
          slectedParagraph={this.state.slectedParagraph}
          words={this.state.words}
          characters={this.state.characters}
          wpm={this.state.wpm}
          timeRemaining={this.state.timeRemaining}
          timerStarted={this.state.timerStarted}
          testInfo={this.state.testInfo}
          onInputChange={this.handleUserInput}
          startAgain={this.startAgain}
        />

        {/* Footer */}
        <Footer />
      </div>
    );
  }
}

export default App;

import _ from 'underscore';

const url = 'http://localhost:4000/data/highscores';

let playerScore = 0;
let highScores = [];

const handButtons = document.querySelectorAll('.hand-button');
const highScoresList = document.querySelector('#high-scores');
const scoreElement = document.querySelector('#score');
const playerHandElement = document.querySelector('#player-choice');
const computerHandElement = document.querySelector('#computer-choice');
const resultElement = document.querySelector('#result');
let playerName;

const form = document.querySelector('#form');
form.addEventListener('submit', (event) => {
  event.preventDefault();

  //console.log('in nameForm event listener')

  let nameInput = document.querySelector('#name');
  playerName = nameInput.value;
  console.log(playerName)

  const playerNameElement = document.querySelector('#player-name');
  playerNameElement.textContent = `Hello, ${playerName}!`;

  resetGame('lose');
});

async function resetGame(result) {
  if (result === 'win') {
    const topFiveScores = highScores.slice(0, 5);
    const lowestTopScore = topFiveScores[topFiveScores.length - 1];
    if (playerScore > 0 && (!lowestTopScore || playerScore > lowestTopScore.score)) {
      await postHighScore(playerName, playerScore);
      resetGame('highscore');
    } else {
      resetGame('lose');
    }
  } else if (result === 'lose') {
    // Set playerScore to 0 when the player loses
    playerScore = 0;
    // Display the game over screen
  } else if (result === 'highscore') {
    // Display the high score screen
  }
}

//this function fetch the data fron the backend
async function getHighScores() {
  try {
    const response = await fetch(url);
    if (response.ok) {
      highScores = await response.json();
      // Sort the highScores array in descending order by score
      highScores.sort((a, b) => b.score - a.score);
    } else {
      throw new Error('Failed to fetch high scores');
    }
  } catch (error) {
    console.error('Error retrieving high scores:', error);
    highScores = []; // Set highScores to an empty array in case of error
  }
  return highScores;
}

async function updateHighScores() {
  const updatedHighScores = await getHighScores();
  dispalyHighScores(updatedHighScores);
}
function dispalyHighScores(highScoresArray) {
  highScoresList.innerHTML = ''; // Clear the existing contents

  if (Array.isArray(highScoresArray)) {
    for (const highScore of highScoresArray) {
      const { name, score } = highScore;

      const listItem = document.createElement('li');
      listItem.innerHTML = `<span class="score-name">${name}</span>: <span class="score-value">${score}</span>`;
      highScoresList.append(listItem);
    }
  } else {
    console.error('Invalid high scores data:', highScores);
  }
}
getHighScores().then(dispalyHighScores);

//This function will POST the new object at the backend
async function postHighScore(name, score) {
  const data = { name: name, score: score };
  console.log('Posting new score', data);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, options);
  const message = await response.json();
  console.log(message);

  // After posting, update the high scores list
  updateHighScores();
}

function getComputerHand() {
  const hands = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * hands.length);
  return hands[randomIndex];
}

function getResult(playerHand, computerHand) {
  if (playerHand === computerHand) {
    return 'tie';
  } else if (
    (computerHand === 'rock' && playerHand === 'scissors') ||
    (computerHand === 'paper' && playerHand === 'rock') ||
    (computerHand === 'scissors' && playerHand === 'paper')
  ) {
    return 'computer';
  } else {
    return 'player';
  }
}

async function updateScore(result) {
  if (result === 'player') {
    playerScore++;
  } else if (result === 'computer') {
    if (playerScore > 0) {
      // Only check and update high scores if player has a score
      const playerHighScore = { name: playerName, score: playerScore };
      const topFiveScores = [...highScores, playerHighScore].sort(
        (a, b) => b.score - a.score
      );

      if (topFiveScores.length > 5) {
        topFiveScores.pop(); // Keep only the top 5 high scores
      }

      highScores = topFiveScores;
      await postHighScore(playerName, playerScore);
      getHighScores().then(dispalyHighScores);
    }

    playerScore = 0;

    resetGame();
  }
  scoreElement.textContent = `Score: ${playerScore}`;
}

function updateUI(playerHand = '', computerHand = '', result = '') {
  playerHandElement.textContent = `Your Choice: ${playerHand}`;
  computerHandElement.textContent = `Computer's Choice: ${computerHand}`;

  if (result === 'tie') {
    resultElement.textContent = 'Tie';
  } else if (result === 'player') {
    resultElement.textContent = 'You win!';
  } else if (result === 'computer') {
    resultElement.textContent = 'You lose!';
  } else if (result === 'highscore') {
    resultElement.textContent = 'Congratulations! New high score!';

    // Check if the player's score is a new high score
    const topFiveScores = highScores.slice(0, 5);
    const lowestTopScore = topFiveScores[topFiveScores.length - 1];
    if (playerScore > 0 && (!lowestTopScore || playerScore > lowestTopScore.score)) {

      postHighScore();
    }
  } else if (result === 'lose') {
    resultElement.textContent = 'Sorry, you lose.';
  }

  scoreElement.textContent = `Score: ${playerScore}`;
}

handButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const playerHand = button.id;
    const computerHand = getComputerHand();
    const result = getResult(playerHand, computerHand);
    updateScore(result);
    updateUI(playerHand, computerHand, result);
  });
});
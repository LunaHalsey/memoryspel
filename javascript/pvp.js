// Memory card game javascript for player vs player mode

// selecting the grid container from the HTML
const gridContainer = document.querySelector(".grid-container");

// creates starting variables
let cards = [];
let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;
let firstCard, secondCard;
let lockBoard = false;

// setting starting scores on the webpage
document.querySelector(".score1").textContent = `Player 1: ${player1Score}`;
document.querySelector(".score2").textContent = `Player 2: ${player2Score}`;

// adds a border to the current players name
function currentPlayerMarker() {
    if (currentPlayer == 1) {
        document.querySelector(".score1").style.border = "2px solid #f2f2f2";
        document.querySelector(".score1").style.borderRadius = "5px";
        document.querySelector(".score1").style.backgroundColor = "#555454";
        document.querySelector(".score2").style.border = "none";
        document.querySelector(".score2").style.backgroundColor = "#333";
    } else {
        document.querySelector(".score2").style.border = "2px solid #f2f2f2";
        document.querySelector(".score2").style.borderRadius = "5px";
        document.querySelector(".score2").style.backgroundColor = "#555454";
        document.querySelector(".score1").style.border = "none";
        document.querySelector(".score1").style.backgroundColor = "#333";
    }
}

// fetching the cards and starts the functions to shuffle and create the card/play-area
fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
        cards = [...data, ...data];
        shuffleCards();
        generateCards();
    });

// shuffle the cards randomly with a Fisher-Yates shuffle (Knuth shuffle) algorithm
function shuffleCards() {
    let currentIndex = cards.length,
        randomIndex,
        temporaryValue;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
}

// generate card elements
function generateCards() {
    for (let card of cards) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.setAttribute("data-name", card.name);
        cardElement.innerHTML = `
        <div class="front">
            <img class="front-image" src=${card.image} />
            </div>
            <div class="back"></div>
        `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener("click", flipCard);
    }

    // hide the winner div
    const winnerDiv = document.querySelector(".winner-div");
    winnerDiv.style.display = "none";
}

// card flipping function
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;

    // locks the cards from being selected (flipped) if 2 cards have been flipped
    lockBoard = true;
    checkForMatch();
}

// checks if the flipped cards match
function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        updateScore();
        disableCards();

        // Checks if all cards are flipped, if all card have been flipped it starts the end game function
        if (document.querySelectorAll(".flipped").length === cards.length) {
            setTimeout(endGame, 2000);
        }
    } else {
        switchPlayer();
        setTimeout(unflipCards, 1000);
    }

    // Unlocks the board and cards can be flipped again
    setTimeout(() => {
        lockBoard = false;
    }, 1000);
}

// updates player scores and display the updated score
function updateScore() {
    if (currentPlayer === 1) {
        player1Score++;
    } else {
        player2Score++;
    }

    document.querySelector(".score1").textContent = `Player 1: ${player1Score}`;
    document.querySelector(".score2").textContent = `Player 2: ${player2Score}`;
}

// disables matching cards
function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    resetBoard();
}

// unflips non-matching cards
function unflipCards() {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    resetBoard();
}

// switches the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentPlayerMarker();
}

// resets the board state
function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// restarts the game
function restart() {
    resetBoard();
    shuffleCards();
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    document.querySelector(".score1").textContent = `Player 1: ${player1Score}`;
    document.querySelector(".score2").textContent = `Player 2: ${player2Score}`;
    gridContainer.innerHTML = "";
    generateCards();
}

// ends the game and presents the winner
function endGame() {
    // determine the winner based on scores
    let winner = player1Score > player2Score ? "Player 1" : "Player 2";

    // store player 1 scores in local storage
    let player1Scores = JSON.parse(localStorage.getItem("player1Scores")) || [];
    player1Scores.push(player1Score);
    localStorage.setItem("player1Scores", JSON.stringify(player1Scores));

    // display the winner and play again button
    const winnerDiv = document.querySelector(".winner-div");
    winnerDiv.innerHTML = `<p>Congratulations! ${winner} wins with a score of ${Math.max(player1Score, player2Score)}.</p>`;
    winnerDiv.style.display = "grid";

    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Play Again";
    playAgainButton.addEventListener("click", restart);
    winnerDiv.appendChild(playAgainButton);
}

// event listener to display the scoreboard
document.addEventListener("DOMContentLoaded", () => {
    displayScoreboard();
});

// displays the scoreboard with the top 10 scores
function displayScoreboard() {
    const scoreboardDiv = document.querySelector(".scoreboard");
    scoreboardDiv.innerHTML = "<h2>Scoreboard: Player 1</h2>";

    // retrieve and sort player 1 scores from local storage
    const player1Scores = JSON.parse(localStorage.getItem("player1Scores")) || [];
    const sortedScores = player1Scores.sort((a, b) => b - a).slice(0, 10);

    // display the sorted scores in an ordered list
    if (sortedScores.length > 0) {
        const olElement = document.createElement("ol");
        sortedScores.forEach((score, index) => {
            const liElement = document.createElement("li");
            liElement.textContent = `#${index + 1}: ${score}`;
            olElement.appendChild(liElement);
        });
        scoreboardDiv.appendChild(olElement);
    } else {
        scoreboardDiv.innerHTML += "<p>No scores available yet.</p>";
    }
}

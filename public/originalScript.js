import { family } from "./categories/family.js";
import { animals } from "./categories/animals.js";

const categories = { family, animals };

const categoryElement = document.getElementById("category-buttons");
const quizElement = document.querySelector(".quiz");
const questionElement = document.getElementById("question");
const selectedCategoryElement = document.getElementById("category");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

function showCategories() {
    resetState();
    quizElement.style.display = "none"; // Hide the quiz until a category is selected

    categoryElement.innerHTML = "Choisissez la catégorie du quiz";
    Object.keys(categories).forEach(category => {
        const button = document.createElement("button");
        button.innerHTML = category;
        button.classList.add("btn");
        button.addEventListener("click", () => selectCategory(category));
        categoryElement.appendChild(button);
    });

    // Add an API-based category button
    const apiButton = document.createElement("button");
    apiButton.innerHTML = "Random Trivia (API)";
    apiButton.classList.add("btn");
    apiButton.addEventListener("click", () => selectCategory("api"));
    categoryElement.appendChild(apiButton);
}

function selectCategory(category) {
    categoryElement.style.display = "none"; // Hide category selection
    quizElement.style.display = "block"; // Show quiz container

    if (category === "api") {
        fetchQuestionsFromAPI(); // Fetch questions dynamically
    } else {
        selectedQuestions = categories[category]; // Use predefined questions
        startQuiz();
    }
}

function fetchQuestionsFromAPI() {
    fetch("https://opentdb.com/api.php?amount=10&type=multiple")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Data:", data); // Log raw API response

            // Format API questions to match existing structure
            const formattedQuestions = data.results.map(q => ({
                question: q.question,
                answers: shuffleArray([
                    ...q.incorrect_answers.map(ans => ({ text: ans, correct: false })),
                    { text: q.correct_answer, correct: true }
                ])
            }));

            console.log("Formatted Questions:", formattedQuestions); // Log formatted questions

            // Add new API questions to categories
            categories["api"] = formattedQuestions;

            // Select the new category and start the quiz
            selectedQuestions = categories["api"];
            startQuiz();
        })
        .catch(error => console.error("Error fetching questions:", error));
}

// Utility function to shuffle answers for randomness
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next Question";
    showQuestion();
}

function showQuestion() {
    resetState(); 
    let currentQuestion = selectedQuestions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = "Question n° " + questionNo + ": " + currentQuestion.question;
    questionElement.style.display = "block";

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
    questionElement.style.display = "none";
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block";
}

function showScore() {
    resetState();
    questionElement.style.display = "block";
    questionElement.innerHTML = `Vous avez obtenu ${score} sur ${selectedQuestions.length} !`;
    nextButton.innerHTML = "Rejouer ?";
    nextButton.style.display = "block";
    quizElement.style.display = "none";
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < selectedQuestions.length) {
        handleNextButton();
    } else {
        categoryElement.style.display = "block"; // Show category selection again
        showCategories();
    }
});

showCategories();

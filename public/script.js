import { family } from "./categories/family.js";
import { animals } from "./categories/animals.js";

const categories = { family, animals };
/* const themes = [blue, pink]; */

const categoryElement = document.getElementById("category-buttons");
const quizElement = document.querySelector(".quiz");
const questionElement = document.getElementById("question");
const selectedCategoryElement = document.getElementById("category");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const backToCategoriesButton = document.getElementById("back-categories");
const lastScoreElement = document.getElementById("last-score");

//LOADER
const loader = document.getElementById("loader");
const app = document.getElementById("app");

//SWITCH THEME
const switchThemeButton = document.getElementById("theme");

/* function myThemes(){
    themes.forEach(theme => {
        const theme = document.createElement("button");
        theme.innerHTML = theme.text;
        theme.classList.add(`${theme}`);
        themeButtons.appendChild(button);
        button.addEventListener("click", switchTheme);
    });
} */

let selectedQuestions = [];
let currentQuestionIndex = 0;
let selectedCategory = "";
let score = 0;
// Storage of the pourcentage of good answers
let achievement = "";

/* Notes:
- Faire un "score dernière partie" sur showCategory 
- Mieux placer le bouton retour Categorie
- Ajouter un autre css?
- Ajouter une nouvelle API?
- Faire une barre de chargement!!!!!
*/

// First display setup : Pick a category
// hard categories made from custom arrays
// Dynamic categories fetched from API(s?)
function showCategories() {
    resetState(); 
    if(score > 0){
        lastScoreElement.style.display = "block";
        lastScoreElement.innerHTML = `Votre dernier score est : ${score}/${selectedQuestions.length} (${achievement})`;
    }
    // The quiz is Hidden until a Category, a Difficulty is selected
    quizElement.style.display = "none";
    categoryElement.style.display = "block";
    categoryElement.innerHTML = "Choisissez la catégorie du quiz";
    // Categories from the imported JS files stored in "const category = {};"
    Object.keys(categories).forEach(category => {
        const button = document.createElement("button");
        button.innerHTML = category;
        button.classList.add("btn");
        button.addEventListener("click", () => selectCategory(category));
        categoryElement.appendChild(button);
    });

    // Add an API-based category button
    const apiButton = document.createElement("button");
    apiButton.innerHTML = "Open Trivia DB (API)";
    apiButton.classList.add("btn");
    apiButton.addEventListener("click", () => selectCategory("api"));
    categoryElement.appendChild(apiButton);
}

// Category selection hidden in order to display the quiz part
// Category passed thru the addEventListener 
function selectCategory(category) {
    categoryElement.style.display = "none"; // Hide category selection

    if (category === "api") {
        fetchCategoryFromAPI(); // Fetch questions dynamically from API(s?)
    } else {
        selectedQuestions = categories[category]; // Use predefined questions stored in custom arrays
        selectedCategory = category;
        startQuiz();
    }
}

function fetchCategoryFromAPI() {
    backToCategoriesButton.style.display = "block";
    fetch("https://opentdb.com/api_category.php")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Categories:", data.trivia_categories); // Log categories
            let categories = data.trivia_categories;
            // Reset category selection UI
            categoryElement.innerHTML = "Choose a Trivia Category";
            categoryElement.style.display = "block";

            // Create buttons for each fetched category
            data.trivia_categories.forEach(category => {
                const button = document.createElement("button");
                button.innerHTML = category.name;
                button.classList.add("btn");
                button.addEventListener("click", () => selectDifficulty(category.id, category.name)); // Pass category name
                categoryElement.appendChild(button);
            });
            console.log("Formatted Categories:", categories);
        })
        .catch(error => console.error("Error fetching categories:", error));
}

function selectDifficulty(categoryId, categoryName) {
    selectedCategory = categoryName; // Store the category name

    // Reset UI for difficulty selection
    categoryElement.innerHTML = `Category: ${selectedCategory} <br><br> Choose your difficulty`;
    categoryElement.style.display = "block";

    let difficulties = ["easy", "medium", "hard"];
    difficulties.forEach(difficulty => {
        const button = document.createElement("button");
        button.innerHTML = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        button.classList.add("btn");
        button.addEventListener("click", () => fetchQuestionsFromAPI(categoryId, difficulty, categoryName)); // Pass category name
        categoryElement.appendChild(button);
    });
}

function fetchQuestionsFromAPI(categoryId, difficulty, categoryName) {
    selectedCategory = categoryName; // Store category name
    categoryElement.style.display = "none";

    fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=multiple`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched Questions:", data.results);

            // Format questions
            selectedQuestions = data.results.map(q => ({
                question: q.question,
                answers: shuffleArray([
                    ...q.incorrect_answers.map(ans => ({ text: ans, correct: false })),
                    { text: q.correct_answer, correct: true }
                ])
            }));

            console.log("Formatted Questions:", selectedQuestions);

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
    quizElement.style.display = "block"; // Show quiz container
    nextButton.innerHTML = "Next Question";
    backToCategoriesButton.innerHTML = "Retour aux catégories";
    showQuestion();
}

function showQuestion() {
    resetState(); 
    let currentQuestion = selectedQuestions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;

    backToCategoriesButton.style.display = "block";
    // Display of the current category with uppercase for first letter
    selectedCategoryElement.innerHTML = `Category: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`;
    selectedCategoryElement.style.display = "block";

    questionElement.innerHTML = `Question n°${questionNo}: ${currentQuestion.question}`;
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
    if(score < 1){
        lastScoreElement.style.display = "none";
    };
    nextButton.style.display = "none";
    backToCategoriesButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
    selectedCategoryElement.style.display = "none";
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
    calculateAchievement();
    questionElement.style.display = "block";
    questionElement.innerHTML = `Vous avez obtenu ${score} sur ${selectedQuestions.length} !`;
    nextButton.innerHTML = "Voulez-vous rejouer?";
    nextButton.style.display = "block";
}

// At the end of a quiz, it calculate the pourcentage of good answers
function calculateAchievement() {
    let pourcentage = (score/selectedQuestions.length)*100;
    // ->toFixed(x) rounds the digit x number(s) after the dot
    achievement = `${pourcentage.toFixed(1)}%`
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < selectedQuestions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

function backToCategories() {
    Swal.fire({
        title: "Quitter le quiz ?",
        text: "Êtes-vous sûr de vouloir revenir aux catégories ? \n Votre progression ne sera pas sauvegardée!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, quitter",
        cancelButtonText: "Non, rester"
    }).then((result) => {
        if (result.isConfirmed) {
            showCategories();
        }
    });
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < selectedQuestions.length) {
        handleNextButton();
    } else {
        categoryElement.style.display = "block"; // Show category selection again
        showCategories();
    }
});

backToCategoriesButton.addEventListener("click", () => {
    backToCategories();
});

showCategories();

// SWITCH THEME
// PINK
switchThemeButton.addEventListener("click", () => {
    switchTheme();
})

function switchTheme() {
    if (container.classList.contains("theme-blue")) {
        container.classList.replace("theme-blue", "theme-pink");
        app.classList.replace("blue", "pink");
    } else {
        container.classList.replace("theme-pink", "theme-blue");
        app.classList.replace("pink", "blue");
    }
}
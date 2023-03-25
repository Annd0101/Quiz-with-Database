// Start the quiz
// Hide screen 1 and show screen 2 
// Post function
async function getAttempt(url) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
    })
    return response.json()
}
var btn_start = document.querySelector("#btn-start");
var introduction = document.querySelector('#introduction');
var attempt_quiz = document.querySelector('#attempt-quiz');
let attemptId = 0
    // handle start action
btn_start.addEventListener("click", async() => {
    const response = await getAttempt(`http://localhost:3000/attempts/`);
    console.log(response)
    attemptId = response._id;
    displayQuestions(response);
    // Show page
    introduction.classList.add("hidden");
    attempt_quiz.classList.remove("hidden");
    box_submit.classList.remove("hidden");
    document.querySelector(".course-name").scrollIntoView();
});

function displayQuestions(response) {

    for (let i = 0; i < 10; i++) {
        // Create div to wrap questions
        const question = response.questions[i];
        const div = document.createElement("div");
        div.id = question._id;
        // Create questText
        const questionIndex = document.createElement("h2");
        questionIndex.classList.add("question-index");
        questionIndex.textContent = `Question ${i + 1} of 10`;
        const questionText = document.createElement("p");
        questionText.classList.add("question-text");
        questionText.textContent = question.text;
        div.appendChild(questionIndex);
        div.appendChild(questionText);
        attempt_quiz.appendChild(div);

        // Create answers
        const answers = question.answers;
        for (let j = 0; j < answers.length; j++) {
            const label = document.createElement("label");
            label.classList.add("option");
            label.htmlFor = `question${i}-option${j}`;
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.id = label.htmlFor;
            radio.name = `question${i}`;
            const answerText = document.createElement("span");
            answerText.textContent = answers[j];
            label.appendChild(radio);
            label.appendChild(answerText);
            div.appendChild(label);
            radio.addEventListener("click", handleSelect);
        }
    }
}

// click the answer
var answer = document.querySelectorAll('.option')
answer.forEach(option => {
    option.addEventListener("change", handleSelect)
})

function handleSelect(event) {
    const input = event.target;
    // get list of options
    const options = input.parentNode.parentNode.children
    for (let i = 0; i < options.length; i++) {
        options[i].classList.remove("option-selected")
    }
    input.parentNode.classList.add("option-selected")
}


//     submit answer
async function submit(url, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(body)
    })
    return response.json()
}


const btn_submit = document.querySelector("#btn-submit");
var btn_confirm = document.querySelector('#btn-confirm')
var box_submit = document.querySelector("#box-submit");
var box_result = document.querySelector("#box-result");
var confirm_box = document.querySelector('.confirm-quiz')
var btn_cancel = document.querySelector('#btn-cancel')
    // show confirm when click submit box
btn_submit.addEventListener("click", () => {
    confirm_box.classList.remove("hidden");
});

// add event to options
btn_confirm.addEventListener("click", handleConfirm)

// const accept = confirm_box.querySelector(".confirm");
async function handleConfirm() {
    // hide screen 2, show screen 3
    confirm_box.classList.add("hidden");
    btn_submit.classList.add("hidden")
    box_result.classList.remove("hidden")
    document.querySelector(".course-name").scrollIntoView();
    // fetch submit
    const submitURL = `http://localhost:3000/attempts/${attemptId}/submit`;
    const answersBody = {};

    const questions = document.querySelectorAll("#attempt-quiz div");
    for (let question of questions) {
        const checked = question.querySelector("input:checked");
        if (checked) {
            answersBody[question.id] = checked.id.slice(-1);
        }
    }
    // send request 
    const body = { userAnswers: answersBody };
    console.log(body)
    const response = await submit(submitURL, body);
    console.log(response);
    // check the answers to review
    const userAnswers = response.userAnswers;
    const correctAnswers = response.correctAnswers;
    attempt_quiz.querySelectorAll("input").forEach((input) => (input.disabled = true));
    for (let question of questions) {
        const correctOptionId = parseInt(correctAnswers[question.id]) + 3;
        const selectOptionId = userAnswers ?
            parseInt(userAnswers[question.id]) + 3 :
            false;
        const correctOption = question.querySelector(
            `:nth-child(${correctOptionId})`
        );
        // check selected option and correct option
        if (selectOptionId) {
            const selectOption = question.querySelector(
                `:nth-child(${selectOptionId})`
            );
            if (selectOptionId == correctOptionId) {
                selectOption.classList.add("correct-answer");
                selectOption.appendChild(createSubLabel("Correct answer"));
            } else {
                correctOption.classList.add("option-selected");
                correctOption.appendChild(createSubLabel("Correct answer"));
                selectOption.classList.add("wrong-answer");
                selectOption.appendChild(createSubLabel("Your answer"));
            }

            correctOption.classList.add("option-selected");
            correctOption.appendChild(createSubLabel("Correct answer"));
        } else {
            correctOption.classList.add("option-selected");
            correctOption.appendChild(createSubLabel("Correct answer"));
        }

    }
    // get results
    const score = box_result.querySelector(".correct-answers");
    score.textContent = response.score + "/10";

    const percentage = box_result.querySelector(".percentage");
    percentage.textContent = (parseInt(response.score) * 10) + "%";

    const text = box_result.querySelector(".text");
    text.textContent = response.scoreText;

    // show resultm
    box_submit.classList.add("hidden");
    box_result.classList.remove("hidden");
    box_result.scrollIntoView();
}

btn_cancel.addEventListener("click", handleCancel)

function handleCancel() {
    confirm_box.classList.add("hidden")
}

// Create subLabel
function createSubLabel(content) {
    const subLabel = document.createElement("div");
    subLabel.classList.add("sub-label");
    subLabel.textContent = content;
    return subLabel;
}

// Try again action
function tryAgain() {
    const review = document.querySelector('#review-quiz');
    review.style.display = "none"
    review.classList.add('hidden')
    introduction.classList.remove('hidden');
    document.querySelector(".course-name").scrollIntoView({ behavior: "auto", block: "start", inline: "start" });
    location.reload()
};

const respone = {
    status: 201,
    student: { id: 1001, name: 'an', course: ['se1', 'sbd'] }
};
const json = JSON.stringify(respone)
console.log(json)
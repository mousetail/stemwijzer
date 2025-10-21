
const mainElement = document.getElementById('main');

const default_scores = Object.freeze({
    "D66": 0,
    "PvdD": 0,
    "SP": 0,
    "50+": 0,
    "PVV": 0,
    "BBB": 0
});

const partyImages = {
    "D66": "./images/d66_edited.png",
    "PvdD": "./images/Partij voor de Dieren.png",
    "SP": "./images/sp.svg",
    "50+": "./images/5-min.png",
    "PVV": "./images/PVV.svg",
    "BBB": "./images/bbb.svg"
}

const partyNames = {
    "D66": "666",
    "PvdD": "Partij van de Planten",
    "SP": "SimP",
    "50+": "5-",
    "PVV": "Partij voor Facisme",
    "BBB": "Bewust Bezopen Bestuurders"
}

let question_index = -1;
let scores = {...default_scores};

const start = () => {
    question_index = -1;
    scores = {...default_scores};

    nextQuestion();
}

const displayResults = () => {
    const div = document.createElement('div');
    div.classList.add('question', 'question-enter');

    const scoresEntries = Object.entries(scores);
    const bestScore = scoresEntries.reduce((a,b)=>a[1]>b[1]?a:b);

    scoresEntries.sort((a,b)=>b[1]-a[1]);

    const title = document.createElement('h1');
    title.textContent = `Je komt het beste overeen met ${partyNames[bestScore[0]]}`;

    div.appendChild(title);

    const stats = document.createElement('div');
    stats.classList.add('stats');

    for (let [statName, score] of scoresEntries) {
        const stat = document.createElement('div');
        stat.classList.add('stat');
        
        const name = document.createElement('div');
        name.classList.add('stat-name');
        name.style.background = `center / contain no-repeat url("${partyImages[statName]}")`;
        stat.appendChild(name);

        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.width = `${score * 100 / questions.length}%`;

        stat.appendChild(bar);
        stats.appendChild(stat);
    }
    div.appendChild(stats);

    const shareButton = document.createElement('button');
    shareButton.textContent = 'Kopieer Resultaten';

    shareButton.addEventListener('click', ()=>{

        navigator.clipboard.writeText(`Ik ben het grotendeels eens met ${bestScore[0]}\n${
            scoresEntries.slice(0,3).map(
                ([statName, score], index) => {
                    return `${partyNames[statName]}${' '.repeat(10-statName.length)} ${['🟥', '🟩', '🟫'][index].repeat(score)}`
                }
            ).join('\n')
        }\nDoe ook de test met https://mousetail.github.io/stemwijzer`)
    });
    div.appendChild(shareButton);

    return div;
}

const formatQuestion = (question) => {
    const newQuestionDiv = document.createElement('div');
    newQuestionDiv.classList.add('question', 'question-enter');

    const title = document.createElement('h1');
    title.textContent = questions[question_index].question;

    newQuestionDiv.appendChild(title);

    const options = document.createElement('div');
    options.classList.add('options');

    let optionElementMap = {};

    questions[question_index].answers.forEach(option=>{
        console.log(option);
        for (let score of Object.keys(option.score)) {
            if (!Object.prototype.hasOwnProperty.call(default_scores, score)) {
                throw new Error('question missing '+score+' '+option.text);
            };
        }

        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option.text;

        optionElement.addEventListener('click', ()=>{
            if (optionElement.classList.contains('disabled')) {
                return;
            }
            optionElement.classList.add('selected');
            for (const party of Object.keys(option.score)) {
                scores[party]+=1;
            }
            showPartyOptions(optionElementMap);
        });
        options.appendChild(optionElement);

        optionElementMap[option.text] = optionElement;
    });
    newQuestionDiv.appendChild(options);
    return newQuestionDiv;
}

const showPartyOptions = (optionElementMap) => {
    const currentQuestion = mainElement.firstElementChild;
    currentQuestion.classList.add('show-detail-page');

    Object.values(optionElementMap).forEach(button=>{
        button.classList.add('disabled')
});

    const question = questions[question_index];
    question.answers.forEach((option)=>{
        Object.entries(option.score).forEach(([party, opinion])=>{
            const element = document.createElement('div');
            element.classList.add('party-opinion');

            optionElementMap[option.text].insertAdjacentElement('beforeend', element);

            const image = document.createElement('img');
            image.src=partyImages[party];
            element.appendChild(image);

            const paragraph = document.createElement('p');
            paragraph.textContent = opinion;
            element.appendChild(paragraph);
        })
    })

    const nextQuestionButton = document.createElement('button');
    nextQuestionButton.type = 'button';
    nextQuestionButton.textContent = 'Volgende Vraag'
    nextQuestionButton.addEventListener('click', ()=>{
        nextQuestion();
    })
    currentQuestion.querySelector('.options').appendChild(nextQuestionButton);


}

const nextQuestion = () => {
    const currentQuestion = mainElement.firstElementChild;

    question_index += 1;

    let newQuestionDiv;
    if (question_index >= questions.length)  {
        newQuestionDiv = displayResults(currentQuestion)
    } else {
        newQuestionDiv = formatQuestion(questions[question_index]);
    }

    mainElement.appendChild(newQuestionDiv);
    currentQuestion.classList.add('question-exit');
    window.setTimeout(()=>{
        currentQuestion.parentElement.removeChild(currentQuestion);
        newQuestionDiv.classList.remove('question-enter');
    }, 500);

}

document.getElementById('start-button').addEventListener('click', start);


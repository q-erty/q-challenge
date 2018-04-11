var docStructure = document.getElementById('structure');
var docQuestion = document.getElementById('question');
var docAnswer = document.getElementById('answer');
var docAnswerBox = document.getElementById('answerBox');
var docHint = document.getElementById('hint');
var docSubmit = document.getElementById('submit');
var docResult = document.getElementById('result');
var docTimer = document.getElementById('timer');
var docNextLevel = document.getElementById('nextLevel');
var docStart = document.getElementById('start');
var docStartBox = document.getElementById('startBox');
var docButtonBox = document.getElementById('buttonBox');
var docResultWaiting = document.getElementById('resultWaiting');
var docAll = document.getElementById('all');
var docWon = document.getElementById('won');
var docRestart = document.getElementById('restart');
var LETTERS;
var NUMBERS;
var good = '✅';
var bad = '🚫';
var quest = '❓';
var outcomes;
function generateLetters() {
    return 'abcdeghjkmpqrstuvwxyzABCDEGHJKLMPQRSTUVWXYZ'.split('');
}
function l() {
    var index = Math.floor(Math.random() * LETTERS.length);
    var choice = LETTERS[index];
    LETTERS.splice(index, 1);
    if (LETTERS.length <= 0) {
        docHint.innerText = 'Error: LETTERS is empty';
    }
    return choice;
}
function generateNumbers() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9];
}
function n() {
    var index = Math.floor(Math.random() * NUMBERS.length);
    var choice = NUMBERS[index];
    NUMBERS.splice(index, 1);
    if (NUMBERS.length <= 0) {
        docHint.innerText = 'Error: NUMBERS is empty';
    }
    return choice;
}
function resetChoices() {
    LETTERS = generateLetters();
    NUMBERS = generateNumbers();
}
var createLevels = function () {
    var newLevels = [];
    for (var i = 0; i < 6; i++) {
        newLevels[i] = generateLevel(i);
    }
    return newLevels;
};
var Level = /** @class */ (function () {
    function Level(hint, target, structure) {
        this.hint = hint;
        this.target = target;
        this.structure = structure;
    }
    return Level;
}());
function generateLevel(levelNum) {
    resetChoices();
    switch (levelNum) {
        case 1:
            return new Level('<code>struct[0]</code> is <code>3</code>', '5', [3, 5]);
        case 2:
            return new Level('<code>struct["d"]</code> is <code>6</code>', '8', {
                d: 6,
                h: 8
            });
        case 3:
            return new Level('<code>struct["r"][1]</code> is <code>7</code>', '4', {
                r: [3, 7],
                s: [4, 2],
                t: [1, 8]
            });
        case 4:
        case 5:
        case 6:
            return generateRealLevel(levelNum - 1);
    }
}
function flip() {
    return Math.random() < 0.5;
}
function generateRealLevel(levelNum) {
    var structure = flip() ? {} : [];
    var goal = l();
    var potentialTargets = [structure];
    function addPotentialTarget(target) {
        potentialTargets.push(target);
    }
    function isArray(o) {
        return Array.isArray(o);
    }
    function isObject(o) {
        return typeof (o) === 'object' && !isArray(o);
    }
    function isString(o) {
        return typeof (o) === 'string';
    }
    function append(parent, child) {
        if (isArray(parent)) {
            parent.push(child);
        }
        else if (isObject(parent)) {
            parent[l()] = child;
        }
    }
    function buryArray(item) {
        var arr = [];
        append(item, arr);
        return arr;
    }
    function buryObject(item) {
        var obj = {};
        append(item, obj);
        return obj;
    }
    function obscure(item, difficulty) {
        if (difficulty <= 0) {
            return;
        }
        var choice = Math.random();
        if (choice < 0.2) {
            var arr = buryArray(item);
            addPotentialTarget(arr);
            obscure(arr, difficulty - 1);
        }
        else if (choice < 0.4) {
            var obj = buryObject(item);
            addPotentialTarget(obj);
            obscure(obj, difficulty - 1);
        }
        else if (choice < 0.6) {
            var obj = {};
            addPotentialTarget(obj);
            obscure(obj, difficulty - 1);
            append(item, obj);
            obscure(item, difficulty - 1);
        }
        else if (choice < 0.8) {
            var arr = [];
            addPotentialTarget(arr);
            obscure(arr, difficulty - 1);
            append(item, arr);
            obscure(item, difficulty - 1);
        }
        else {
            var str = l();
            if (!isString(item)) {
                append(item, str);
            }
            obscure(item, difficulty - 1);
        }
    }
    function setTarget() {
        var targetContainer = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        append(targetContainer, goal);
    }
    obscure(structure, levelNum);
    setTarget();
    return new Level(null, goal, structure);
}
var currentLevelNumber = 1;
var currentLevel = null;
var levels = [];
docStart.onclick = startGame;
docNextLevel.onclick = nextLevel;
docSubmit.onclick = attemptSubmit;
docRestart.onclick = restart;
document.onkeypress = handleKeyPress;
function handleKeyPress(evt) {
    if (evt.keyCode === 13) {
        if (docWon.style.display === 'block') {
            restart();
        }
        else if (docStartBox.style.display !== 'none') {
            startGame();
            docAnswer.focus();
        }
        else if (docNextLevel.disabled) {
            attemptSubmit();
        }
        else {
            nextLevel();
        }
    }
}
function drawOutcomes() {
    docTimer.innerHTML = outcomes.join('&nbsp;&nbsp;');
}
function startGame() {
    levels = createLevels();
    outcomes = levels.map(function () { return '❓'; });
    currentLevel = levels[currentLevelNumber];
    drawOutcomes();
    displayLevel();
}
function displayLevel() {
    docStartBox.style.display = 'none';
    docHint.style.display = 'none';
    docAll.style.display = 'grid';
    docNextLevel.disabled = true;
    docResult.innerHTML = '';
    docQuestion.innerHTML = "Evaluate to <code>" + currentLevel.target + "</code>";
    docStructure.innerText = "struct = " + JSON.stringify(currentLevel.structure, null, '  ');
    docAnswer.value = 'struct';
    docResultWaiting.style.display = 'block';
}
function nextLevel() {
    currentLevelNumber += 1;
    if (currentLevelNumber === levels.length) {
        youWin();
        return;
    }
    currentLevel = levels[currentLevelNumber];
    displayLevel();
}
function youWin() {
    docAll.style.display = 'none';
    docWon.style.display = 'block';
}
function restart() {
    docWon.style.display = 'none';
    docStartBox.style.display = 'grid';
    currentLevelNumber = 1;
}
function attemptSubmit() {
    var result = evaluateResult();
    docResult.innerHTML = JSON.stringify(result, null, '  ');
    docResultWaiting.style.display = 'none';
    if (docAnswer.value.substring(0, 6) !== 'struct') {
        docHint.style.display = 'block';
        docHint.innerHTML = 'You need to start with "struct"';
        outcomes[currentLevelNumber - 1] = bad;
    }
    else if (result == currentLevel.target) { //tslint:disable-line
        if (outcomes[currentLevelNumber - 1] === quest) {
            outcomes[currentLevelNumber - 1] = good;
        }
        docNextLevel.disabled = false;
    }
    else if (currentLevel.hint) {
        outcomes[currentLevelNumber - 1] = bad;
        docHint.style.display = 'block';
        docHint.innerHTML = "HINT: " + currentLevel.hint;
    }
    drawOutcomes();
}
function evaluateResult() {
    var userCode = docAnswer.value;
    var struct = currentLevel.structure;
    var result;
    try {
        result = eval(userCode); // tslint:disable-line
    }
    catch (err) {
        result = "EXCEPTION: " + err.message;
    }
    return result;
}

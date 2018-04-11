const docStructure: HTMLDivElement = document.getElementById('structure') as HTMLDivElement
const docQuestion: HTMLDivElement = document.getElementById('question') as HTMLDivElement
const docAnswer: HTMLInputElement = document.getElementById('answer') as HTMLInputElement
const docAnswerBox: HTMLDivElement = document.getElementById('answerBox') as HTMLDivElement
const docHint: HTMLDivElement = document.getElementById('hint') as HTMLDivElement
const docSubmit: HTMLDivElement = document.getElementById('submit') as HTMLDivElement
const docResult: HTMLDivElement = document.getElementById('result') as HTMLDivElement
const docTimer: HTMLDivElement = document.getElementById('timer') as HTMLDivElement
const docNextLevel: HTMLButtonElement = document.getElementById('nextLevel') as HTMLButtonElement
const docStart: HTMLDivElement = document.getElementById('start') as HTMLDivElement
const docStartBox: HTMLDivElement = document.getElementById('startBox') as HTMLDivElement
const docButtonBox: HTMLDivElement = document.getElementById('buttonBox') as HTMLDivElement
const docResultWaiting: HTMLDivElement = document.getElementById('resultWaiting') as HTMLDivElement
const docAll: HTMLDivElement = document.getElementById('all') as HTMLDivElement
const docWon: HTMLDivElement = document.getElementById('won') as HTMLDivElement
const docRestart: HTMLButtonElement = document.getElementById('restart') as HTMLButtonElement
const docResultOutcome: HTMLDivElement = document.getElementById('resultOutcome') as HTMLDivElement

let LETTERS: string[]
let NUMBERS: number[]

const good = '✅'
const bad = '🚫'
const quest = '❓'

let outcomes: string[]

function generateLetters(): string[] {
    return 'abcdeghjkmpqrstuvwxyzABCDEGHJKLMPQRSTUVWXYZ'.split('')
}

function l(): string {
    const index = Math.floor(Math.random() * LETTERS.length)
    const choice = LETTERS[index]
    LETTERS.splice(index, 1)
    if (LETTERS.length <= 0) {
        docHint.innerText = 'Error: LETTERS is empty'
    }
    return choice
}

function generateNumbers(): number[] {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9]
}

function n(): number {
    const index = Math.floor(Math.random() * NUMBERS.length)
    const choice = NUMBERS[index]
    NUMBERS.splice(index, 1)
    if (NUMBERS.length <= 0) {
        docHint.innerText = 'Error: NUMBERS is empty'
    }
    return choice
}

function resetChoices(): void {
    LETTERS = generateLetters()
    NUMBERS = generateNumbers()
}

const createLevels = (): Level[] => {
    const newLevels: Level[] = []

    for (let i: number = 0; i < 6; i++) {
        newLevels[i] = generateLevel(i)
    }
    return newLevels
}

class Level {
    constructor(public hint: string, public target: string, public structure: any) {}
}

function generateLevel(levelNum: number): any {
    resetChoices()
    switch (levelNum) {
        case 1:
            return new Level(
                '<code>struct[0]</code> is <code>3</code>',
                '5',
                [3, 5],
            )
        case 2:
            return new Level(
                '<code>struct["d"]</code> is <code>6</code>',
                '8',
                {
                    d: 6,
                    h: 8,
                },
            )
        case 3:
            return new Level(
                '<code>struct["r"][1]</code> is <code>7</code>',
                '4',
                {
                    r: [3, 7],
                    s: [4, 2],
                    t: [1, 8],
                },
            )
        case 4:
        case 5:
        case 6:
            return generateRealLevel(levelNum - 1)
    }
}

function flip() {
    return Math.random() < 0.5
}

function generateRealLevel(levelNum: number): Level {
    const structure: object|any[] = flip() ? {} : []
    const goal: string = l()
    const potentialTargets: any[] = [structure]

    function addPotentialTarget(target) {
        potentialTargets.push(target)
    }

    function isArray(o: any): boolean {
        return Array.isArray(o)
    }

    function isObject(o: any): boolean {
        return typeof(o) === 'object' && !isArray(o)
    }

    function isString(o: any): boolean {
        return typeof(o) === 'string'
    }

    function append(parent: any, child: any) {
        if (isArray(parent)) {
            parent.push(child)
        } else if (isObject(parent)) {
            parent[l()] = child
        }
    }

    function buryArray(item: any) {
        const arr = []
        append(item, arr)
        return arr
    }

    function buryObject(item: any) {
        const obj = {}
        append(item, obj)
        return obj
    }

    function obscure(item: any, difficulty: number) {
        if (difficulty <= 0) {
            return
        }
        const choice = Math.random()

        if (choice < 0.2) {
            const arr = buryArray(item)
            addPotentialTarget(arr)
            obscure(arr, difficulty - 1)
        } else if (choice < 0.4) {
            const obj = buryObject(item)
            addPotentialTarget(obj)
            obscure(obj, difficulty - 1)
        } else if (choice < 0.6) {
            const obj = {}
            addPotentialTarget(obj)
            obscure(obj, difficulty - 1)
            append(item, obj)
            obscure(item, difficulty - 1)
        } else if (choice < 0.8) {
            const arr = []
            addPotentialTarget(arr)
            obscure(arr, difficulty - 1)
            append(item, arr)
            obscure(item, difficulty - 1)
        } else {
            const str = l()
            if (!isString(item)) {
                append(item, str)
            }
            obscure(item, difficulty - 1)
        }
    }

    function setTarget(): void {
        const targetContainer = potentialTargets[Math.floor(Math.random() * potentialTargets.length)]
        append(targetContainer, goal)
    }

    obscure(structure, levelNum)

    setTarget()

    return new Level(null, goal, structure)
}

let currentLevelNumber: number = 1
let currentLevel: Level|null = null
let levels: Level[] = []

docStart.onclick = startGame
docNextLevel.onclick = nextLevel
docSubmit.onclick = attemptSubmit
docRestart.onclick = restart
document.onkeypress = handleKeyPress

function handleKeyPress(evt: KeyboardEvent) {
    if (evt.keyCode === 13) {
        if (docWon.style.display === 'block') {
            restart()
        } else if (docStartBox.style.display !== 'none') {
            startGame()
            docAnswer.focus()
        } else if (docNextLevel.disabled) {
            attemptSubmit()
        } else {
            nextLevel()
        }
    }
}

function drawOutcomes() {
    docTimer.innerHTML = outcomes.join('&nbsp;&nbsp;')
    docResultOutcome.innerHTML = outcomes.join('&nbsp;&nbsp;')
}

function startGame() {
    levels = createLevels()
    outcomes = ['❓', '❓', '❓', '❓', '❓']
    currentLevel = levels[currentLevelNumber]
    drawOutcomes()
    displayLevel()
}

function displayLevel() {
    docStartBox.style.display = 'none'
    docHint.style.display = 'none'

    docAll.style.display = 'grid'
    docNextLevel.disabled = true
    docResult.innerHTML = ''

    docQuestion.innerHTML = `Evaluate to <code>${currentLevel.target}</code>`
    docStructure.innerText = `struct = ${JSON.stringify(currentLevel.structure, null, '  ')}`
    docAnswer.value = 'struct'

    docResultWaiting.style.display = 'block'
}

function nextLevel() {
    currentLevelNumber += 1
    if (currentLevelNumber === levels.length) {
        youWin()
        return
    }
    currentLevel = levels[currentLevelNumber]
    displayLevel()
}

function youWin() {
    docAll.style.display = 'none'
    docWon.style.display = 'block'
    drawOutcomes()
}

function restart() {
    docWon.style.display = 'none'
    docStartBox.style.display = 'grid'
    currentLevelNumber = 1
}

function attemptSubmit(): void {
    const result = evaluateResult()
    docResult.innerHTML = JSON.stringify(result, null, '  ')
    docResultWaiting.style.display = 'none'
    if (docAnswer.value.substring(0, 6) !== 'struct') {
        docHint.style.display = 'block'
        docHint.innerHTML = 'You need to start with "struct"'
        outcomes[currentLevelNumber - 1] = bad
    } else if (result == currentLevel.target) { //tslint:disable-line
        if (outcomes[currentLevelNumber - 1] === quest) {
            outcomes[currentLevelNumber - 1] = good
        }
        docNextLevel.disabled = false
    } else if (currentLevel.hint) {
        outcomes[currentLevelNumber - 1] = bad
        docHint.style.display = 'block'
        docHint.innerHTML = `HINT: ${currentLevel.hint}`
    } else {
        outcomes[currentLevelNumber - 1] = bad
    }
    drawOutcomes()
}

function evaluateResult(): string {
    const userCode = docAnswer.value
    const struct = currentLevel.structure

    let result
    try {
        result = eval(userCode) // tslint:disable-line
    } catch (err) {
        result = `EXCEPTION: ${err.message}`
    }
    return result
}

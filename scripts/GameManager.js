const DIFF_TEXT = ['EASY', 'MEDIUM', 'IMPOSSIBLE'];
let COLOR_THEME = 0;

const debounce = (cb, n) => {
    let time = Date.now();
    return (...args) => {
        if ((time + n - Date.now()) < 0) {
            cb(...args);
            time = Date.now();
        }
    }
}
class GameManager {
    constructor() {
        this.newBoardTimeout = null;

        this.isAi = {
            [X_TURN]: false,
            [O_TURN]: true
        };

        this.scores = {
            [X_TURN]: 0,
            [O_TURN]: 0
        };
        

        this.newBoard();

        this.setTheme = debounce(() => this._setTheme(), 250);
        this.setFullscreen = debounce(() => this._setFullscreen(), 250);
        this.nextDifficulty = debounce(() => this._nextDifficulty(), 250);
        
        this.difficulty = 1;
        this.diffButton = new TextButton({
            text: DIFF_TEXT[this.difficulty],
            pos: { x: 15, y: 25 },
            clickCB: () => this.nextDifficulty(),
            underline: true,
            animate: true
        });


        this.curTheme = 0;
        this.brightnessButton = new BrightnessButton({
            clickCB: () => this.setTheme(),
            curMode: this.curTheme,
            padding: min(width, height) * 0.005
        });

        this.fsButton = new FullscreenButton({
            clickCB: () => this.setFullscreen(),
            curMode: fullscreen() ? 1 : 0
        });

        this.overlay = new Overlay();
    }

    _setTheme(n) {
        this.curTheme = n ?? this.curTheme ? 0 : 1;
        this.brightnessButton.setMode(this.curTheme);
        this.overlay.startSwipe();
        updateCurColor();
    }

    _setFullscreen(fs = !fullscreen()) {

        fullscreen(fs);
        this.fsButton.setMode(fs);
        // windowResized();
        // this.updateDimensions();
    }

    _nextDifficulty() {
        this.difficulty = (this.difficulty + 1) % DIFF_TEXT.length;
        this.diffButton.setText(DIFF_TEXT[this.difficulty]);
    }

    updateDimensions() {
        this.board.fitToScreen();
        this.diffButton.updateSize();

        this.diffButton.updateDimensions({ pos: { x: 15, y: 25 } });

        const size = Math.min(width, height) / 10;
        console.log(`Setting size to: ${size}`)
        this.brightnessButton.updateDimensions({
            pos: { x: 0, y: height - size },
            size: { x: size, y: size }
        });
        this.brightnessButton.padding = size / 10;

        this.fsButton.updateDimensions({
            pos: {x: width  - size, y: height - size},
            size: { x: size, y: size }
        })
        this.fsButton.padding = size / 10;

        
        this.fsButton.setMode(!!fullscreen())

        this.overlay.initContext();
    }

    onClick() {
        if (this.board.win) {
            return this.newBoard();
        }
    }

    newBoard() {
        clearTimeout(this.newBoardTimeout);
        this.newBoardTimeout = null;

        this.board?.destroy();
        this.board = new Board();

        this.board.clickCB = this.onBoardClick.bind(this);
        this.board.moveCB = this.onBoardMove.bind(this);
        this.board.winCB = this.onBoardWin.bind(this);

        if (this.isAi[this.board.turn]) {
            setTimeout(this.makeAiMove.bind(this), 250);
        }
    }

    onBoardMove(turn) {
        if (this.isAi[turn] && !this.board.win) {
            setTimeout(this.makeAiMove.bind(this), 250);
        }
    }

    onBoardClick(n) {
        if (this.isAi[this.board.turn]) {
            return;
        }

        this.board.makeMove(n);
    }

    onBoardWin(winner) {
        if (!this.newBoardTimeout) {
            this.newBoardTimeout = setTimeout(() => {
                updateCurColor();
                this.newBoard();
            }, 1000);
        }
        this.scores[winner]++;
    }

    makeAiMove() {
        const { difficulty, board } = this;

        if (!board.spaces.some((s) => s === 0)) return;

        let move;
        if (difficulty === 0) move = randomMove(board);
        else if (difficulty === 1) move = randomAvoidLosing(board);
        else move = findBestMove(board);

        this.board.makeMove(move);
    }
}

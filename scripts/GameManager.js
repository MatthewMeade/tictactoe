const DIFF_TEXT = ['EASY', 'MEDIUM', 'HARD', '2 Player'];
let COLOR_THEME = 0;

const debounce = (cb, n) => {
    let time = Date.now();
    return (...args) => {
        if (time + n - Date.now() < 0) {
            cb(...args);
            time = Date.now();
        }
    };
};
class GameManager {
    static initialize() {
        this.newBoardTimeout = null;

        this.isAi = {
            [X_TURN]: false,
            [O_TURN]: true
        };

        this.scores = {
            [X_TURN]: 0,
            [O_TURN]: 0
        };

        this.boardSize = 3;

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

        this.restartAI();
    }

    static _setTheme(n) {
        this.curTheme = n ?? this.curTheme ? 0 : 1;
        this.brightnessButton.setMode(this.curTheme);
        this.overlay.startSwipe();
        updateCurColor();
    }

    static _setFullscreen(fs = !fullscreen()) {
        fullscreen(fs);
        this.fsButton.setMode(fs);
        // windowResized();
        // this.updateDimensions();
    }

    static _nextDifficulty() {
        this.difficulty = (this.difficulty + 1) % DIFF_TEXT.length;
        this.diffButton.setText(DIFF_TEXT[this.difficulty]);

        this.newBoard();

        if (this.difficulty === 3) {
            this.isAi = {
                [X_TURN]: false,
                [O_TURN]: false
            };
        } else {
            this.isAi = {
                [X_TURN]: false,
                [O_TURN]: true
            };
        }
    }

    static updateDimensions() {
        this.board.fitToScreen();
        this.diffButton.updateSize();

        this.diffButton.updateDimensions({ pos: { x: 15, y: 25 } });

        const size = Math.min(width, height) / 10;
        this.brightnessButton.updateDimensions({
            pos: { x: 0, y: height - size },
            size: { x: size, y: size }
        });
        this.brightnessButton.padding = size / 10;

        this.fsButton.updateDimensions({
            pos: { x: width - size, y: height - size },
            size: { x: size, y: size }
        });
        this.fsButton.padding = size / 10;

        this.fsButton.setMode(!!fullscreen());

        this.overlay.initContext();
    }

    static onClick() {
        if (this.board.win) {
            return this.newBoard();
        }
    }

    static newBoard() {
        clearTimeout(this.newBoardTimeout);
        this.newBoardTimeout = null;

        this.board?.destroy();
        this.board = new Board(this.boardSize);

        this.board.clickCB = this.onBoardClick.bind(this);
        this.board.moveCB = this.onBoardMove.bind(this);
        this.board.winCB = this.onBoardWin.bind(this);

        if (this.isAi[this.board.turn]) {
            setTimeout(this.makeAiMove.bind(this), 250);
        }

        Favicon.updateType(this.board.turn);

        this.restartAI();
    }

    static onBoardMove(turn) {
        Favicon.updateType(this.board.turn);
        if (this.isAi[turn] && !this.board.win) {
            if (this.difficulty !== 2 || this.board.bSize <= 3) {
                setTimeout(this.makeAiMove.bind(this), 250);
            } else {
                this.makeAiMove();
            }
        }
    }

    static onBoardClick(n) {
        if (this.isAi[this.board.turn]) {
            return;
        }

        this.board.makeMove(n);
    }

    static onBoardWin(winner) {
        if (!this.newBoardTimeout) {
            this.newBoardTimeout = setTimeout(() => {
                updateCurColor();
                this.newBoard();
            }, 1000);
        }
        this.scores[winner]++;
    }

    static makeAiMove() {
        const { difficulty, board } = this;

        if (!board.spaces.some((s) => s === 0)) return;
        const b = { spaces: board.spaces, turn: board.turn };

        this.aiWorker.postMessage({ type: difficulty, board: b });
    }

    static restartAI() {
        this.aiWorker?.terminate();
        this.aiWorker = new Worker('./scripts/AI.js');
        this.aiWorker.addEventListener('message', ({ data }) => {
            this.board.makeMove(data);
        });
    }

    static setBoardSize(size) {
        if (size > 1 && size < 10) {
            this.boardSize = size;
            this.newBoard();
        }
    }
}

const GM = GameManager;

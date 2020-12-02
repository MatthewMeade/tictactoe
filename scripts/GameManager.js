class GameManager {
    constructor() {
        this.newBoardTimeout = null;

        this.isAi = {
            [X_TURN]: false,
            [O_TURN]: true
        };

        this.newBoard();

        this.difficulty = 1;

        this.scores = {
            [X_TURN]: 0,
            [O_TURN]: 0,
        }

        this.diffButton = new DifficultyButton({
            values: ["EASY", "MEDIUM", "IMPOSSIBLE"],
            curValue: this.difficulty,
            clickCB: (n) => this.difficulty = n,
            pos: {x: 15, y: 25},
            // size: {x: width, y: height}
        });

    }

    updateDimensions() {
        this.board.fitToScreen();
        this.diffButton.updateSize();
    }

    onClick() {
        if (this.board.win) {
            return this.newBoard();
        }
    }

    draw() {

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

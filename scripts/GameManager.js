class GameManager {
    constructor() {
        this.newBoardTimeout = null;

        this.isAi = {
            [X_TURN]: false,
            [O_TURN]: true
        };

        this.newBoard();

        this.difficulty = 1;
    }

    onClick() {
        if (this.board.win) {
            this.newBoard();

            return;
        }
        this.board.onClick(mouseX, mouseY);
    }

    draw() {
        this.board.draw();

        if (this.board.win && !this.newBoardTimeout) {
            this.newBoardTimeout = setTimeout(() => {
                this.newBoard();
            }, 1000);
        }
    }

    newBoard() {
        clearTimeout(this.newBoardTimeout);
        this.newBoardTimeout = null;

        this.board = new Board();

        this.board.clickCB = this.onBoardClick.bind(this);
        this.board.moveCB = this.onBoardMove.bind(this);

        resizeBoard(this.board);

        if (this.isAi[this.board.turn]) {
            this.makeAiMove();
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

    makeAiMove() {
        const { difficulty, board } = this;

        if (!board.spaces.some((s) => s === 0)) return;

        updateBGColor();

        let move;
        if (difficulty === 0) move = randomMove(board);
        else if (difficulty === 1) move = randomAvoidLosing(board);
        else move = findBestMove(board);
        
        this.board.makeMove(move);
    }
}

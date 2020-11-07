class GameManager {
    constructor() {
        
        this.newBoardTimeout = null;
        
        this.isAi = {
            [1]: false,
            [-1]: true
        };

        this.newBoard();
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

        this.board.clickCB = (n) => this.onBoardClick(n);
        this.board.moveCB = (n) => this.onBoardMove(n);

        resizeBoard(this.board);

        if (this.isAi[this.board.turn]) {
            randomMove(this.board);
        }
    }

    onBoardMove(turn) {
        if (this.isAi[turn] && !this.board.win) {
            setTimeout(() => randomMove(this.board), 250);
        }
    }

    onBoardClick(n) {
        if (this.isAi[this.board.turn]) {
            return;
        }

        this.board.makeMove(n);
    }
}

function randomMove(board) {

    updateBGColor();

    if (!board.spaces.some(s => s === 0)) {
        return;
    }

    let s;
    do {
        s = Math.floor(Math.random() * 9);
    } while (board.spaces[s] !== 0);
    board.makeMove(s);
}

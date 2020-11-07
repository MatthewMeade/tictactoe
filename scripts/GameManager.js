class GameManager {

    constructor(){
        this.newBoard();

        this.newBoardTimeout = null;
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
            this.newBoardTimeout = setTimeout(() => {this.newBoard()}, 2500);
        }
    }

    newBoard(){
        clearTimeout(this.newBoardTimeout);
        this.newBoardTimeout = null;
        
        this.board = new Board();

        resizeBoard(this.board);
    }
     
}
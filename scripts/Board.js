// TODO: Other board types? nxn || nxm(non square) ?

class Board extends GameObject {
    constructor() {
        super({});
        this.fitToScreen();

        this.turn = X_TURN; // TODO: Support custom first turn

        this.spaces = Array(9).fill(0);
        this.spaceObjs = [];
        for (let i = 0; i < 9; i++) {
            this.spaceObjs[i] = new Board_Space({}, i);
            this.spaceObjs[i].setSpace(this.spaces[i]);
        }
        this.addChildren(this.spaceObjs);
        this.positionSpaces();
        this.spaceObjs.forEach(o => o.curTurn = this.turn);



        this.clickCB = () => console.log('No Callback defined for board click');
        this.moveCB = () => console.log('No Callback defined for board move');
        this.winCB = () => console.log('No Callback defined for board move');

        this.animateProperty({
            time: 500,
            propKey: 'gridAnimState',
            curve: easeInOutBack,
            update: (n) => {
                this.gridAnimState = n;
                this.positionSpaces();
            }
        });

        this.wins = [];
        this.winLineAnimState = 0;
        this.gridAnimState = 0;
    }

    _draw() {
        const boxWidth = (this.gridAnimState * this.sizeX) / 3;

        noFill();
        strokeJoin(ROUND);

        // TODO: Support scaling in GameObject
        const _x = (this.sizeX / 2) * (1 - this.gridAnimState);
        const _y = (this.sizeY / 2) * (1 - this.gridAnimState);
        translate(_x, _y);

        strokeWeight(lineWidth());

        const color = lineColor();
        stroke(color);

        // TODO: Refactor drawing these shapes
        beginShape();

        vertex(0, boxWidth);

        vertex(boxWidth * 3, boxWidth);
        vertex(boxWidth * 2, boxWidth);

        vertex(boxWidth * 2, 0);
        vertex(boxWidth * 2, boxWidth * 3);

        vertex(boxWidth * 2, boxWidth * 2);
        vertex(boxWidth * 3, boxWidth * 2);

        vertex(0, boxWidth * 2);
        vertex(boxWidth, boxWidth * 2);

        vertex(boxWidth, boxWidth * 3);
        vertex(boxWidth, 0);

        endShape();

        // TODO: Pass in scale some other way than as an argument to draw. p5 scale() ?
        // this.spaceObjs.forEach((s) => s.draw(this.gridAnimState));

        // TODO: Draw one win line at a time
        if (this.wins.length > 0) {
            this.wins.forEach((win) => {
                push();

                stroke(lineColor(false));

                const pos = boxWidth * win.line + boxWidth / 2;
                const len = this.sizeX * this.winLineAnimState;

                if (win.type === 'ROW') {
                    line(0, pos, len, pos);
                }

                if (win.type === 'COL') {
                    line(pos, 0, pos, len);
                }

                if (win.type === 'DIAG') {
                    if (win.line === 0) {
                        line(0, 0, len, len);
                    } else {
                        line(0, this.sizeX, len, this.sizeX * (1 - this.winLineAnimState));
                    }
                }

                pop();
            });
        }
    }

    positionSpaces() {
        const curSize = this.sizeX * this.gridAnimState;
        const boxWidth = curSize / 3;

        const offsetX = (this.sizeX - curSize) / 2;
        const offsetY = (this.sizeY - curSize) / 2;

        for (let i = 0; i < this.spaceObjs.length; i++) {
            const posX = offsetX + boxWidth * (i % 3);
            const posY = offsetY + boxWidth * Math.floor(i / 3);

            this.spaceObjs[i].updateDimensions({ posX, posY, sizeX: boxWidth, sizeY: boxWidth });
        }
    }

    _onClick(x, y) {
        if (this.wins.length !== 0) {
            return;
        }

        const boxWidth = this.sizeX / 3;

        const col = Math.floor(x / boxWidth);
        const row = Math.floor(y / boxWidth);

        const index = row * 3 + col;

        if (this.spaces[index] === 0) {
            this.clickCB(index);
        }
    }

    makeMove(n) {
        if (this.wins.length !== 0) {
            return;
        }

        this.spaces[n] = this.turn;
        this.spaceObjs[n].setSpace(this.turn);
        this.turn *= -1;

        this.spaceObjs.forEach(o => o.curTurn = this.turn);

        this.checkForWin();

        this.moveCB(this.turn);
    }

    static CheckWin(board) {
        // TODO: Support checking boards other than 3x3

        const rowSums = [0, 0, 0]; // y = row
        const colSums = [0, 0, 0]; // x = col
        const diagSums = [0, 0, 0];

        const { spaces } = board;

        const wins = [];

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                const i = y + x * 3;
                const val = spaces[i];

                rowSums[x] += val;
                colSums[y] += val;

                if (x == y) {
                    diagSums[0] += val;
                }

                if (x + y === 2) {
                    diagSums[1] += val;
                }
            }
        }

        for (let i = 0; i < 3; i++) {
            if (Math.abs(rowSums[i]) === 3) {
                wins.push({
                    type: 'ROW',
                    line: i,
                    player: rowSums[i] / 3
                });
            }

            if (Math.abs(colSums[i]) === 3) {
                wins.push({
                    type: 'COL',
                    line: i,
                    player: colSums[i] / 3
                });
            }

            if (Math.abs(diagSums[i]) === 3) {
                wins.push({
                    type: 'DIAG',
                    line: i,
                    player: diagSums[i] / 3
                });
            }
        }

        if (!spaces.some((n) => n === 0)) {
            wins.push({
                type: 'TIE',
                line: 0,
                player: 0
            });
        }

        return wins;
    }

    checkForWin() {
        this.wins = Board.CheckWin(this);

        if (this.wins.length > 0) {
            this.animateProperty({
                time: 200, // TODO: Draw lines one at a time?
                propKey: 'winLineAnimState'
            });
            this.winCB(this.wins);
        }

        return this.wins;
    }

    _updateDimensions() {
        if (!this.spaceObjs) {
            return;
        }

        this.positionSpaces();
    }

    fitToScreen() {
        const { size, pos } = boardSize();

        this.updateDimensions({ sizeX: size, sizeY: size, pos });
    }
}

function boardSize() {
    const size = Math.min(width, height) * 0.66;
    return {
        size,
        pos: {
            x: (width - size) / 2,
            y: (height - size) / 2
        }
    };
}

class Board_Space extends GameObject {
    constructor({ posX, posY, size }, index) {
        super({ posX, posY, sizeX: size, sizeY: size });
        this.animScale = 0;
        this.index = index;

        this.valueSet = false;
        this.curTurn = 0;
    }

    _updateDimensions() {}

    _draw() {
        noFill();
        noFill();
        strokeWeight(lineWidth());

        const lc = lineColor();
        if (!this.valueSet) {
            lc.setAlpha(25)
        }
        stroke(lc);
        strokeJoin(ROUND);

        const width = this.sizeX;
        const x = width / 2;
        const y = width / 2;

        if (this.type === X_TURN) {
            const offset = width * 0.33 * this.animScale;
            beginShape();

            vertex(x - offset, y - offset);
            vertex(x + offset, y + offset);
            vertex(x, y);
            vertex(x + offset, y - offset);
            vertex(x - offset, y + offset);

            endShape();
        }

        if (this.type === O_TURN) {
            circle(x, y, this.animScale * width * 0.66);
        }
    }

    _onMouseEnter(){
        if (!this.valueSet) {
            this.showSpacePreview(this.curTurn);
        }
    }
    
    _onMouseLeave() {
        if (!this.valueSet) {
            this.showSpacePreview(0);
        }
    }

    showSpacePreview(val) {
        this.type = val;
        this.animateProperty({
            time: 250,
            propKey: 'animScale',
            curve: easeInOutBack
        });
    }

    setSpace(val) {
        this.valueSet = val !== 0;
        this.animateProperty({
            time: 250,
            propKey: 'animScale',
            curve: easeInOutBack
        });
        this.type = val;
    }

    _onClick() {
        console.log(`Clicked Space ${this.index}`);
    }
}

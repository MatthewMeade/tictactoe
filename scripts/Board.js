// TODO: Other board types? nxn || nxm(non square) ?

class Board extends GameObject {
    constructor(size) {
        super({});
        this.fitToScreen();

        this.bSize = size ?? 3;
        this.nSpaces = this.bSize ** 2;

        this.turn = X_TURN; // TODO: Support custom first turn

        this.lw = lineWidth() * (3 / this.bSize);

        this.spaces = Array(this.nSpaces).fill(0);
        this.spaceObjs = [];

        for (let i = 0; i < this.nSpaces; i++) {
            this.spaceObjs[i] = new Board_Space({}, i);
            this.spaceObjs[i].setSpace(this.spaces[i]);
            this.spaceObjs[i].curTurn = this.turn;
            this.spaceObjs[i].lw = this.lw;
        }

        this.addChildren(this.spaceObjs);
        this.positionSpaces();

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
        const boxWidth = (this.gridAnimState * this.sizeX) / this.bSize;

        noFill();
        strokeJoin(ROUND);

        // TODO: Support scaling in GameObject
        const _x = (this.sizeX / 2) * (1 - this.gridAnimState);
        const _y = (this.sizeY / 2) * (1 - this.gridAnimState);
        translate(_x, _y);

        this.lw = lineWidth() * (3 / this.bSize);
        strokeWeight(this.lw);

        const color = lineColor();
        stroke(color);

        beginShape();

        // More complex drawing to keep transparency without seeing line
        // overlapping at intersections
        const numLines = this.bSize - 1;
        for (let i = 1; i <= numLines; i++) {
            for (let j = 1; j <= numLines; j++) {
                vertex(i * boxWidth, j * boxWidth); // Intersection

                vertex((i - 1) * boxWidth, j * boxWidth); // Left
                vertex(i * boxWidth, j * boxWidth);

                vertex(i * boxWidth, (j - 1) * boxWidth); // Up
                vertex(i * boxWidth, j * boxWidth);

                if (i === numLines) {
                    vertex((i + 1) * boxWidth, j * boxWidth); // Right
                    vertex(i * boxWidth, j * boxWidth);
                }

                if (j === numLines) {
                    vertex(i * boxWidth, (j + 1) * boxWidth); // Down
                    vertex(i * boxWidth, j * boxWidth);
                }
            }

            vertex(i * boxWidth, boxWidth);
        }

        endShape();

        if (this.wins.length > 0) {
            this.wins.forEach((win, i) => {
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
        const boxWidth = curSize / this.bSize;

        const offsetX = (this.sizeX - curSize) / 2;
        const offsetY = (this.sizeY - curSize) / 2;

        for (let i = 0; i < this.spaceObjs.length; i++) {
            const posX = offsetX + boxWidth * (i % this.bSize);
            const posY = offsetY + boxWidth * Math.floor(i / this.bSize);

            this.spaceObjs[i].updateDimensions({ posX, posY, sizeX: boxWidth, sizeY: boxWidth });
        }
    }

    _onClick(x, y) {
        // TODO: Let spaces handle clicking
        if (this.wins.length !== 0) {
            return;
        }

        const boxWidth = this.sizeX / this.bSize;

        const col = Math.floor(x / boxWidth);
        const row = Math.floor(y / boxWidth);

        const index = row * this.bSize + col;

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

        this.spaceObjs.forEach((o) => (o.curTurn = this.turn));

        this.checkForWin();

        this.moveCB(this.turn);
    }

    static CheckWin(board) {
        const s = board.bSize || Math.sqrt(board.spaces.length);

        const rowSums = Array(s).fill(0); // y = row
        const colSums = Array(s).fill(0); // x = col
        const diagSums = [0, 0, 0];

        const { spaces } = board;

        const wins = [];

        for (let x = 0; x < s; x++) {
            for (let y = 0; y < s; y++) {
                const i = y + x * s;
                const val = spaces[i];

                rowSums[x] += val;
                colSums[y] += val;

                if (x == y) {
                    diagSums[0] += val;
                }

                if (x + y === s - 1) {
                    diagSums[1] += val;
                }
            }
        }

        for (let i = 0; i < s; i++) {
            if (Math.abs(rowSums[i]) === s) {
                wins.push({
                    type: 'ROW',
                    line: i,
                    player: rowSums[i] / s
                });
            }

            if (Math.abs(colSums[i]) === s) {
                wins.push({
                    type: 'COL',
                    line: i,
                    player: colSums[i] / s
                });
            }

            if (Math.abs(diagSums[i]) === s) {
                wins.push({
                    type: 'DIAG',
                    line: i,
                    player: diagSums[i] / s
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
                time: 200,
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
        strokeWeight(this.parent.lw);

        const lc = lineColor();
        if (!this.valueSet) {
            lc.setAlpha(25);
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

    _onMouseEnter() {
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

    _onClick() {}
}

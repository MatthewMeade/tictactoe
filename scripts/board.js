class TTC_SPACE {
    constructor(index, animator, boardSize) {
        this.index = index;
        this.type = 0;
        this.animator = animator;
        this.boardSize = boardSize;

        this.animScale = 0;
    }

    draw() {
        if (this.type === 0) {
            return;
        }

        const boxWidth = this.boardSize / 3;

        const x = boxWidth * 0.5 + (this.index % 3) * boxWidth;
        const y = boxWidth * 0.5 + Math.floor(this.index / 3) * boxWidth;

        push();

        if (this.type === 1) {
            const offset = (0.75 * boxWidth * 0.5 - 25) * this.animScale;
            beginShape();

            vertex(x - offset, y - offset);
            vertex(x + offset, y + offset);
            vertex(x, y);
            vertex(x + offset, y - offset);
            vertex(x - offset, y + offset);

            endShape();
        }

        if (this.type === -1) {
            circle(x, y, this.animScale * boxWidth * 0.75 - 25);
        }

        pop();
    }

    setSpace(val) {
        this.animator.addAnimation(
            {
                from: 0,
                to: 1,
                time: 250
            },
            (val) => (this.animScale = val),
            easeInOutBack
        );

        this.type = val;
    }
}

class Board {
    constructor(size, pos, bgHue) {
        this.size = size;
        this.pos = pos;
        this.spaces = Array(9).fill(0);
        this.bgHue = bgHue;
        this.animator = new Animator();

        this.winLineAnimState = 0;
        this.gridAnimState = 0;

        // this.spaces = [1, -1, 1,
        //   -1, 0, -1,
        //   1, -1, 1
        // ]

        this.spaceObjs = [];
        for (let i = 0; i < 9; i++) {
            this.spaceObjs[i] = new TTC_SPACE(i, this.animator, size);
        }

        this.turn = 1;

        this.animator.addAnimation(
            {
                from: 0,
                to: 1,
                time: 500
            },
            (val) => (this.gridAnimState = val),
            easeInOutBack
        );
    }

    draw() {
        this.animator.update();

        push();

        const boxWidth = (this.gridAnimState * this.size) / 3;

        noFill();
        strokeJoin(ROUND);

        const { pos, size } = this;
        const { x, y } = pos;

        const _x = x + (size / 2) * (1 - this.gridAnimState);
        const _y = y + (size / 2) * (1 - this.gridAnimState);

        translate(_x, _y);

        strokeWeight(20);
        stroke(0, 0, 100, 0.8);

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

        this.spaceObjs.forEach((s) => s.draw());

        if (this.win) {
            stroke('white');
            beginShape();

            const pos = boxWidth * this.winLine + boxWidth / 2;

            const len = this.size * this.winLineAnimState;

            if (this.winType === 'ROW') {
                line(0, pos, len, pos);
            }

            if (this.winType === 'COL') {
                line(pos, 0, pos, len);
            }

            if (this.winType === 'DIAG') {
                if (this.winLine === 0) {
                    line(0, 0, len, len);
                } else {
                    line(0, this.size, len, this.size * (1 - this.winLineAnimState));
                }
            }

            endShape();
        }

        pop();
    }

    onClick(x, y) {
        if (this.win) {
            return;
        }

        x -= this.pos.x;
        y -= this.pos.y;

        if (x < 0 || y < 0 || x > this.size || y > this.size) {
            return;
        }

        const boxWidth = this.size / 3;

        const col = Math.floor(x / boxWidth);
        const row = Math.floor(y / boxWidth);

        const index = row * 3 + col;

        if (this.spaces[index] === 0) {
            this.makeMove(index);
        }
    }

    makeMove(n) {
        this.spaces[n] = this.turn;
        this.spaceObjs[n].setSpace(this.turn);
        this.turn *= -1;

        this.checkForWin();
    }

    checkForWin() {
        const rowSums = [0, 0, 0]; // y = row
        const colSums = [0, 0, 0]; // x = col
        const diagSums = [0, 0, 0];

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                const i = y + x * 3;
                const val = this.spaces[i];

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
                this.win = rowSums[i];
                this.winType = 'ROW';
                this.winLine = i;
            }

            if (Math.abs(colSums[i]) === 3) {
                this.win = colSums[i];
                this.winType = 'COL';
                this.winLine = i;
            }

            if (Math.abs(diagSums[i]) === 3) {
                this.win = diagSums[i];
                this.winType = 'DIAG';
                this.winLine = i;
            }
        }

        if (this.win) {
            this.animator.addAnimation(
                {
                    from: 0,
                    to: 1,
                    time: 250
                },
                (val) => (this.winLineAnimState = val)
            );
        } else if (!this.spaces.some((n) => n === 0)) {
            this.win = 2;
            this.winType = 'TIE';
            return 2;
        }

        return this.win;
    }
}

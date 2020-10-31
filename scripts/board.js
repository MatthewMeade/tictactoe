class Board {

  constructor(size, pos, bgHue) {
    this.size = size;
    this.pos = pos;
    this.spaces = Array(9).fill(0);
    this.bgHue = bgHue;

    // this.spaces = [1, -1, 1,
    //   -1, 0, -1,
    //   1, -1, 1
    // ];

    this.turn = 1;
  }

  draw() {

    push();
    const boxWidth = this.size / 3;

    noFill();
    strokeJoin(ROUND);


    const {
      pos,
      size
    } = this;
    const {
      x,
      y
    } = pos;

    translate(x, y);

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

    vertex(0, boxWidth * 2)
    vertex(boxWidth, boxWidth * 2)

    vertex(boxWidth, boxWidth * 3);
    vertex(boxWidth, 0);


    endShape();

    this.spaces.forEach((_, n) => this.drawSpace(n));

    if (this.win) {
      
      stroke('white');
      beginShape();
      
      const pos = boxWidth * this.winLine + boxWidth / 2;

      if (this.winType === 'ROW') {
        line(0,  pos, boxWidth * 3, pos);
      }

      if (this.winType === 'COL') {
        line(pos, 0, pos, boxWidth * 3);
      }

      if (this.winType === 'DIAG') {
        if (this.winLine === 0) {
          line(0, 0, this.size, this.size)
        } else {
          line(0, this.size, this.size, 0)
        }
      }

      endShape();
    }

    pop();
  }

  drawSpace(n) {
    const type = this.spaces[n];

    if (type === 0) {
      return;
    }

    const boxWidth = this.size / 3;


    const x = (boxWidth * 0.5) + (n % 3) * boxWidth;
    const y = (boxWidth * 0.5) + Math.floor(n / 3) * boxWidth;


    push()

    if (type === 1) {
      const offset = 0.75 * boxWidth * 0.5 - 25;
      beginShape()

      vertex(x - offset, y - offset);
      vertex(x + offset, y + offset);
      vertex(x, y);
      vertex(x + offset, y - offset);
      vertex(x - offset, y + offset);


      endShape()

    }

    if (type === -1) {
      circle(x, y, boxWidth * 0.75 - 25);
    }

    pop()

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
    this.turn *= -1;

    this.checkForWin();
  }

  checkForWin() {
    
    if (!this.spaces.some(n => n === 0)) {
      this.win = 2;
      this.winType = 'TIE';
      return 2;
    }

    const rowSums = [0, 0, 0]; // y = row
    const colSums = [0, 0, 0]; // x = col
    const diagSums = [0, 0, 0];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const i = y + (x * 3);
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
      let w;

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

    return this.win;
  }

}
// TODO: Refactor check win code out of GameObject
importScripts('./GameObject.js', './Board.js');

self.addEventListener(
    'message',
    (msg) => {
        switch (msg.data.type) {
            case 0:
                return self.postMessage(randomMove(msg.data.board));
            case 1:
                return self.postMessage(randomAvoidLosing(msg.data.board));
            case 2:
                return self.postMessage(findBestMove(msg.data.board));
        }
    },
    false
);

function randomMove(board) {
    let s;
    do {
        s = Math.floor(Math.random() * board.spaces.length);
    } while (board.spaces[s] !== 0);

    return s;
}

function randomAvoidLosing(board) {
    const curTurn = board.turn;

    let stopWinIndex = -1;
    for (let i = 0; i < board.spaces.length; i++) {
        if (board.spaces[i] !== 0) continue;

        const newSpaces = [...board.spaces];

        newSpaces[i] = curTurn;
        const wins = Board.CheckWin({ ...board, spaces: newSpaces });
        if (wins[0]) {
            return i;
        }

        newSpaces[i] = curTurn * -1;
        const loses = Board.CheckWin({ ...board, spaces: newSpaces });
        if (loses[0]) {
            stopWinIndex = i;
        }
    }

    if (stopWinIndex >= 0) {
        return stopWinIndex;
    }

    return randomMove(board);
}

const MAX_TIME = 2000;
function findBestMove(board) {
    const curTurn = board.turn;
    const spaces = [...board.spaces];

    let bestVal = -Infinity;
    let bestIndex = -1;

    const spacesToCheck = board.spaces.filter((n) => n === 0).length;
    for (let i = 0; i < board.spaces.length; i++) {
        if (board.spaces[i] !== 0) continue;

        spaces[i] = curTurn;
        const moveVal = minimax(spaces, 0, false, curTurn, Date.now(), MAX_TIME / spacesToCheck);
        spaces[i] = 0;

        if (moveVal > bestVal || (moveVal === bestVal && Math.round(Math.random()) === 1)) {
            bestVal = moveVal;
            bestIndex = i;
        }
    }

    return bestIndex;
}

function minimax(spaces, depth, isMax, maxPlayer, startTime, maxTime) {
    const wins = Board.CheckWin({ spaces });
    const win = wins[0];

    if (win?.player === maxPlayer) return 1;
    if (win?.player === maxPlayer * -1) return -1;
    if (win?.player === 0) return 0;

    if (Date.now() - startTime > maxTime) {
        return 0;
    }

    const curPlayer = isMax ? maxPlayer : maxPlayer * -1;

    let bestScore = Infinity * curPlayer;
    const compFunc = isMax ? Math.max : Math.min;

    for (let i = 0; i < spaces.length; i++) {
        if (spaces[i] !== 0) continue;

        spaces[i] = curPlayer;
        bestScore = compFunc(
            bestScore,
            minimax(spaces, depth + 1, !isMax, maxPlayer, startTime, maxTime)
        );
        spaces[i] = 0;
    }

    return bestScore;
}

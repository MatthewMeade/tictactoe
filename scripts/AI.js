function randomMove(board) {
    let s;
    do {
        s = Math.floor(Math.random() * 9);
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
        const { win } = Board.CheckWin({ spaces: newSpaces });

        if (win) {
            return i;
        }

        newSpaces[i] = curTurn * -1;
        const { win: lose } = Board.CheckWin({ spaces: newSpaces });

        if (lose) {
            stopWinIndex = i;
        }
    }

    if (stopWinIndex >= 0) {
        return stopWinIndex;
    }

    return randomMove(board);
}



function findBestMove(board) {
    const curTurn = board.turn;
    const spaces = [...board.spaces];

    let bestVal = -Infinity;
    let bestIndex = -1;
    for (let i = 0; i < board.spaces.length; i++) {
        if (board.spaces[i] !== 0) continue;

        spaces[i] = curTurn;
        const moveVal = minimax(spaces, 0, false, curTurn);
        spaces[i] = 0;

        if (moveVal > bestVal || (moveVal === bestVal && Math.round(Math.random()) === 1)) {
            bestVal = moveVal;
            bestIndex = i;
        }
    }

    return bestIndex;
}

function minimax(spaces, depth, isMax, maxPlayer) {
    const { win } = Board.CheckWin({ spaces });

    if (win === maxPlayer) return 1;
    if (win === 2) return 0;
    if (win) return -1;

    const curPlayer = isMax ? maxPlayer : maxPlayer * -1;

    let bestScore = Infinity * curPlayer;
    const compFunc = isMax ? Math.max : Math.min;

    for (let i = 0; i < spaces.length; i++) {
        if (spaces[i] !== 0) continue;

        spaces[i] = curPlayer;
        bestScore = compFunc(bestScore, minimax(spaces, depth + 1, !isMax, maxPlayer));
        spaces[i] = 0;
    }

    return bestScore;
}
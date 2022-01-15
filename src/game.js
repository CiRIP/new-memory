const crypto = require("crypto");
const makeBoard = require("./make_board");
const messages = require("../public/javascripts/messages");

class Game {
    id;
    players = [];
    maxPlayers;
    roundLength = 10000;
    currentPlayer = null;
    timer;

    startTime;

    state = "NOT-STARTED";
    started = false;
    aborted = false;
    board;
    stats;

    constructor(maxPlayers, roundLength, stats) {
        this.id = crypto.randomUUID();
        this.board = makeBoard();
        this.maxPlayers = maxPlayers;
        this.roundLength = roundLength;
        this.stats = stats;
    }

    full() {
        return this.players.length == this.maxPlayers;
    }

    start() {
        if (this.started) return;
        if (this.aborted) return;
        if (this.players.length < 2) return;
        
        this.started = true;

        const startMessage = messages.O_GAME_START;
        startMessage.data = {
            board: this.board,
            players: this.players.map(e => ({ id: e.id, name: e.name })),
        };

        const sStartMessage = JSON.stringify(startMessage);

        for (const player of this.players) {
            try {
                player.send(sStartMessage);
            } catch (e) {}
        }

        this.stats.started++;
        this.stats.ongoing++;

        this.startTime = Date.now();

        if (this.timer === -1) return;
        this.timer = setTimeout(() => {
            this.setTurn(0);
        }, 10000);
    }

    addPlayer(ws, name) {
        ws.name = name;
        ws.id = crypto.randomUUID();
        ws.selection = null;
        ws.scored = [];
        ws.game = this;

        this.players.push(ws);

        const idMessage = messages.O_CLIENT_ID;
        idMessage.data = {
            id: ws.id,
            name: ws.name,
        }

        ws.send(JSON.stringify(idMessage));


        // setTimeout(() => this.start(), 3000);
    }

    select(player, index) {
        if (this.currentPlayer === null) return;
        if (!this.board[index]) return;
        if (player.id !== this.players[this.currentPlayer].id) return;

        if (this.board[index].fatal) {
            this.lose(player);

            console.debug(`${player.name}@${player.id}: selected fatal at index ${index}`);

            return;
        }
        
        const selectMessage = messages.O_SELECT_PIECE;
        selectMessage.data = {
            player: player.id,
            piece: index,
        }

        const sSelectMessage = JSON.stringify(selectMessage);

        for (const other of this.players) {
            other.send(sSelectMessage);
        }

        if (!player.selection) {
            player.selection = index;

            return;
        }

        const prevIndex = player.selection;

        if (this.board[prevIndex].id === this.board[index].id) {
            player.scored.push(this.board[index]);

            player.selection = null;
            this.board[index] = null;
            this.board[prevIndex] = null;

            const correctMessage = messages.O_CORRECT_SELECTION;
            correctMessage.data = {
                player: player.id,
                selection: [index, prevIndex],
            }

            const sCorrectMessage = JSON.stringify(correctMessage);

            for (const other of this.players) {
                other.send(sCorrectMessage);
            }

            if (this.finished()) {
                this.gameOver();

                return;
            } else {
                this.setTurn(this.currentPlayer);

                return;
            }
        
        } else {
            player.selection = null;

            this.nextPlayer();
        }
    }

    setTurn(playerIndex) {
        this.currentPlayer = playerIndex;

        const turnMessage = messages.O_PLAYER_TURN;
        turnMessage.data = {
            player: this.players[playerIndex].id,
            time: this.roundLength,
        };

        const sTurnMessage = JSON.stringify(turnMessage);

        for (const player of this.players) {
            player.send(sTurnMessage);
        }

        if (this.timer === -1) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.nextPlayer(), this.roundLength);
    }

    nextPlayer() {
        this.setTurn((this.currentPlayer + 1) % this.players.length);
    }

    chat(player, message) {
        if (!player) return;
        if (!message) return;

        const chatMessage = messages.O_CHAT_MESSAGE;
        chatMessage.data = {
            player: player.id,
            message: message,
        }

        const sChatMessage = JSON.stringify(chatMessage);

        for (const player of this.players) {
            player.send(sChatMessage);
        }
    }

    abort() {
        if (!this.started) return;
        if (this.aborted) return;

        this.aborted = true;

        clearTimeout(this.timer);
        this.timer = -1;

        this.stats.ongoing--;

        for (const i in this.players) {
            try {
                this.players[i].close(1000, messages.S_GAME_ABORTED);
                delete this.players[i];
            } catch (e) {}
        }
    }

    lose(player) {
        this.players = this.players.filter(i => i !== player);

        const gameOverMessage = messages.O_GAME_OVER;
        gameOverMessage.data = {
            status: "FATAL",
            winner: null,
        };

        const sGameOverMessage = JSON.stringify(gameOverMessage);

        try {
            player.close(1000, sGameOverMessage);
        } catch (e) {}

        if (this.players.length <= 1) {
            this.gameOver();
        }
    }

    gameOver() {
        const highScore = this.players.reduce((p, v) => p.scored.length > v.scored.length ? p : v);

        const winners = this.players.filter(e => e.scored.length === highScore.scored.length);
        const losers = this.players.filter(e => e.scored.length !== highScore.scored.length);


        const winnerMessage = messages.O_GAME_OVER;
        winnerMessage.data = {
            status: "WON",
            winner: winners.map(e => e.id),
        };

        const sWinnerMessage = JSON.stringify(winnerMessage);


        const loserMessage = messages.O_GAME_OVER;
        loserMessage.data = {
            status: "LOST",
            winner: winners.map(e => e.id),
        };

        const sLoserMessage = JSON.stringify(loserMessage);


        this.stats.completed++;

        const roundTime = ~~((Date.now() - this.startTime) / 1000);
        this.stats.longest = this.stats.longest < roundTime ? roundTime : this.stats.longest;


        for (const winner of winners) {
            try {
                winner.close(1000, sWinnerMessage);
            } catch (e) {
                console.error(e);
            }
        }

        for (const loser of losers) {
            try {
                loser.close(1000, sLoserMessage);
            } catch (e) {
                console.error(e);
            }
        }


        this.abort();
    }

    finished() {
        return !this.board.some(e => e && !e.fatal);
    }


    handleMessage(player, message) {
        const m = JSON.parse(message.toString());

        switch (m.type) {
            case messages.T_SELECT_PIECE:
                this.select(player, m.data.piece);
                break;
            case messages.T_CHAT_MESSAGE:
                this.chat(player, m.data.message);
                break;
            default:
                break;
        }
    }

    handleClose(player, code, reason) {
        console.error(`Unexpected close (${code}) from ${player.name}@${player.id}`);
        if (code == 1000) return;
        // if (code != 1001) 

        if (this.players.length > 2)
            this.lose(player);
        else
            this.abort();
    }
}

module.exports = Game;

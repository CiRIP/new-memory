const crypto = require("crypto");
const makeBoard = require("./make_board");
const messages = require("../public/javascripts/messages");

class Game {
    id;
    players = [];
    maxPlayers;
    currentPlayer = 0;

    state = "NOT-STARTED";
    board;

    constructor(maxPlayers) {
        this.id = crypto.randomUUID();
        this.board = makeBoard();
        this.maxPlayers = maxPlayers;
    }

    full() {
        return this.players.length == this.maxPlayers;
    }

    start() {
        const startMessage = messages.O_GAME_START;
        startMessage.data = {
            board: this.board,
            players: this.players.map(e => ({ id: e.id, name: e.name })),
        };

        for (const player of this.players) {
            player.send(JSON.stringify(startMessage));
        }
    }

    addPlayer(ws, name) {
        ws.name = name;
        ws.id = crypto.randomUUID();
        ws.selection = null;
        ws.scored = [];
        ws.game = this;

        this.players.push(ws);

        const idMessage = messages.O_CLIENT_ID;
        idMessage.data = ws.id;

        ws.send(JSON.stringify(idMessage));


        setTimeout(() => this.start(), 3000);
    }

    select(player, index) {
        if (!this.board[index]) return;
        
        const selectMessage = messages.O_SELECT_PIECE;
        selectMessage.data = {
            player: player.id,
            piece: index,
        }

        for (const other of this.players) {
            if (other == player) continue;

            other.send(JSON.stringify(selectMessage));
        }

        if (!player.selection) {
            player.selection = this.board[index];

            return;
        }

        if (player.selection.id == this.board[index].id) {
            player.scored.push(this.board[index]);

            const prevIndex = this.board.indexOf(player.selection);

            player.selection = null;
            this.board[index] = null;
            this.board[prevIndex] = null;

            const correctMessage = messages.O_CORRECT_SELECTION;
            correctMessage.data = {
                player: player.id,
                selection: [index, prevIndex],
            }

            for (const other of this.players) {
                other.send(JSON.stringify(correctMessage));
            }

            this.setTurn(this.currentPlayer);

            return;
        } else {
            player.selection = null;

            this.setTurn((this.currentPlayer + 1) % this.players.length);
        }
    }

    setTurn(playerIndex) {
        this.currentPlayer = playerIndex;

        const turnMessage = messages.O_PLAYER_TURN;
        turnMessage.data = {
            player: this.players[playerIndex].id,
            time: 10000,
        };
    }


    handleMessage(player, message) {
        const m = JSON.parse(message.toString());

        switch (m.type) {
            case messages.T_SELECT_PIECE:
                this.select(player, m.data.piece);
                break;
        }
    }
}

module.exports = Game;

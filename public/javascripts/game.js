function Game(socket) {
    this.socket = socket;

    this.id = null;
    this.name = null;
    this.score = null;
    this.currentPlayer = -1;

    this.started = false;

    this.players = [];
    this.board = [];

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleChat = this.handleChat.bind(this);
}

Game.prototype.handleOpen = function () {
    const preGameStatus = document.getElementById("pre-game-status");

    preGameStatus.textContent = "Waiting for players...";
};

Game.prototype.handleClose = function ({ code, reason }) {
    console.log(code, reason);
    const oReason = JSON.parse(reason);

    let status = "";

    if (oReason.type === "GAME-ABORTED")
        status = "ABORTED";
    else
        status = oReason.data && oReason.data.status;


    const gameOver = document.getElementById("game-over");
    const gameOverStatus = document.getElementById("game-over-status");

    gameOverStatus.textContent = status;
    gameOver.style.visibility = "visible";
};

Game.prototype.handleMessage = function (e) {
    const message = JSON.parse(e.data);
    switch (message.type) {
        case Messages.T_CLIENT_ID:
            this.setup(message.data.id, message.data.name);
            break;
        
        case Messages.T_GAME_START:
            this.start(message.data.board, message.data.players);
            break;
        
        case Messages.T_CHAT_MESSAGE:
            console.log(message);
            this.chat(message.data.player, message.data.message);
            break;
        
        case Messages.T_PLAYER_TURN:
            this.turn(message.data.player, message.data.time);
            break;
        
        case Messages.T_SELECT_PIECE:
            this.select(message.data.piece);
            break;
        
        case Messages.T_CORRECT_SELECTION:
            this.take(message.data.player, message.data.selection);
    }
};

Game.prototype.handleChat = function (e) {
    e.preventDefault();

    const form = new FormData(e.target);

    console.log(form.get("message"));

    const chatMessage = Messages.O_CHAT_MESSAGE;
    chatMessage.data = {
        "message": form.get("message"),
    }

    this.socket.send(JSON.stringify(chatMessage));

    e.target.reset();
}

Game.prototype.handleSelect = function (card, index) {
    if (this.currentPlayer != this.id) return;

    const selectMessage = Messages.O_SELECT_PIECE;
    selectMessage.data = {
        "piece": index,
    }

    this.socket.send(JSON.stringify(selectMessage));
}

Game.prototype.chat = function (id, message) {
    const chatMessages = document.getElementById("chat-messages");

    const sender = this.getPlayerById(id);

    const playerName = document.createElement("span");
    playerName.classList = "chat-sender";
    playerName.innerHTML = sender && sender.name;

    const messageElem = document.createElement("li");
    messageElem.append(playerName)
    messageElem.append(": " + message);

    chatMessages.appendChild(messageElem);

    messageElem.scrollIntoView();
}

Game.prototype.setup = function (id, name) {
    this.id = id;
    this.name = name;
};

Game.prototype.start = function (board, players) {
    this.initPlayers(players);
    this.initBoard(board);

    document.getElementById("pre-game").style.visibility = "hidden";

    setTimeout(() => {
        for (const card of this.board) {
            this.hideCard(card);
        }
    }, 10000);
};

Game.prototype.initPlayers = function (players) {
    this.players = players;

    const playerContainer = document.getElementById("players");

    for (const player of this.players) {
        player.element = this.buildPlayer(player.name);
        player.score = 0;
        this.updateScore(player);

        playerContainer.append(player.element);
    }
};

Game.prototype.getPlayerById = function (id) {
    return this.players.find(e => e.id === id);
};

Game.prototype.updateScore = function(player) {
    player.element.querySelector(".value-score").innerHTML = player.score;
}

Game.prototype.turn = function (id, time) {
    const player = this.getPlayerById(id);

    this.currentPlayer = id;

    for (const other of this.players) {
        other.element.classList.remove("player-current");
        other.element.querySelector(".value-time").innerHTML = "--";
        clearInterval(other.timer);
    }

    for (const card of this.board) {
        if (card.taken) continue;

        this.hideCard(card);
    }

    player.element.classList.add("player-current");
    player.time = time / 1000;
    player.element.querySelector(".value-time").innerHTML = player.time + "s";


    player.timer = setInterval(() => {
        player.time--;
        if (player.time === 1) clearInterval(player.timer);

        player.element.querySelector(".value-time").innerHTML = player.time + "s";
    }, 1000);
}

Game.prototype.select = function (index) {
    const card = this.board[index];

    this.showCard(card);
}

Game.prototype.take = function (id, selection) {
    const card1 = this.board[selection[0]];
    const card2 = this.board[selection[1]];
    const player = this.getPlayerById(id);

    card1.taken = true;
    card2.taken = true;

    player.score++;
    this.updateScore(player);

    const prizeCard = document.createElement("div");
    prizeCard.classList.add("player-card");
    prizeCard.style.backgroundImage = `url(${card1.image})`;
    prizeCard.style.backgroundSize = "cover";

    player.element.querySelector(".player-cards").append(prizeCard);
}

Game.prototype.buildPlayer = function (name) {
    const player = document.createElement('div');
    player.classList.add("player");
    player.innerHTML = `
        <div class="player-header">
            <div class="player-name">${name}</div>

            <div class="player-statistics">
                <div class="player-statistic">
                    <div class="value value-time">--</div>
                    <div class="label">Time left</div>
                </div>

                <div class="player-statistic">
                    <div class="value value-score">--</div>
                    <div class="label">Score</div>
                </div>
            </div>
        </div>
        
        <div class="player-cards">
            <!-- <div class="player-card"></div>
            <div class="player-card"></div> -->
        </div>
    `;

    return player;
}


Game.prototype.initBoard = function (board) {
    this.board = board;

    const boardContainer = document.getElementById("game");

    for (const cardIndex in this.board) {
        const card = this.board[cardIndex];

        card.element = this.buildCard(card.id, cardIndex);
        card.element.addEventListener("click", e => {
            e.preventDefault();

            console.log(card);
    
            this.handleSelect(card, cardIndex);
        });

        card.taken = false;

        this.showCard(card);

        boardContainer.append(card.element);
    }
}

Game.prototype.buildCard = function () {
    const card = document.createElement("div");
    card.classList.add("game-card");

    return card;
}

Game.prototype.showCard = function (card) {
    card.element.style.backgroundImage = `url(${card.image})`;
    card.element.style.backgroundSize = "cover";

    if (card.fatal) {
        card.element.style.border = "thick red solid";
    }
}

Game.prototype.hideCard = function (card) {
    card.element.style.backgroundImage = null;
    card.element.style.backgroundSize = null;

    card.element.style.border = null;
}

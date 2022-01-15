// @ts-nocheck

(function (exports) {
	// S -> C(1): Set client id
	exports.T_CLIENT_ID = "CLIENT-ID";
	exports.O_CLIENT_ID = {
		type: exports.T_CLIENT_ID,
		data: null,
	};


    // S -> C(*): Broadcast game over
    exports.T_GAME_OVER = "GAME-OVER";
    exports.O_GAME_OVER = {
        type: exports.T_GAME_OVER,
        data: null,
    };
  
    // S -> C(*): Broadcast abort game
    exports.O_GAME_ABORTED = { type: "GAME-ABORTED" };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);
  
    
	// S -> C(*): Broadcast to clients the initial board state and other players' info
	exports.T_GAME_START = "GAME-START";
	exports.O_GAME_START = {
		type: exports.T_GAME_START,
		data: null,
	};

	// S -> C(*): Broadcast whoose turn it is
	exports.T_PLAYER_TURN = "PLAYER-TURN";
	exports.O_PLAYER_TURN = {
		type: exports.T_PLAYER_TURN,
		data: null,
	};

	// C(1) -> S -> C(*): Receive a piece select from a client and broadcast it to the other players
	exports.T_SELECT_PIECE = "SELECT-PIECE";
	exports.O_SELECT_PIECE = {
		type: exports.T_SELECT_PIECE,
		data: null,
	};

	exports.T_CORRECT_SELECTION = "CORRECT-SELECTION";
	exports.O_CORRECT_SELECTION = {
		type: exports.T_CORRECT_SELECTION,
		data: null,
	};

	// C(1) -> S -> C(*): Receive a chat message from a client and broadcast it to the other players
	exports.T_CHAT_MESSAGE = "CHAT-MESSAGE";
	exports.O_CHAT_MESSAGE = {
		type: exports.T_CHAT_MESSAGE,
		data: null,
	};
  })(typeof exports === "undefined" ? (this.Messages = {}) : exports);
  //if exports is undefined, we are on the client; else the server
  
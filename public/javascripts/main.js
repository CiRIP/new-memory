(() => {
    const url = new URL(window.location.href);
    url.protocol = "ws:";

    const socket = new WebSocket(url);

    const game = new Game(socket);

    socket.onopen = game.handleOpen;
    socket.onclose = game.handleClose;
    socket.onmessage = game.handleMessage;

    const chat = document.getElementById("chat-form");
    chat.addEventListener("submit", game.handleChat);
})();

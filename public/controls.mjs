const controls = (socket, player) => {
    const getKeyCode = (e) => {
        if (e == 75 || e == 87 || e == 38) return 'up';
        if (e == 72 || e == 65 || e == 37) return 'left';
        if (e == 74 || e == 83 || e == 40) return 'down';
        if (e == 76 || e == 68 || e == 39) return 'right';
        return null;
    };


    document.onkeydown = e => {
        e = e.keyCode;
        let code = getKeyCode(e);
        player.moveDir(code);
        socket.emit('move-player', code, player.id, {x: player.x, y: player.y});

    };
    document.onkeyup = e => {
        e = e.keyCode;
        let code = getKeyCode(e);
        player.stopDir(code);
        socket.emit('stop-player', code, player.id, {x: player.x, y: player.y});
    };
};

export default controls;

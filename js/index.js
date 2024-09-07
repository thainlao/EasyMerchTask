let gameInstance = null;
document.querySelector('.start_game').addEventListener('click', () => {
    if (!gameInstance || !gameInstance.isGameActive) {
        gameInstance = new Game();
        gameInstance.init();
    }
});
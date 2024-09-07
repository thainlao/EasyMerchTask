class Game {
    constructor() {
        this.mapWidth = 40;
        this.mapHeight = 24;
        this.map = [];
        this.hero = { x: 0, y: 0, hp: 100, attackPower: 50, hasPowerUp: false };
        this.enemies = [];
        this.inventory = [];
        this.enemyMovementInterval = null;
        this.isGameActive = false; // добавил состояние для отслеживания идет ли игра, у меня просто были баги и это по сути костыль, но тем не менее моя пробелма решена
    }

    gameOver() {
        this.isGameActive = false;
        this.playSound('looseGameSound.mp3');
        this.clearGameState();
        this.showGameOverModal();
    }

    gameWin() {
        this.isGameActive = false;
        this.playSound('wingameSound.mp3');
        this.clearGameState();
        this.showGameWinModal();
    }

    clearGameState() {
        this.map = [];
        this.enemies = [];
        this.hero = { x: 0, y: 0, hp: 100, attackPower: 50, hasPowerUp: false }; // сбрасываем состояние героя
        this.inventory = [];
        if (this.enemyMovementInterval) {
            clearInterval(this.enemyMovementInterval);
            this.enemyMovementInterval = null; // сбрасываем интервал движения врагов
        }
    }

    init() {
        if (this.isGameActive) return;

        this.playSound('startgameSound.mp3');
        this.generateMap();
        this.placeRooms();
        this.placePassages();
        this.placeItems();
        this.placeHero();
        this.placeEnemies();
        this.renderInventory();
        this.renderMap();
        this.addControls();
        this.startEnemyMovement();
        this.updateCounters();
        this.isGameActive = true;
    }

    startEnemyMovement() {
        // Убираем мультипликацию движения врагов при перезапуске
        if (!this.enemyMovementInterval) {
            this.enemyMovementInterval = setInterval(() => {
                this.moveEnemies();
                this.renderMap();
            }, 1000);
        }
    }

    generateMap() {
        for (let y = 0; y < this.mapHeight; y++) {
            let row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push('W'); // 'W' обозначает стену
            }
            this.map.push(row);
        }
        this.updateCounters();
    }

    placeRooms() {
        const roomCount = Math.floor(Math.random() * 6) + 5; // Случайное количество комнат (от 5 до 10)
        this.rooms = []; // Массив для хранения координат созданных комнат
        
        for (let i = 0; i < roomCount; i++) {
            const roomWidth = Math.floor(Math.random() * 6) + 3; // Случайные размеры комнаты
            const roomHeight = Math.floor(Math.random() * 6) + 3;
            
            const startX = Math.floor(Math.random() * (this.mapWidth - roomWidth));
            const startY = Math.floor(Math.random() * (this.mapHeight - roomHeight));
            
            if (this.canPlaceRoom(startX, startY, roomWidth, roomHeight)) {
                this.createRoom(startX, startY, roomWidth, roomHeight);
                this.rooms.push({ startX, startY, roomWidth, roomHeight }); // Сохраняем координаты новой комнаты
                
                // Если это не первая комната, создаем проход к ближайшей существующей комнате
                if (i > 0) {
                    const closestRoom = this.findClosestRoom(startX, startY);
                    this.connectRooms(closestRoom, { startX, startY, roomWidth, roomHeight });
                }
            } else {
                i--; // Если не удалось разместить, повторяем попытку
            }
        }
        
        // Создаем проходы между всеми существующими комнатами
        this.connectAllRooms();
    }
    
    // Метод для соединения всех комнат
    connectAllRooms() {
        for (let i = 0; i < this.rooms.length; i++) {
            for (let j = i + 1; j < this.rooms.length; j++) {
                this.connectRooms(this.rooms[i], this.rooms[j]);
            }
        }
    }
    
    // Метод для поиска ближайшей комнаты
    findClosestRoom(startX, startY) {
        let closestRoom = null;
        let closestDistance = Infinity;
    
        this.rooms.forEach((room) => {
            const centerX = room.startX + Math.floor(room.roomWidth / 2);
            const centerY = room.startY + Math.floor(room.roomHeight / 2);
            const distance = Math.abs(centerX - startX) + Math.abs(centerY - startY);
    
            if (distance < closestDistance) {
                closestRoom = room;
                closestDistance = distance;
            }
        });
    
        return closestRoom;
    }
    
    // Метод для соединения двух комнат
    connectRooms(roomA, roomB) {
        const startX = Math.floor((roomA.startX + roomA.roomWidth / 2));
        const startY = Math.floor((roomA.startY + roomA.roomHeight / 2));
        const endX = Math.floor((roomB.startX + roomB.roomWidth / 2));
        const endY = Math.floor((roomB.startY + roomB.roomHeight / 2));
    
        // Создаем горизонтальный проход
        for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
            this.map[startY][x] = ''; // Очищаем путь
        }
    
        // Создаем вертикальный проход
        for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
            this.map[y][endX] = ''; // Очищаем путь
        }
    }
    
    // Проверяем, можно ли разместить комнату
    canPlaceRoom(startX, startY, roomWidth, roomHeight) {
        for (let y = startY; y < startY + roomHeight; y++) {
            for (let x = startX; x < startX + roomWidth; x++) {
                if (this.map[y][x] !== 'W') {
                    return false; // Если клетка уже не стена, комната не может быть здесь
                }
            }
        }
        return true;
    }
    
    // Создаем комнату, заменяя стены на пол
    createRoom(startX, startY, roomWidth, roomHeight) {
        for (let y = startY; y < startY + roomHeight; y++) {
            for (let x = startX; x < startX + roomWidth; x++) {
                this.map[y][x] = '';
            }
        }
    }

    placePassages() {
        const verticalPassagesCount = Math.floor(Math.random() * 3) + 3; // Случайное количество вертикальных проходов (3 - 5)
        const horizontalPassagesCount = Math.floor(Math.random() * 3) + 3; // Случайное количество горизонтальных проходов (3 - 5)

        for (let i = 0; i < verticalPassagesCount; i++) {
            const startX = Math.floor(Math.random() * this.mapWidth);
            this.createVerticalPassage(startX);
        }

        // Создаем горизонтальные проходы
        for (let i = 0; i < horizontalPassagesCount; i++) {
            const startY = Math.floor(Math.random() * this.mapHeight);
            this.createHorizontalPassage(startY);
        }
    }

    createVerticalPassage(x) {
        for (let y = 0; y < this.mapHeight; y++) {
            if (this.map[y][x] === 'W') { // Только если там была стена
                this.map[y][x] = ''; // Убираем стену, создавая проход
            }
        }
    }

    createHorizontalPassage(y) {
        for (let x = 0; x < this.mapWidth; x++) {
            if (this.map[y][x] === 'W') { // Только если там была стена
                this.map[y][x] = ''; // Убираем стену, создавая проход
            }
        }
    }

    placeItems() {
        this.placeItem('SW', 2);  // Размещение 2 мечей (Sword - SW)
        this.placeItem('HP', 10); // Размещение 10 зелий здоровья (Health Potion - HP)
    }

    // Размещение предметов на пустых клетках
    placeItem(itemType, count) {
        let placed = 0;
        
        while (placed < count) {
            const x = Math.floor(Math.random() * this.mapWidth);
            const y = Math.floor(Math.random() * this.mapHeight);
            
            if (this.map[y][x] === '') { // Если клетка пустая (пол)
                this.map[y][x] = itemType; // Размещаем предмет
                placed++;
            }
        }
    }

    placeHero() {
        const emptySpot = this.findEmptySpot();
        this.hero.x = emptySpot.x;
        this.hero.y = emptySpot.y;
        this.map[this.hero.y][this.hero.x] = 'P'; // 'P' - Герой
    }

    placeEnemies() {
        for (let i = 0; i < 10; i++) {
            const emptySpot = this.findEmptySpot();
            this.enemies.push({ x: emptySpot.x, y: emptySpot.y, hp: 100 });
            this.map[emptySpot.y][emptySpot.x] = 'E'; // 'E' - Противник
        }
    }

    findEmptySpot() {
        let x, y;
        do {
            x = Math.floor(Math.random() * this.mapWidth);
            y = Math.floor(Math.random() * this.mapHeight);
        } while (this.map[y][x] !== ''); // Ищем пустое место
        return { x, y };
    }

    addControls() {
        // Удаляем все старые обработчики событий, чтобы избежать дублирования
        document.removeEventListener('keydown', this.handleKeydown);
        this.handleKeydown = this.handleKeydown.bind(this); // Привязываем контекст
        document.addEventListener('keydown', this.handleKeydown);
    }
    
    handleKeydown(event) {
        const modal = document.querySelector('.modal');
        const modalWin = document.querySelector('.modal_win');
        
        if (modal.style.display === 'flex' || modalWin.style.display === 'flex') {
            return;
        }
    
        if (!this.isGameActive) return; // Не реагируем на события, если игра окончена
        
        switch (event.key) {
            case 'w': case 'ц': case 'W': this.moveHero(0, -1); break; // Вверх
            case 'a': case 'ф': case 'A': this.moveHero(-1, 0); break; // Влево
            case 's': case 'ы': case 'S': this.moveHero(0, 1); break; // Вниз
            case 'd': case 'в': case 'D': this.moveHero(1, 0); break; // Вправо
            case ' ': this.attackEnemies(); break; // Атака пробелом
        }
    }

    moveHero(dx, dy) {
        const newX = this.hero.x + dx;
        const newY = this.hero.y + dy;

        if (this.isWithinBounds(newX, newY)) {
            const targetTile = this.map[newY][newX];

            if (targetTile === '') { // Если клетка пустая (пол)
                this.updateHeroPosition(newX, newY)
            } else if (targetTile === 'HP') { // Если на клетке зелье
                this.playSound('bonusSound.mp3')
                this.hero.hp = 100;
                this.updateCounters();
                this.updateHeroPosition(newX, newY);
            } else if (targetTile === 'SW') { // Если на клетке меч
                this.playSound('bonusSound.mp3');
                this.updateCounters();
                this.hero.attackPower = 100;
                this.hero.hasPowerUp = true;
                this.inventory.push('Меч');
                this.renderInventory();
                this.updateHeroPosition(newX, newY);
            }

            this.renderMap(); // Перерисовываем карту
            this.checkForEnemyAttack();
        }
    }

    //обновление позиции героя
    updateHeroPosition(newX, newY) {
        this.map[this.hero.y][this.hero.x] = ''; // Освобождаем старую клетку
        this.hero.x = newX;
        this.hero.y = newY;
        this.map[newY][newX] = 'P'; // Ставим героя в новую клетку
    }

    isWithinBounds(x, y) {
        return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
    }

    // Передвижение противников
    moveEnemies() {
        this.enemies.forEach((enemy) => {
            const directions = [
                { x: 0, y: -1 }, // Вверх
                { x: 0, y: 1 },  // Вниз
                { x: -1, y: 0 }, // Влево
                { x: 1, y: 0 }   // Вправо
            ];

            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            const newX = enemy.x + randomDirection.x;
            const newY = enemy.y + randomDirection.y;

            if (this.isWithinBounds(newX, newY) && this.map[newY][newX] === '') {
                this.map[enemy.y][enemy.x] = ''; // Освобождаем старую клетку
                enemy.x = newX;
                enemy.y = newY;
                this.map[newY][newX] = 'E'; // Перемещаем противника
            }
        });
        this.checkForEnemyAttack();
    }

    attackEnemies() {
        const directions = [
            { x: 0, y: -1 }, // Вверх
            { x: 0, y: 1 },  // Вниз
            { x: -1, y: 0 }, // Влево
            { x: 1, y: 0 }   // Вправо
        ];
    
        directions.forEach((dir) => {
            const targetX = this.hero.x + dir.x;
            const targetY = this.hero.y + dir.y;
    
            this.enemies.forEach((enemy, index) => {
                if (enemy.x === targetX && enemy.y === targetY) {
                    let damage = this.hero.attackPower;
    
                    // Если в инвентаре есть меч, увеличиваем урон и удаляем его сразу после использования
                    if (this.inventory.includes('Меч')) {
                        damage = 100;  // Усиленный урон от меча
                        this.inventory.splice(this.inventory.indexOf('Меч'), 1);  // Удаляем меч из инвентаря
                        this.renderInventory(); // Обновляем отображение инвентаря
                        this.hero.attackPower = 50; // Возвращаем базовый урон
                    }
    
                    this.playSound('heroAttack.mp3');
                    enemy.hp -= damage;
                    this.renderMap()
    
                    if (enemy.hp <= 0) {
                        this.map[enemy.y][enemy.x] = ''; // Убираем противника с карты
                        this.enemies.splice(index, 1); // Убираем его из массива
                        this.updateCounters();
                    }
                }
            });
        });
    
        if (this.enemies.length === 0) {
            this.playSound('wingameSound.mp3');
            this.gameWin();
        }
    
        this.renderMap(); // Перерисовываем карту
    }

    // Проверка на атаку противниками
    checkForEnemyAttack() {
        this.enemies.forEach((enemy) => {
            if (this.isAdjacent(this.hero, enemy)) {
                let enemyDamage = 30;
                this.hero.hp -= enemyDamage; // Противники наносят 30 урона
                this.playSound('heroGetDamage.mp3');
                this.renderMap()
                if (this.hero.hp <= 0) {
                    this.gameOver()
                }
            }
        });
    }

    showGameOverModal() {
        const modal = document.querySelector('.modal');
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 100);

        // Закрытие модального окна при нажатии на ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideGameOverModal();
            }
        });

        // Закрытие модального окна при клике за его пределами
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.hideGameOverModal();
            }
        });

        // Закрытие модального окна при нажатии на крестик
        const closeBtn = document.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            this.hideGameOverModal();
        });
    }

    hideGameOverModal() {
        const modal = document.querySelector('.modal');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    //win Modal
    showGameWinModal() {
        const modal = document.querySelector('.modal_win');
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 100);

        // Закрытие модального окна при нажатии на ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideGameWinModal();
            }
        });

        // Закрытие модального окна при клике за его пределами
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.hideGameWinModal();
            }
        });

        // Закрытие модального окна при нажатии на крестик
        const closeBtn = document.querySelector('.close-btn_win');
        closeBtn.addEventListener('click', () => {
            this.hideGameWinModal();
        });
    }

    hideGameWinModal() {
        const modal = document.querySelector('.modal_win');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    renderInventory() {
        const inventoryDiv = document.querySelector('.inventory');
        inventoryDiv.innerHTML = ''; // Очищаем инвентарь
    
        this.inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            
            if (item === 'Меч') {
                const img = document.createElement('img');
                img.src = './images/tile-SW.png';
                img.classList.add('inventory_item');
                itemDiv.appendChild(img);
            } else {
                itemDiv.textContent = item;
            }
    
            inventoryDiv.appendChild(itemDiv);
        });
    }

    // Проверка, находятся ли две сущности рядом
    isAdjacent(entity1, entity2) {
        const dx = Math.abs(entity1.x - entity2.x);
        const dy = Math.abs(entity1.y - entity2.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    renderMap() {
        const field = document.querySelector('.field');
        field.innerHTML = ''; 
    
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = document.createElement('div');
                tile.classList.add('tile', `tile${this.map[y][x]}`);
                tile.style.left = `${x * 25}px`;
                tile.style.top = `${y * 25}px`;
                field.appendChild(tile);
            }
        }
    
        // Убедитесь, что maxHp героя и врагов равно 100
        this.hero.maxHp = 100;
        this.hero.hp = Math.min(this.hero.hp, this.hero.maxHp); // Убедитесь, что здоровье не превышает maxHp
    
        // Отображаем здоровье героя
        const heroHpBar = document.createElement('div');
        heroHpBar.classList.add('hp-bar');
        heroHpBar.style.position = 'absolute';
        heroHpBar.style.left = `${this.hero.x * 25}px`;
        heroHpBar.style.top = `${this.hero.y * 25 - 5}px`;
        heroHpBar.style.width = '50px'; // Ширина полосы здоровья
        heroHpBar.style.height = '5px'; // Высота полосы здоровья
        heroHpBar.style.backgroundColor = 'white'; // Фоновый цвет
        heroHpBar.style.border = '1px solid black'; // Обводка полосы здоровья
        heroHpBar.style.overflow = 'hidden'; // Прячем переполнение
        heroHpBar.style.zIndex = '20';
    
        const heroHpFill = document.createElement('div');
        heroHpFill.style.height = '100%';
        heroHpFill.style.width = `${(this.hero.hp / this.hero.maxHp) * 100}%`;
        heroHpFill.style.backgroundColor = 'green'; // Цвет заполнения
        heroHpBar.appendChild(heroHpFill);
    
        field.appendChild(heroHpBar);
    
        // Отображаем здоровье противников
        this.enemies.forEach((enemy) => {
            enemy.maxHp = 100; // Установить максимальное здоровье врага
            enemy.hp = Math.min(enemy.hp, enemy.maxHp); // Убедиться, что здоровье не превышает maxHp
    
            const enemyHpBar = document.createElement('div');
            enemyHpBar.classList.add('hp-bar');
            enemyHpBar.style.position = 'absolute';
            enemyHpBar.style.left = `${enemy.x * 25}px`;
            enemyHpBar.style.top = `${enemy.y * 25 - 5}px`;
            enemyHpBar.style.width = '50px'; // Ширина полосы здоровья
            enemyHpBar.style.height = '5px'; // Высота полосы здоровья
            enemyHpBar.style.backgroundColor = 'white'; // Фоновый цвет
            enemyHpBar.style.border = '1px solid black'; // Обводка полосы здоровья
            enemyHpBar.style.overflow = 'hidden'; // Прячем переполнение
            enemyHpBar.style.zIndex = '100';
    
            const enemyHpFill = document.createElement('div');
            enemyHpFill.style.height = '100%';
            enemyHpFill.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
            enemyHpFill.style.backgroundColor = 'red'; // Цвет заполнения
            enemyHpBar.appendChild(enemyHpFill);
    
            field.appendChild(enemyHpBar);
    
            // Создаем полосу для недостающего здоровья
            const enemyHpEmpty = document.createElement('div');
            enemyHpEmpty.style.height = '100%';
            enemyHpEmpty.style.width = `${((enemy.maxHp - enemy.hp) / enemy.maxHp) * 100}%`;
            enemyHpEmpty.style.backgroundColor = 'white'; // Цвет недостающее здоровья
            enemyHpEmpty.style.position = 'absolute';
            enemyHpEmpty.style.left = `${enemyHpFill.offsetWidth}px`; // Устанавливаем позицию после заполненной полосы
            enemyHpEmpty.style.top = '0'; // Верхняя граница
            enemyHpEmpty.style.zIndex = '30';
            enemyHpBar.appendChild(enemyHpEmpty);
        });
    }

    updateCounters() {
        const heartsCount = this.map.flat().filter(tile => tile === 'HP').length;
        const swordsCount = this.map.flat().filter(tile => tile === 'SW').length;
        const enemiesCount = this.enemies.length;
    
        document.getElementById('hearts-counter').textContent = `Сердца: ${heartsCount}`;
        document.getElementById('swords-counter').textContent = `Мечи: ${swordsCount}`;
        document.getElementById('enemies-counter').textContent = `Враги: ${enemiesCount}`;
    }
    
    playSound(soundFile) {
        const audio = new Audio(`./assets/${soundFile}`);
        audio.play();
    }
}

let gameInstance = null;
document.querySelector('.start_game').addEventListener('click', () => {
    if (!gameInstance || !gameInstance.isGameActive) {
        gameInstance = new Game();
        gameInstance.init();
    }
});
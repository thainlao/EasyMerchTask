class Game {
    constructor() {
        this.mapWidth = 40;
        this.mapHeight = 24;
        this.map = [];
    }

    init() {
        this.generateMap();
        this.placeRooms();
        this.placePassages();
        this.renderMap();
    }

    generateMap() {
        for (let y = 0; y < this.mapHeight; y++) {
            let row = [];
            for (let x = 0; x < this.mapWidth; x++) {
                row.push('W'); // 'W' обозначает стену
            }
            this.map.push(row);
        }
    }

    placeRooms() {
        const roomCount = Math.floor(Math.random() * 6) + 5; // Случайное количество комнат (от 5 до 10)
        
        for (let i = 0; i < roomCount; i++) {
            // Случайные размеры комнаты (от 3 до 8 клеток по каждой оси)
            const roomWidth = Math.floor(Math.random() * 6) + 3;
            const roomHeight = Math.floor(Math.random() * 6) + 3;
            
            // Случайные координаты верхнего левого угла комнаты
            const startX = Math.floor(Math.random() * (this.mapWidth - roomWidth));
            const startY = Math.floor(Math.random() * (this.mapHeight - roomHeight));
            
            // Проверяем, не накладывается ли комната на другую
            if (this.canPlaceRoom(startX, startY, roomWidth, roomHeight)) {
                this.createRoom(startX, startY, roomWidth, roomHeight);
            } else {
                i--; // Если не удалось разместить, повторяем попытку
            }
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

    renderMap() {
        const field = document.querySelector('.field');
        field.innerHTML = ''; 

        // Проходим по каждой клетке карты и создаем div с нужными классами
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tile = document.createElement('div');
                tile.classList.add('tile', `tile${this.map[y][x]}`);
                tile.style.left = `${x * 25}px`;
                tile.style.top = `${y * 25}px`;
                field.appendChild(tile);
            }
        }
    }
}
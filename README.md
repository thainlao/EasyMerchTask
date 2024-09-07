# Rogue Game Task

---

https://easy-merch-task.vercel.app/

---

to run 
```
git clone https://github.com/thainlao/EasyMerchTask
```
run index.html 
or https://easy-merch-task.vercel.app/
---
Так как не было указано, сколько хп у врагов, у героя, я сделал игру на свой взгляд.
Сделал ее хардкорную...

---

### Правила игры
1. У героя 100 HP, его урон 50.
2. У врага 100 HP, его урон 30, он атакует каждый раз по возможности.
3. Сердца побираются и автоматически дают герою 100 хп
4. Встал на меч, он попадает в инвентарь и следующая одна атака нанесет 100 урона
5. Когда здоровье опускается < 100, появляется модальное окно, говорящее о поражении
6. Убив всех врагов пользователь побеждает

---

### Особенности

Выполнил все задачи, на мой взгляд, без багов, обработал коллизии, старался избегать "Магических чисел в коде", мой код является грамостким, но на мой взгляд вполне читаемый.
Сразу скажу, что это мой второй опыт разработки игры, первый [вот](https://thainlao.github.io/2048/) 
Но он был выполнен используя фреймоврки (React, Typescript), а данная игра является первым опытом на нативном JS
```
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
```

1. Добавил отображение статистики для пользовательского интерфейса.
2. Добавил обработку поражения или победы.
3. Обработал инвентарь.
4. Добавил модальные окна с анимацией, с правилами, что можно закрыть по всем канонам модалок (кликом за пределы, escape и обычным нажатием на крест) Так же пока открыто модальное окно нельзя играть
5. Добавил звуки ударов, поражений, бонусов и тд
6. Не выполнял адаптивную верстку, не добавлял управление свингами (с телефона)
7. Управление производиться WASD, wasd, цфыв.

```
<div class="stats">
	<div class="stat-item">
		<img src="./images/tile-E.png" alt="Враги" class="stat-icon">
		<span id="enemies-counter">0</span>
	</div>
	<div class="stat-item">
		<img src="./images/tile-HP.png" alt="Сердца" class="stat-icon">
		<span id="hearts-counter">0</span>
	</div>
	<div class="stat-item">
		<img src="./images/tile-SW.png" alt="Мечи" class="stat-icon">
		<span id="swords-counter">0</span>
	</div>
</div>
```

const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let timeLeft = 60;
let level = 1;
let dropSpeed = 5;
let spawnRate = 600;
let gameInterval;
let itemInterval;
let animationId;
let isGameRunning = false;

let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;
let playerPosition = gameWidth / 2 - 90; 

// อัปเดตขนาดจอเมื่อมีการย่อขยาย
window.addEventListener('resize', () => {
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
    if (playerPosition > gameWidth - 180) {
        playerPosition = gameWidth - 180;
        player.style.left = playerPosition + 'px';
    }
});

// เริ่มเกม
function startGame() {
    clearInterval(gameInterval);
    clearInterval(itemInterval);
    cancelAnimationFrame(animationId);

    score = 0;
    timeLeft = 60;
    level = 1;
    dropSpeed = 5;
    spawnRate = 600;
    
    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;
    playerPosition = gameWidth / 2 - 90; 
    
    player.style.left = playerPosition + 'px';
    scoreDisplay.innerText = score;
    timeDisplay.innerText = timeLeft;
    levelDisplay.innerText = level;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    player.classList.remove('hidden');
    
    // ล้างไอเทมเก่าทั้งหมด
    document.querySelectorAll('.item').forEach(item => item.remove());

    isGameRunning = true;
    
    gameInterval = setInterval(updateTimer, 1000);
    startSpawner();
    animationId = requestAnimationFrame(gameLoop);
}

function startSpawner() {
    clearInterval(itemInterval);
    itemInterval = setInterval(spawnItem, spawnRate);
}

// อัปเดตเวลา
function updateTimer() {
    timeLeft--;
    timeDisplay.innerText = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

// จบเกม
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(itemInterval);
    cancelAnimationFrame(animationId);
    player.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.innerText = score;
}

// ควบคุมการเดิน
document.addEventListener('keydown', function(event) {
    if (!isGameRunning) return;
    
    const step = 70; // เพิ่มความเร็วขึ้นให้สอดคล้องกับขนาดจอ
    if (event.key === 'ArrowLeft' && playerPosition > 0) {
        playerPosition -= step;
        if (playerPosition < 0) playerPosition = 0;
    } else if (event.key === 'ArrowRight' && playerPosition < (gameWidth - 180)) { // 180 คือขนาดแมว
        playerPosition += step;
        if (playerPosition > gameWidth - 180) playerPosition = gameWidth - 180;
    }
    player.style.left = playerPosition + 'px';
});

// สร้างของที่ตกลงมา
function spawnItem() {
    const item = document.createElement('div');
    item.classList.add('item');
    
    // สุ่มของ
    const rand = Math.random();
    if (rand > 0.9) {
        // 10% ไข่มุกทอง
        item.classList.add('golden-boba');
    } else if (rand > 0.4) {
        // 50% ไข่มุกธรรมดา
        item.classList.add('boba');
    } else {
        // 40% มะนาว
        item.classList.add('lime');
    }

    // เกิดแบบสุ่มแกน X ยึดจากความกว้างจอ (ลบขนาดไอเทมออก)
    const randomX = Math.floor(Math.random() * (gameWidth - 60)); 
    item.style.left = randomX + 'px';
    item.style.top = '-60px'; 
    item.dataset.y = -60; 

    gameContainer.appendChild(item);
}

// แสดงข้อความลอย +10, -15
function showFloatingText(text, x, y, color) {
    const floatText = document.createElement('div');
    floatText.innerText = text;
    floatText.style.position = 'absolute';
    floatText.style.left = x + 'px';
    floatText.style.top = y + 'px';
    floatText.style.color = color;
    floatText.style.fontWeight = 'bold';
    floatText.style.fontSize = '28px';
    floatText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    floatText.style.pointerEvents = 'none';
    floatText.style.zIndex = '50';
    floatText.style.transition = 'all 1s ease-out';
    gameContainer.appendChild(floatText);

    // ให้ลอยขึ้น
    setTimeout(() => {
        floatText.style.transform = 'translateY(-50px)';
        floatText.style.opacity = '0';
    }, 50);

    // ลบออกจาก DOM
    setTimeout(() => {
        floatText.remove();
    }, 1050);
}

// เช็คการเลเวลอัพ
function checkLevelUp() {
    // เลเวลอัพทุกๆ 100 คะแนน
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelDisplay.innerText = level;
        dropSpeed += 1.5; // ของตกเร็วขึ้น
        spawnRate = Math.max(200, spawnRate - 50); // เกิดเร็วขึ้น สูงสุดลดเหลือ 200ms เปลี่ยนของ
        startSpawner();
        
        // แสดงข้อความกลางจอ
        showFloatingText("LEVEL UP!", gameWidth / 2 - 80, gameHeight / 2, "#ffeb3b");
    }
}

// ระบบฟิสิกส์และการชน
function gameLoop() {
    if (!isGameRunning) return;

    const items = document.querySelectorAll('.item');
    const playerRect = player.getBoundingClientRect();

    items.forEach(item => {
        let topPosition = parseFloat(item.dataset.y);
        if (isNaN(topPosition)) topPosition = -60;
        
        topPosition += dropSpeed; 
        item.dataset.y = topPosition;
        item.style.top = topPosition + 'px';

        const itemRect = item.getBoundingClientRect();
        
        // ปรับการเช็คชนเล็กน้อยเพื่อให้ดูสมจริง ลดขนาดขอบลงฝั่งละ 20px
        if (
            itemRect.bottom >= playerRect.top + 20 &&
            itemRect.top <= playerRect.bottom - 20 &&
            itemRect.right >= playerRect.left + 20 &&
            itemRect.left <= playerRect.right - 20
        ) {
            let points = 0;
            let color = '';
            let text = '';
            
            if (item.classList.contains('golden-boba')) {
                points = 50;
                color = '#ffd700';
                text = '+50';
            } else if (item.classList.contains('boba')) {
                points = 10;
                color = '#4CAF50';
                text = '+10';
            } else if (item.classList.contains('lime')) {
                points = -15;
                color = '#F44336';
                text = '-15';
            }

            score += points;
            scoreDisplay.innerText = score;
            
            showFloatingText(text, itemRect.left, itemRect.top, color);
            item.remove(); 
            
            checkLevelUp();
            
        } else if (topPosition > gameHeight) { 
            item.remove();
        }
    });

    animationId = requestAnimationFrame(gameLoop);
}

// ตั้งค่าปุ่ม
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
let enemySpeed = 1500;
const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const video = document.createElement('video');
video.src = './media/ROB.mp4';
video.autoplay = true;
video.muted = true;
video.loop = false;
document.addEventListener("DOMContentLoaded", function () { video.muted = false });
console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV")
console.log("Aha! I caught you Kaya! I've not put any cheats in yet :) <3 love u")
console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV")
video.addEventListener('ended', () => {
  showStartScreen();
});


const audioFiles = {
  gunshot: new Audio('./media/gun-gunshot-02.wav'),
  hitSound: new Audio('./media/glass-clink-1.wav'),
  bgmusic: new Audio("./media/cautious-path-01.mp3")
};
audioFiles.bgmusic.loop = true;


document.addEventListener('keydown', function (e) {

  if ((e.code === "Space" || e.key === " ") && !video.ended && !video.paused) {
    video.pause();
    video.currentTime = video.duration;
    showStartScreen();
    e.preventDefault();
  }
});

function drawVideo() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}
function playIntroVideo() {
  video.play();
  function renderVideoFrame() { if (!video.paused && !video.ended) { clearCanvas(); drawVideo(); requestAnimationFrame(renderVideoFrame); } }
  renderVideoFrame();
}


let startScreenClickHandler = null;
let gameClickHandler = null;


const MAX_ENEMIES = 9;

const ENEMY_SIZE = 50;

function showStartScreen() {
  clearCanvas();

  obstacles = [];
  bulletsShot = [];


  if (gameClickHandler) {
    document.removeEventListener("click", gameClickHandler);
    gameClickHandler = null;
  }

  ctx.fillStyle = 'black';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('controls: move mouse to aim ', canvas.width / 2, (canvas.height / 6) * 1);
  ctx.fillText('rmb to shoot', canvas.width / 2, (canvas.height / 3) * 1);
  ctx.fillText('Press Enter to Play', canvas.width / 2, canvas.height / 2);

  document.addEventListener('keydown', function startGame(event) {
    if (event.key === 'Enter') {
      document.removeEventListener('keydown', startGame);


      if (startScreenClickHandler) {
        document.removeEventListener("click", startScreenClickHandler);
        startScreenClickHandler = null;
      }


      setupGameClickHandler();

      loop();
    }
  });


  if (startScreenClickHandler) {
    document.removeEventListener("click", startScreenClickHandler);
  }


  startScreenClickHandler = function (e) {

    const gunshotSound = audioFiles.gunshot.cloneNode();
    gunshotSound.volume = 0.5;
    gunshotSound.play();

    bullet = new Bullet(e.clientX, e.clientY);
    bulletsShot.push(bullet);
    totalShotsFired++;
    bullet.draw(ctx);


    setTimeout(() => {
      const index = bulletsShot.indexOf(bullet);
      if (index > -1) {
        bulletsShot.splice(index, 1);
      }
    }, 1000);
  };


  document.addEventListener("click", startScreenClickHandler);
}


function setupGameClickHandler() {
  gameClickHandler = function (e) {

    const gunshotSound = audioFiles.gunshot.cloneNode();
    gunshotSound.volume = 0.5;
    gunshotSound.play();

    const bullet = new Bullet(e.clientX, e.clientY);
    bulletsShot.push(bullet);
    totalShotsFired++;
  };


  document.addEventListener("mousedown", gameClickHandler);
}

playIntroVideo();

let playerX = 20, playerY = 20, score = 0, gameOver = false;
let crossHairX = 0, crossHairY = 0;
let obstacles = [];
let bullet, bulletsShot = [], totalShotsFired = 0;
let enemyIntervalId;
let lastFrameTime = 0;

class Crosshair {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.lineOverlay = 6;
    this.lineWidth = 2;
  }
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }
  toggleCursorVisibility(visible) {
    canvas.style.cursor = visible ? 'default' : 'none';
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(this.x - this.lineOverlay, this.y);
    ctx.lineTo(this.x + this.lineOverlay, this.y);
    ctx.moveTo(this.x, this.y - this.lineOverlay);
    ctx.lineTo(this.x, this.y + this.lineOverlay);
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hit = false;
    this.createdAt = Date.now();
    this.lifespan = 5000;
  }


  isExpired() {
    return Date.now() - this.createdAt > this.lifespan;
  }

  hitEnemy(obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      if (
        this.x >= obstacle.x &&
        this.x <= obstacle.x + obstacle.width &&
        this.y >= obstacle.y &&
        this.y <= obstacle.y + obstacle.height
      ) {
        if (score % 10 === 0 && score > 0) {
          enemySpeed = Math.max(100, enemySpeed - 50);
          if (enemyIntervalId) {
            clearInterval(enemyIntervalId);
          }
          enemyIntervalId = setInterval(createEnemies, enemySpeed);
        }


        const hitSound = audioFiles.hitSound.cloneNode();
        hitSound.volume = 0.5;
        hitSound.play();

        obstacles.splice(i, 1);
        score++;
        this.hit = true;
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "grey";
    ctx.fill();
  }
}

class Enemy {
  constructor() {
    this.width = ENEMY_SIZE;
    this.height = ENEMY_SIZE;
    this.createdAt = Date.now();

    this.x = Math.random() * (canvas.width - this.width);
    this.y = Math.random() * (canvas.height - this.height);
  }
}

const crosshair = new Crosshair(crossHairX, crossHairY);

function createEnemies() {

  const newEnemy = new Enemy();

  if (obstacles.length >= MAX_ENEMIES) {

    let oldestIndex = 0;
    let oldestTime = Infinity;

    for (let i = 0; i < obstacles.length; i++) {
      if (obstacles[i].createdAt < oldestTime) {
        oldestTime = obstacles[i].createdAt;
        oldestIndex = i;
      }
    }


    obstacles[oldestIndex] = newEnemy;
  } else {

    obstacles.push(newEnemy);
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawAccuracy() {
  const totalShots = totalShotsFired;
  const accuracy = totalShots > 0 ? (score / totalShots) * 100 : 0;
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Accuracy: ${accuracy.toFixed(2)}%`, 10, 40);
}

function drawObstacles(obstacles, ctx) {
  obstacles.forEach(obstacle => {
    ctx.fillStyle = 'blue';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, 10, 10);
  ctx.fillText(`Enemies: ${obstacles.length}/${MAX_ENEMIES}`, 10, 70); // Display enemy count
  drawAccuracy();
  crosshair.draw(ctx);
}

function update() {
  clearCanvas();


  for (let i = 0; i < bulletsShot.length; i++) {
    const bullet = bulletsShot[i];
    bullet.draw(ctx);


    if (bullet.hitEnemy(obstacles)) {
      bulletsShot.splice(i, 1);
      i--;
      continue;
    }


    if (bullet.x < 0 || bullet.x > canvas.width ||
      bullet.y < 0 || bullet.y > canvas.height ||
      bullet.isExpired()) {
      bulletsShot.splice(i, 1);
      i--;
    }
  }


  drawObstacles(obstacles, ctx);


  crosshair.draw(ctx);
  crosshair.toggleCursorVisibility(false);
}

function loop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const deltaTime = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  if (!enemyIntervalId) {
    score = 0;
    totalShotsFired = 0;
    bulletsShot = [];
    obstacles = [];
    enemyIntervalId = setInterval(createEnemies, enemySpeed);
  }
  audioFiles.bgmusic.play();
  update();
  draw();
  requestAnimationFrame(loop);
}
document.addEventListener("pointermove", function (e) {
  crossHairX = e.clientX;
  crossHairY = e.clientY;
  crosshair.updatePosition(crossHairX, crossHairY);
});

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
function drawVideo() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}
function playIntroVideo() {
  video.play();
  function renderVideoFrame() { if (!video.paused && !video.ended) { clearCanvas(); drawVideo(); requestAnimationFrame(renderVideoFrame); } }
  renderVideoFrame();
}
bgmusic=new Audio("./media/cautious-path-01.mp3")
bgmusic.loop=true

function showStartScreen() {
  
    
  clearCanvas();
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
      loop();
    }
  });
}
playIntroVideo();

let playerX = 20, playerY = 20, score = 0, gameOver = false;
let crossHairX = 0, crossHairY = 0;
let obstacles = [];
let bullet, bulletsShot = [], totalShotsFired = 0;
const accuracy = totalShotsFired > 0 ? Math.min((score / totalShotsFired) * 100, 100) : 0;
bulletsShot = bulletsShot.filter(bullet => bullet.x >= 0 && bullet.x <= canvas.width && bullet.y >= 0 && bullet.y <= canvas.height);
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
        const hitSound = new Audio('./media/glass-clink-1.wav');
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
const crosshair = new Crosshair(crossHairX, crossHairY);
function createEnemies() {
  const enemyX = Math.random() * canvas.width;
  const enemyY = Math.random() * canvas.height;
  obstacles.push({ x: enemyX, y: enemyY, width: 50, height: 50 });
}
setInterval(createEnemies, 2000);
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
function draw() {
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Score: ${score}`, 10, 10);
  drawAccuracy();
  obstacles.forEach(obstacle => {
    ctx.fillStyle = 'blue';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
  crosshair.draw(ctx);
}
function update() {
  clearCanvas();
  bulletsShot = bulletsShot.filter((bullet) => {
    bullet.draw(ctx);
    return !bullet.hitEnemy(obstacles);
  });
  obstacles.forEach(obstacle => {
    ctx.fillStyle = 'blue';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
  crosshair.draw(ctx);
  crosshair.toggleCursorVisibility(false);
}
function loop() {
    bgmusic.play()
  update();
  draw();
  requestAnimationFrame(loop);
}
document.addEventListener("mousemove", function (e) {
  crossHairX = e.clientX;
  crossHairY = e.clientY;
  crosshair.updatePosition(crossHairX, crossHairY);
});
document.addEventListener("click", function (e) {
  const hitSound = new Audio('./media/gun-gunshot-02.wav');
  hitSound.play();
  bullet = new Bullet(e.clientX, e.clientY);
  bulletsShot.push(bullet);
  totalShotsFired++;
  bullet.draw(ctx);
});

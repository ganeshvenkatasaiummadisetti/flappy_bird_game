/* ------------------- Configuration ------------------- */
const GRAVITY     = 0.4;
const FLAP_VY     = -8;
const PIPE_W      = 100;
const PIPE_GAP    = 200;
const PIPE_SPACING= 350;
const SPEED       = 3;
const GROUND_H    = 120;
const FPS         = 60;

/* ------------------- DOM Elements ------------------- */
const canvas   = document.getElementById("gameCanvas");
const ctx      = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

/* ------------------- Assets ------------------- */
const birdImg  = new Image();
birdImg.src    = "assets/bird.png";
const pipeImg  = new Image();
pipeImg.src    = "assets/pipe.png";

/* ------------------- Game State ------------------- */
let bird, pipes, score, started, gameOver, frameReq;

/* Bird Object */
function createBird(){
  return {
    x: canvas.width / 2 - 17,
    y: canvas.height / 2 - 12,
    w: 34,
    h: 24,
    vy: 0,
    flap(){
      this.vy = FLAP_VY;
    },
    update(){
      this.vy += GRAVITY;
      this.y  += this.vy;
    },
    draw(){
      ctx.drawImage(birdImg, this.x, this.y, this.w, this.h);
    },
    rect(){ return {x:this.x, y:this.y, w:this.w, h:this.h}; }
  };
}

/* Pipe Object */
function createPipe(x){
  const openY = 100 + Math.random() * (canvas.height - GROUND_H - PIPE_GAP - 200);
  return {
    x,
    openY,
    passed: false,
    update(){ this.x -= SPEED; },
    draw(){
      const bottomTop = this.openY + PIPE_GAP;
      ctx.drawImage(pipeImg, this.x, bottomTop, PIPE_W, canvas.height - bottomTop - GROUND_H);
      ctx.save();
      ctx.translate(this.x + PIPE_W, this.openY);
      ctx.scale(-1, -1);
      ctx.drawImage(pipeImg, 0, 0, PIPE_W, canvas.height);
      ctx.restore();
    },
    rects(){
      return [
        {x:this.x, y:0, w:PIPE_W, h:this.openY},
        {x:this.x, y:this.openY + PIPE_GAP, w:PIPE_W, h:canvas.height - this.openY - PIPE_GAP - GROUND_H}
      ];
    }
  };
}

/* Collision Detection */
function rectCollision(r1, r2){
  return !(r1.x + r1.w < r2.x || r1.x > r2.x + r2.w ||
           r1.y + r1.h < r2.y || r1.y > r2.y + r2.h);
}

/* Game Loop */
function loop(){
  update();
  draw();
  if (!gameOver) frameReq = requestAnimationFrame(loop);
}

/* Update Game State */
function update(){
  if (!started) return;
  bird.update();

  if (pipes[pipes.length - 1].x < canvas.width - PIPE_SPACING){
    pipes.push(createPipe(canvas.width));
  }

  for (const pipe of pipes){
    pipe.update();

    if (!pipe.passed && bird.x > pipe.x + PIPE_W){
      pipe.passed = true;
      score++;
    }

    if (pipe.x + PIPE_W < 0){
      pipes.shift();
    }

    for (const rect of pipe.rects()){
      if (rectCollision(bird.rect(), rect)) gameOver = true;
    }
  }

  if (bird.y <= 0 || bird.y + bird.h >= canvas.height - GROUND_H){
    gameOver = true;
  }
}

/* Draw Everything */
function draw(){
  // Background
  ctx.fillStyle = "#87cefa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pipes
  for (const pipe of pipes) pipe.draw();

  // Ground
  ctx.fillStyle = "#deb887";
  ctx.fillRect(0, canvas.height - GROUND_H, canvas.width, GROUND_H);
  ctx.fillStyle = "#008000";
  ctx.fillRect(0, canvas.height - GROUND_H, canvas.width, 20);

  // Bird
  bird.draw();

  // Score (During Game)
  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 20, 50);

  // Game Over Screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";

    ctx.font = "64px Arial";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = "40px Arial";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);

    ctx.font = "32px Arial";
    ctx.fillStyle = "#ffeb3b";
    ctx.fillText("Better luck next time!", canvas.width / 2, canvas.height / 2 + 50);

    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.fillText("Press SPACE or Click to Restart", canvas.width / 2, canvas.height / 2 + 100);
  }
}

/* Handle Flap / Restart */
function flapAction(){
  if (gameOver) {
    reset();
    return;
  }
  if (!started) started = true;
  bird.flap();
}

/* Reset Game State */
function reset(){
  cancelAnimationFrame(frameReq);
  bird = createBird();
  pipes = [ createPipe(canvas.width + 200) ];
  score = 0;
  started = false;
  gameOver = false;
  loop();
}

/* Show Game Canvas */
function showGameCanvas(){
  canvas.classList.remove("hide");
  startBtn.classList.add("hide");
}

/* Event Listeners */
startBtn.addEventListener("click", () => {
  showGameCanvas();
  reset();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") flapAction();
});

canvas.addEventListener("mousedown", flapAction);

// Prevent scrolling on space
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) e.preventDefault();
});

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const paddleWidth = 18,
      paddleHeight = 120,
      paddleSpeed = 8,
      ballRadius = 12,
      initialBallSpeed = 8,
      maxBallSpeed = 28,
      netWidth = 5,
      netColor = 'gray';

// Utilidades de dibujo
function drawRect(x, y, width, height, color){
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}
function drawCircle(x, y, radius, color){
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}
function drawText(text, x, y, color, fontSize = 60, fontWeight = 'bold', font = 'Courier New'){
  context.fillStyle = color;
  context.font = `${fontWeight} ${fontSize}px ${font}`;
  context.textAlign = 'center';
  context.fillText(text, x, y);
}
function drawNet(){
  for (let i = 0; i <= canvas.height; i += 15){
    drawRect(canvas.width / 2 - netWidth / 2, i, netWidth, 10, netColor);
  }
}

// Objetos
function createPaddle(x, y, width, height, color){
  return { x, y, width, height, color, score: 0 };
}
function createBall(x, y, radius, velocityX, velocityY, color){
  return { x, y, radius, velocityX, velocityY, color, speed: Math.hypot(velocityX, velocityY) };
}

const user = createPaddle(20, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, 'white');
const com  = createPaddle(canvas.width - paddleWidth - 20, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, 'white');
let ball = createBall(canvas.width / 2, canvas.height / 2, ballRadius, initialBallSpeed, initialBallSpeed, 'white');

// Entrada usuario: ratón
canvas.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  user.y = e.clientY - rect.top - user.height / 2;
});

// Colisión círculo-rectángulo básica
function collision(b, p){
  return (
    b.x + b.radius > p.x &&
    b.x - b.radius < p.x + p.width &&
    b.y + b.radius > p.y &&
    b.y - b.radius < p.y + p.height
  );
}

function resetBall(direction){
  ball.x = canvas.width / 2;
  ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
  const angle = (Math.random() * Math.PI/3) - Math.PI/6; // -30 a 30 grados
  const dir = direction || (Math.random() < 0.5 ? -1 : 1);
  const speed = initialBallSpeed;
  ball.velocityX = dir * speed * Math.cos(angle);
  ball.velocityY = speed * Math.sin(angle);
  ball.speed = Math.hypot(ball.velocityX, ball.velocityY);
}

function update(){
  // Puntuación
  if (ball.x - ball.radius < 0){
    com.score++; resetBall(1);
  } else if (ball.x + ball.radius > canvas.width){
    user.score++; resetBall(-1);
  }

  // Movimiento de la bola
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Paddle CPU sigue la y de la bola con inercia
  const target = ball.y - (com.y + com.height/2);
  com.y += target * 0.1; // factor de seguimiento

  // Rebote en techo/suelo
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
    ball.velocityY = -ball.velocityY;
  }

  // ¿Qué paddle golpea?
  const player = ball.x < canvas.width / 2 ? user : com;
  if (collision(ball, player)){
    const collidePoint = ball.y - (player.y + player.height/2);
    const norm = collidePoint / (player.height/2);
    const angle = norm * (Math.PI/4); // 45° máx
    const dir = ball.x < canvas.width/2 ? 1 : -1;
    const speed = Math.min(maxBallSpeed, Math.hypot(ball.velocityX, ball.velocityY) + 0.8);
    ball.velocityX = dir * speed * Math.cos(angle);
    ball.velocityY = speed * Math.sin(angle);
  }
}

function render(){
  // Fondo
  drawRect(0, 0, canvas.width, canvas.height, 'black');
  drawNet();
  // Marcadores
  drawText(user.score, canvas.width/4, 80, 'gray', 72, 'bold');
  drawText(com.score, canvas.width*3/4, 80, 'gray', 72, 'bold');
  // Paddles y bola
  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(com.x, com.y, com.width, com.height, com.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function loop(){
  update();
  render();
  requestAnimationFrame(loop);
}

// Música de fondo (control)
const bgm = document.getElementById('backgroundMusic');
const toggleBtn = document.getElementById('toggleMusic');
if (toggleBtn){
  toggleBtn.addEventListener('click', async ()=>{
    try{
      if (bgm.paused){ await bgm.play(); toggleBtn.textContent = 'Pausar música'; }
      else { bgm.pause(); toggleBtn.textContent = 'Reanudar música'; }
    }catch(e){ /* ignore autoplay restrictions */ }
  });
}

// Autoplay (puede fallar por restricciones del navegador)
(async ()=>{ try { await bgm.play(); } catch(e){} })();

// Iniciar
resetBall();
loop();

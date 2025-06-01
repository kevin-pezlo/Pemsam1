// Variables globales
let currentColor = 0;
let colorScore = 0;
let colorInterval;
let shapesPlaced = 0;
let draggedShape = null;
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let canFlip = true;
const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let isDrawing = false;
let currentDrawingColor = 'black';
let brushSize = 5;
let ctx;

// Mascota interactiva
const pet = document.getElementById('interactivePet');
let petX = 100;
let petY = 100;
let petTargetX = 100;
let petTargetY = 100;
let petSpeed = 1;
let petDirection = 1;
let petState = 'idle';
let petTimer = 0;
let cursorNearPet = false;

// Inicialización al cargar la página
window.onload = function() {
    // Configurar colores del juego de colores
    document.getElementById('color1').style.backgroundColor = 'red';
    document.getElementById('color2').style.backgroundColor = 'blue';
    document.getElementById('color3').style.backgroundColor = 'green';
    document.getElementById('color4').style.backgroundColor = 'yellow';
    
    // Configurar eventos de los juegos
    setupColorGame();
    setupShapeGame();
    setupMemoryGame();
    setupDrawingGame();
    setupPet();
};

// Juego de Colores
function setupColorGame() {
    const colors = document.querySelectorAll('.color-option');
    colors.forEach((color, index) => {
        color.addEventListener('click', () => checkColor(index + 1));
    });
}

function startColorGame() {
    colorScore = 0;
    document.getElementById('colorScore').textContent = 'Puntuación: 0';
    colorInterval = setInterval(changeActiveColor, 1500);
}

function changeActiveColor() {
    for (let i = 1; i <= 4; i++) {
        document.getElementById('color' + i).style.boxShadow = 'none';
    }
    
    currentColor = Math.floor(Math.random() * 4) + 1;
    document.getElementById('color' + currentColor).style.boxShadow = '0 0 20px 10px yellow';
}

function checkColor(color) {
    if (color === currentColor) {
        colorScore++;
        document.getElementById('colorScore').textContent = 'Puntuación: ' + colorScore;
        document.getElementById('color' + color).style.transform = 'scale(1.2)';
        setTimeout(() => {
            document.getElementById('color' + color).style.transform = 'scale(1)';
        }, 300);
    }
}

// Juego de Figuras
function setupShapeGame() {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach(shape => {
        shape.addEventListener('dragstart', dragStart);
    });
    
    const targets = document.querySelectorAll('.target');
    targets.forEach(target => {
        target.addEventListener('dragover', dragOver);
        target.addEventListener('drop', drop);
    });
}

function dragStart(e) {
    draggedShape = e.target;
    e.dataTransfer.setData('text/plain', e.target.id);
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const targetId = e.target.id;
    const shapeId = targetId.replace('Target', '');
    
    if (draggedShape.id === shapeId) {
        const targetRect = e.target.getBoundingClientRect();
        const gameRect = document.getElementById('shapeGame').getBoundingClientRect();
        
        draggedShape.style.top = (targetRect.top + targetRect.height/2 - draggedShape.offsetHeight/2 - gameRect.top) + 'px';
        draggedShape.style.left = (targetRect.left + targetRect.width/2 - draggedShape.offsetWidth/2 - gameRect.left) + 'px';
        
        draggedShape.draggable = false;
        shapesPlaced++;
        document.getElementById('shapeScore').textContent = 'Figuras colocadas: ' + shapesPlaced + '/4';
        
        e.target.style.borderStyle = 'solid';
        draggedShape.style.opacity = '0.7';
        
        if (shapesPlaced === 4) {
            setTimeout(() => {
                alert('¡Felicidades! Has completado el juego.');
            }, 500);
        }
    }
}

// Memorama
function setupMemoryGame() {
    const memoryBoard = document.getElementById('memoryBoard');
    memoryBoard.innerHTML = '';
    
    memoryCards = [...symbols, ...symbols];
    memoryCards.sort(() => Math.random() - 0.5);
    
    memoryCards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });
}

function flipCard() {
    if (!canFlip || this.classList.contains('flipped') || flippedCards.length >= 2) return;
    
    this.classList.add('flipped');
    this.textContent = this.dataset.symbol;
    flippedCards.push(this);
    
    if (flippedCards.length === 2) {
        canFlip = false;
        setTimeout(checkForMatch, 500);
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
        matchedPairs++;
        document.getElementById('memoryScore').textContent = 'Parejas: ' + matchedPairs + '/8';
        
        card1.removeEventListener('click', flipCard);
        card2.removeEventListener('click', flipCard);
        
        flippedCards = [];
        canFlip = true;
        
        if (matchedPairs === 8) {
            setTimeout(() => {
                alert('¡Felicidades! Has encontrado todas las parejas.');
            }, 500);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '';
            card2.textContent = '';
            flippedCards = [];
            canFlip = true;
        }, 1000);
    }
}

function resetMemoryGame() {
    matchedPairs = 0;
    flippedCards = [];
    canFlip = true;
    setupMemoryGame();
    document.getElementById('memoryScore').textContent = 'Parejas: 0/8';
}

// Dibujo Libre
function setupDrawingGame() {
    const canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Eventos de ratón
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Eventos táctiles
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    // Selectores de color
    const colorSpans = document.querySelectorAll('.color-picker span');
    colorSpans.forEach(span => {
        span.addEventListener('click', function() {
            currentDrawingColor = this.style.backgroundColor;
        });
    });
    
    // Tamaños de pincel
    const brushButtons = document.querySelectorAll('.brush-size button');
    brushButtons[0].addEventListener('click', () => changeBrushSize(2));
    brushButtons[1].addEventListener('click', () => changeBrushSize(5));
    brushButtons[2].addEventListener('click', () => changeBrushSize(10));
    
    // Botón limpiar
    document.querySelector('.clear-btn').addEventListener('click', clearDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = e.target.getBoundingClientRect();
    let x, y;
    
    if (e.type.includes('touch')) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    
    ctx.fillStyle = currentDrawingColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
}

function changeBrushSize(size) {
    brushSize = size;
}

function clearDrawing() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

const duck = document.getElementById('duck');
const speed = 3; // pixeles por frame
let duckPos = { x: 100, y: 100 };
let targetPos = { x: 100, y: 100 };
let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let stealingCursor = false;

// Mueve el pato hacia targetPos
function moveDuck() {
  const dx = targetPos.x - duckPos.x;
  const dy = targetPos.y - duckPos.y;
  const dist = Math.hypot(dx, dy);

  if (dist > speed) {
    duckPos.x += (dx / dist) * speed;
    duckPos.y += (dy / dist) * speed;
  } else {
    duckPos.x = targetPos.x;
    duckPos.y = targetPos.y;
  }

  duck.style.left = duckPos.x + 'px';
  duck.style.top = duckPos.y + 'px';

  // Voltea el pato según dirección
  if (dx > 0) {
    duck.style.transform = 'scaleX(1)';
  } else {
    duck.style.transform = 'scaleX(-1)';
  }
}

// Genera una posición aleatoria dentro de la ventana
function randomPosition() {
  return {
    x: Math.random() * (window.innerWidth - 80),
    y: Math.random() * (window.innerHeight - 80),
  };
}

// Actualiza targetPos para que el pato siga el cursor si está cerca,
// o se mueva aleatoriamente si está lejos
function updateTarget() {
  const dx = mousePos.x - duckPos.x;
  const dy = mousePos.y - duckPos.y;
  const dist = Math.hypot(dx, dy);

  if (!stealingCursor && dist < 150) {
    // Sigue el cursor
    targetPos = { x: mousePos.x - 40, y: mousePos.y - 40 };
  } else if (!stealingCursor && dist >= 150) {
    // Se mueve aleatoriamente cada cierto tiempo
    if (Math.random() < 0.02) {
      targetPos = randomPosition();
    }
  }
}

// Simula que el pato “roba” el cursor durante 3 segundos
function stealCursor() {
  if (stealingCursor) return;
  stealingCursor = true;
  const originalCursor = document.body.style.cursor;
  document.body.style.cursor = 'none';

  let offsetX = 0;
  let offsetY = 0;

  // El pato se mueve con el cursor (simulado)
  const moveInterval = setInterval(() => {
    offsetX += 5;
    offsetY += 3;
    targetPos.x = duckPos.x + offsetX;
    targetPos.y = duckPos.y + offsetY;
  }, 30);

  setTimeout(() => {
    clearInterval(moveInterval);
    stealingCursor = false;
    document.body.style.cursor = originalCursor;
    targetPos = randomPosition();
  }, 3000);
}

// Evento para actualizar posición del mouse
window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

// Evento para que el pato “robe” el cursor al hacer click
duck.addEventListener('click', () => {
  stealCursor();
});

// Animación principal
function animate() {
  updateTarget();
  moveDuck();
  requestAnimationFrame(animate);
}

// Inicialización
duck.style.left = duckPos.x + 'px';
duck.style.top = duckPos.y + 'px';
animate();


// Funciones para abrir/cerrar juegos
function openGame(gameId) {
    document.getElementById(gameId + 'Screen').style.display = 'flex';
    
    switch(gameId) {
        case 'colorGame':
            startColorGame();
            break;
        case 'shapeGame':
            shapesPlaced = 0;
            document.getElementById('shapeScore').textContent = 'Figuras colocadas: 0/4';
            break;
        case 'memoryGame':
            resetMemoryGame();
            break;
        case 'drawingGame':
            // No necesita inicialización adicional
            break;
    }
}

function closeGame(gameId) {
    document.getElementById(gameId).style.display = 'none';
    
    if (gameId === 'colorGameScreen') {
        clearInterval(colorInterval);
    }
}

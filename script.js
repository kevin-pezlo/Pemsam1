// Variables globales
let currentColor = 0;More actions
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

// Mascota interactiva
function setupPet() {
    updatePetPosition();

    // Movimiento aleatorio
    setInterval(() => {
        if (petState !== 'interacting' && !cursorNearPet) {
            const states = ['idle', 'moving', 'sleepy'];
            petState = states[Math.floor(Math.random() * states.length)];

            if (petState === 'moving') {
                petTargetX = Math.random() * (window.innerWidth - 100);
                petTargetY = Math.random() * (window.innerHeight - 100);
                petSpeed = 4.5 + Math.random() * 1.5;
                petSpeed = 0.5 + Math.random() * 1.5;
                petDirection = petTargetX > petX ? 1 : -1;
                pet.classList.remove('happy', 'curious', 'sleepy');
                pet.classList.add('running');
            } else if (petState === 'sleepy') {
                pet.classList.remove('happy', 'curious', 'running');
                pet.classList.add('sleepy');
                petTimer = 200 + Math.random() * 200;
            } else {
                pet.classList.remove('happy', 'curious', 'running', 'sleepy');
            }
        }
    }, 3000);

    // Interacción con el cursor
    document.addEventListener('mousemove', (e) => {
        const dx = e.clientX - petX;
        const dy = e.clientY - petY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
            if (!cursorNearPet) {
                cursorNearPet = true;
                petState = 'interacting';
                pet.classList.remove('running', 'sleepy');

                if (Math.random() > 0.7) {
                    pet.classList.add('curious');
                    petTargetX = petX - dx * 2;
                    petTargetY = petY - dy * 2;
                    petSpeed = 8;
                    petSpeed = 2;
                    petDirection = dx > 0 ? -1 : 1;
                    pet.style.transform = petDirection === 1 ? 'scaleX(1)' : 'scaleX(-1)';
                    pet.classList.add('running');
                } else {
                    pet.classList.add('happy');
                }
            }

            if (pet.classList.contains('happy')) {
                petX += (dx / distance) * 2.5;
                petY += (dy / distance) * 2.5;
                petX += (dx / distance) * 0.5;
                petY += (dy / distance) * 0.5;

                if (dx > 0 && petDirection === -1) {
                    petDirection = 1;
                    pet.style.transform = 'scaleX(1)';
                } else if (dx < 0 && petDirection === 1) {
                    petDirection = -1;
                    pet.style.transform = 'scaleX(-1)';
                }
            }
        } else {
            if (cursorNearPet) {
                cursorNearPet = false;
                petState = 'idle';
                pet.classList.remove('happy', 'curious', 'running');
            }
        }
    });

    // Click en la mascota
    pet.addEventListener('click', () => {
        petState = 'interacting';
        pet.classList.remove('happy', 'curious', 'running', 'sleepy');
        pet.classList.add('happy');

        pet.style.transform = `scaleX(${petDirection}) translateY(-20px)`;
        setTimeout(() => {
            pet.style.transform = `scaleX(${petDirection}) translateY(0)`;
        }, 300);

        setTimeout(() => {
            if (!cursorNearPet) {
                petState = 'idle';
                pet.classList.remove('happy');
            }
        }, 2000);
    });
}

function updatePetPosition() {
    if (petState === 'moving') {
        const dx = petTargetX - petX;
        const dy = petTargetY - petY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
            petX += (dx / distance) * petSpeed;
            petY += (dy / distance) * petSpeed;

            if (dx > 0 && petDirection === -1) {
                petDirection = 1;
                pet.style.transform = 'scaleX(1)';
            } else if (dx < 0 && petDirection === 1) {
                petDirection = -1;
                pet.style.transform = 'scaleX(-1)';
            }
        } else {
            petState = 'idle';
            pet.classList.remove('running');
        }
    } else if (petState === 'sleepy') {
        petTimer--;
        if (petTimer <= 0) {
            petState = 'idle';
            pet.classList.remove('sleepy');
        }
    }

    pet.style.left = petX + 'px';
    pet.style.top = petY + 'px';
    requestAnimationFrame(updatePetPosition);
}

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

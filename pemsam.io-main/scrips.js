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
document.addEventListener('DOMContentLoaded', function() {
    // Progreso guardado
    const Progress = {
        key: 'pemsamProgress',
        data: { plays:{}, best:{}, lastGame:null },
        load(){ try{ const d=JSON.parse(localStorage.getItem(this.key)); if(d) this.data = d; }catch(e){} },
        save(){ localStorage.setItem(this.key, JSON.stringify(this.data)); },
        incrementPlay(game){ this.data.plays[game] = (this.data.plays[game]||0)+1; this.data.lastGame = game; this.save(); },
        updateBest(game, values, modes={}) {
            if (!this.data.best[game]) this.data.best[game] = {};
            const target = this.data.best[game];
            Object.keys(values).forEach(k=>{
                const mode = modes[k] || 'max';
                const v = values[k];
                const cur = target[k];
                if (v == null || Number.isNaN(v)) return;
                if (cur == null) { target[k]=v; return; }
                if (mode === 'min') { if (v < cur) target[k] = v; }
                else { if (v > cur) target[k] = v; }
            });
            this.save();
        }
    };
    Progress.load();
    // --- MODALES ---
    function openModal(gameId) {
        document.querySelectorAll('.game-modal').forEach(m => m.style.display = 'none');
        const modal = document.getElementById(`${gameId}-modal`);
        if (modal) {
            modal.style.display = 'flex';
            Progress.incrementPlay(gameId);
            if (gameSetups[gameId]) gameSetups[gameId]();
        }
    }
    function closeModal(modal) {
        modal.style.display = 'none';
        if (typeof resetAllGames === 'function') resetAllGames();
    }
    document.querySelectorAll('.play-game-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(btn.getAttribute('data-game'));
        });
    });
    document.querySelectorAll('.footer-column ul li a[data-game]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(link.getAttribute('data-game'));
        });
    });
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(btn.closest('.game-modal'));
        });
    });
    document.querySelectorAll('.game-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal(modal);
        });
    });

    // --- RESET GENERAL ---
    function resetAllGames() {
        // Carrera de obstáculos
        if (window.obstacleInterval) clearInterval(window.obstacleInterval);
        const ogame = document.getElementById('obstacle-game');
        if (ogame) ogame.querySelectorAll('.obstacle').forEach(o => o.remove());
        document.getElementById('obstacle-score').textContent = '0';
        document.getElementById('obstacle-level').textContent = '1';

        // Puntería
        if (window.aimInterval) clearInterval(window.aimInterval);
        if (window.aimMoveInterval) clearInterval(window.aimMoveInterval);
        if (window.aimTimerInterval) clearInterval(window.aimTimerInterval);
        const agame = document.getElementById('aim-game');
        if (agame) agame.querySelectorAll('.target').forEach(t => t.remove());
        document.getElementById('aim-score').textContent = '0';
        document.getElementById('aim-time').textContent = '30';
        document.getElementById('aim-crosshair').style.display = 'none';

        // Rompecabezas
        if (window.puzzleInterval) clearInterval(window.puzzleInterval);
        const pgame = document.getElementById('puzzle-container');
        if (pgame) pgame.innerHTML = '';
        document.getElementById('puzzle-time').textContent = '0';
        document.getElementById('puzzle-pieces').textContent = '0';

        // Ascenso al árbol
        if (window.treeInterval) clearInterval(window.treeInterval);
        const tgame = document.getElementById('tree-climb-game');
        if (tgame) tgame.querySelectorAll('.branch').forEach(b => b.remove());
        document.getElementById('tree-score').textContent = '0';
        document.getElementById('tree-height').textContent = '0';

        // Laberinto
        const maze = document.getElementById('maze');
        if (maze) maze.querySelectorAll('.maze-wall').forEach(w => w.remove());
        document.getElementById('maze-attempts').textContent = '0';
        document.getElementById('maze-level').textContent = '1';
        document.querySelector('.maze-options').style.display = 'none';

        // Teclado musical
        document.getElementById('music-game').innerHTML = '';
        document.getElementById('music-melody').textContent = '';
        document.getElementById('music-correct').textContent = '0';

        // Animales
        document.getElementById('animal-image').src = '';
        document.getElementById('animal-options').innerHTML = '';
        document.getElementById('animal-input').value = '';
        document.getElementById('animals-score').textContent = '0';
        document.getElementById('animals-correct').textContent = '0';
    }

    // --- JUEGOS ---
    const gameSetups = {
        obstacle: setupObstacleGame,
        aim: setupAimGame,
        puzzle: setupPuzzleGame,
        tree: setupTreeGame,
        maze: setupMazeGame,
        music: setupMusicGame,
        animals: setupAnimalsGame
    };

    // 1. Carrera de Obstáculos
    function setupObstacleGame() {
        const game = document.getElementById('obstacle-game');
        const character = document.getElementById('obstacle-character');
        let score = 0, level = 1, speed = 5, charLeft = 50;
        character.style.left = `${charLeft}px`;
        function moveChar(e) {
            if (e.key === 'w' && charLeft < game.offsetWidth - 50) charLeft += 20;
            if (e.key === 's' && charLeft > 0) charLeft -= 20;
            character.style.left = `${charLeft}px`;
        }
        document.addEventListener('keydown', moveChar);
        window.obstacleInterval = setInterval(() => {
            // Crear obstáculo
            const obs = document.createElement('div');
            obs.className = 'obstacle';
            obs.style.right = '-30px';
            obs.style.bottom = `${Math.random() * 100 + 20}px`;
            obs.style.position = 'absolute';
            obs.style.width = '30px';
            obs.style.height = '30px';
            obs.style.background = '#e74c3c';
            obs.style.borderRadius = '50%';
            game.appendChild(obs);

            // Mover obstáculos
            const obstacles = Array.from(game.querySelectorAll('.obstacle'));
            obstacles.forEach((o, i) => {
                let currentRight = parseInt(o.style.right);
                let newRight = currentRight + speed;
                o.style.right = `${newRight}px`;
                // Colisión
                const oRect = o.getBoundingClientRect();
                const cRect = character.getBoundingClientRect();
                if (
                    cRect.left < oRect.right &&
                    cRect.right > oRect.left &&
                    cRect.top < oRect.bottom &&
                    cRect.bottom > oRect.top
                ) {
                    alert(`¡Chocaste! Puntuación final: ${score}. Nivel alcanzado: ${level}`);
                    clearInterval(window.obstacleInterval);
                    document.removeEventListener('keydown', moveChar);
                }
                // Sale de pantalla
                if (newRight > game.offsetWidth) {
                    o.remove();
                    score += 10;
                    document.getElementById('obstacle-score').textContent = score;
                    if (score >= level * 100) {
                        level++;
                        document.getElementById('obstacle-level').textContent = level;
                        speed += 2;
                    }
                    Progress.updateBest('obstacle', {score, level}, {score:'max', level:'max'});
                }
            });
        }, 1000);
        // Limpiar evento al cerrar modal
        document.getElementById('obstacle-modal').addEventListener('click', function handler(e) {
            if (e.target.classList.contains('close-modal') || e.target === this) {
                document.removeEventListener('keydown', moveChar);
                this.removeEventListener('click', handler);
            }
        });
    }

    // 2. Puntería
    function setupAimGame() {
        const game = document.getElementById('aim-game');
        const crosshair = document.getElementById('aim-crosshair');
        let score = 0, timeLeft = 30, targets = [];
        crosshair.style.display = 'block';
        crosshair.style.position = 'absolute';
        game.addEventListener('mousemove', function(e) {
            const rect = game.getBoundingClientRect();
            crosshair.style.left = `${e.clientX - rect.left - 10}px`;
            crosshair.style.top = `${e.clientY - rect.top - 10}px`;
        });
        function createTarget() {
            const t = document.createElement('div');
            t.className = 'target';
            t.style.position = 'absolute';
            t.style.left = `${Math.random() * (game.offsetWidth - 40)}px`;
            t.style.top = `${Math.random() * (game.offsetHeight - 40)}px`;
            const size = Math.random() * 20 + 20;
            t.style.width = `${size}px`;
            t.style.height = `${size}px`;
            t.style.background = '#e74c3c';
            t.style.borderRadius = '50%';
            t.style.cursor = 'pointer';
            game.appendChild(t);
            targets.push(t);
            t.addEventListener('click', function() {
                t.remove();
                targets = targets.filter(x => x !== t);
                score += 5;
                document.getElementById('aim-score').textContent = score;
                Progress.updateBest('aim', {score}, {score:'max'});
            });
        }
        window.aimInterval = setInterval(createTarget, 1000);
        window.aimMoveInterval = setInterval(function() {
            targets.forEach(t => {
                let l = parseFloat(t.style.left);
                let ttop = parseFloat(t.style.top);
                let dx = (Math.random() - 0.5) * 5;
                let dy = (Math.random() - 0.5) * 5;
                l += dx; ttop += dy;
                if (l < 0) l = 0;
                if (l > game.offsetWidth - parseFloat(t.style.width)) l = game.offsetWidth - parseFloat(t.style.width);
                if (ttop < 0) ttop = 0;
                if (ttop > game.offsetHeight - parseFloat(t.style.height)) ttop = game.offsetHeight - parseFloat(t.style.height);
                t.style.left = `${l}px`;
                t.style.top = `${ttop}px`;
            });
        }, 50);
        window.aimTimerInterval = setInterval(function() {
            timeLeft--;
            document.getElementById('aim-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(window.aimInterval);
                clearInterval(window.aimMoveInterval);
                clearInterval(window.aimTimerInterval);
                alert(`¡Tiempo terminado! Puntuación final: ${score}`);
            }
        }, 1000);
    }

    // 3. Rompecabezas
    // ...existing code...
function setupPuzzleGame() {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';
    const rows = 3, cols = 4, total = rows * cols; // 12 piezas
    const pieceW = container.offsetWidth / cols, pieceH = container.offsetHeight / rows;
    let correct = 0, time = 0;

    // Define patrón de salientes y entrantes para cada pieza
    // Cada lado: [top, right, bottom, left] (1 = saliente, -1 = entrante, 0 = borde recto)
    // Puedes personalizar el patrón para cada pieza
    const patterns = [
        [0,  1, -1, 0],   [0,  1,  1, -1],   [0,  1, -1,  1],   [0,  0,  1, -1],
        [-1,  1,  1, 0],  [1,  1, -1,  1],   [-1,  1,  1,  1],  [1,  0, -1,  1],
        [1,  1,  0, 0],   [1, -1,  0,  1],   [-1, -1,  0, -1],  [1,  0,  0, -1]
    ];

    // Dibuja los espacios de alojamiento con la misma forma que las piezas
    for (let i = 0; i < total; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const slot = document.createElement('canvas');
        slot.className = 'puzzle-slot';
        slot.width = pieceW;
        slot.height = pieceH;
        slot.style.position = 'absolute';
        slot.style.left = `${col * pieceW}px`;
        slot.style.top = `${row * pieceH}px`;
        slot.style.zIndex = '1';
        slot.dataset.slotIndex = i;

        // Dibuja la forma de la pieza en el slot
        const ctx = slot.getContext('2d');
        ctx.save();
        ctx.beginPath();
        const tabSize = Math.min(pieceW, pieceH) / 3;
        const curve = tabSize / 2;
        const [top, right, bottom, left] = patterns[i];

        function drawSide(startX, startY, endX, endY, type) {
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            if (type === 0) {
                ctx.lineTo(endX, endY);
                return;
            }
            let dx = endX - startX;
            let dy = endY - startY;
            let angle = Math.atan2(dy, dx);
            let tabDir = type;
            let tabX = midX + Math.cos(angle - Math.PI / 2) * tabSize * tabDir;
            let tabY = midY + Math.sin(angle - Math.PI / 2) * tabSize * tabDir;
            ctx.lineTo(midX - curve * Math.sin(angle), midY + curve * Math.cos(angle));
            ctx.quadraticCurveTo(tabX, tabY, midX + curve * Math.sin(angle), midY - curve * Math.cos(angle));
            ctx.lineTo(endX, endY);
        }

        ctx.moveTo(curve, 0);
        drawSide(curve, 0, pieceW - curve, 0, top);
        drawSide(pieceW, curve, pieceW, pieceH - curve, right);
        drawSide(pieceW - curve, pieceH, curve, pieceH, bottom);
        drawSide(0, pieceH - curve, 0, curve, left);
        ctx.closePath();
        ctx.fillStyle = `rgba(${200+row*20},${200+col*10},255,0.25)`; // Fondo colorido y suave
        ctx.fill();
        ctx.strokeStyle = "#F2B705";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.restore();

        container.appendChild(slot);
    }

    // Dibuja cada pieza con forma realista y borde azul
    for (let i = 0; i < total; i++) {
        const piece = document.createElement('canvas');
        piece.className = 'puzzle-piece';
        piece.width = pieceW;
        piece.height = pieceH;
        piece.style.position = 'absolute';
        piece.style.left = `${Math.random() * (container.offsetWidth - pieceW)}px`;
        piece.style.top = `${Math.random() * (container.offsetHeight - pieceH)}px`;
        piece.setAttribute('draggable', 'true');
        piece.dataset.correctPosition = i;
        piece.style.zIndex = '2';

        // Dibuja la forma de la pieza
        const ctx = piece.getContext('2d');
        ctx.save();
        ctx.beginPath();
        const tabSize = Math.min(pieceW, pieceH) / 3;
        const curve = tabSize / 2;
        const [top, right, bottom, left] = patterns[i];

        function drawSide(startX, startY, endX, endY, type) {
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            if (type === 0) {
                ctx.lineTo(endX, endY);
                return;
            }
            let dx = endX - startX;
            let dy = endY - startY;
            let angle = Math.atan2(dy, dx);
            let tabDir = type;
            let tabX = midX + Math.cos(angle - Math.PI / 2) * tabSize * tabDir;
            let tabY = midY + Math.sin(angle - Math.PI / 2) * tabSize * tabDir;
            ctx.lineTo(midX - curve * Math.sin(angle), midY + curve * Math.cos(angle));
            ctx.quadraticCurveTo(tabX, tabY, midX + curve * Math.sin(angle), midY - curve * Math.cos(angle));
            ctx.lineTo(endX, endY);
        }

        ctx.moveTo(curve, 0);
        drawSide(curve, 0, pieceW - curve, 0, top);
        drawSide(pieceW, curve, pieceW, pieceH - curve, right);
        drawSide(pieceW - curve, pieceH, curve, pieceH, bottom);
        drawSide(0, pieceH - curve, 0, curve, left);
        ctx.closePath();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "rgba(255,255,255,0.95)"; // Fondo blanco/transparente
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#03658C";
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        ctx.shadowColor = "#F2B705";
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Puedes añadir una imagen aquí si tienes una en img/puzzle.jpg
        // let img = new Image();
        // img.src = 'img/puzzle.jpg';
        // img.onload = () => ctx.drawImage(img, 0, 0, pieceW, pieceH);

        ctx.restore();

        container.appendChild(piece);

        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', piece.dataset.correctPosition);
            setTimeout(() => piece.style.opacity = '0.5', 0);
        });
        piece.addEventListener('dragend', () => piece.style.opacity = '1');
    }

    container.addEventListener('dragover', e => e.preventDefault());
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        const index = e.dataTransfer.getData('text/plain');
        const piece = Array.from(container.querySelectorAll('.puzzle-piece')).find(p => p.dataset.correctPosition === index);
        if (!piece || piece.draggable === "false") return;
        // Detecta el slot más cercano
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let nearestSlot = null, minDist = Infinity;
        container.querySelectorAll('.puzzle-slot').forEach(slot => {
            const sx = parseFloat(slot.style.left) + pieceW / 2;
            const sy = parseFloat(slot.style.top) + pieceH / 2;
            const dist = Math.hypot(sx - x, sy - y);
            if (dist < minDist) {
                minDist = dist;
                nearestSlot = slot;
            }
        });
        if (nearestSlot && nearestSlot.dataset.slotIndex === index) {
            piece.style.left = nearestSlot.style.left;
            piece.style.top = nearestSlot.style.top;
            piece.setAttribute('draggable', 'false');
            correct++;
            document.getElementById('puzzle-pieces').textContent = correct;
            if (correct === total) {
                clearInterval(window.puzzleInterval);
                Progress.updateBest('puzzle', {bestTime: time}, {bestTime:'min'});
                setTimeout(() => {
                    alert(`¡Rompecabezas completado en ${time} segundos!`);
                }, 300);
            }
        } else if (nearestSlot) {
            piece.style.left = `${x - pieceW / 2}px`;
            piece.style.top = `${y - pieceH / 2}px`;
        }
    });

    document.getElementById('puzzle-pieces').textContent = '0';
    document.getElementById('puzzle-time').textContent = '0';
    window.puzzleInterval = setInterval(() => {
        time++;
        document.getElementById('puzzle-time').textContent = time;
    }, 1000);
}
// ...existing code...
    // 4. Ascenso al Árbol
function setupTreeGame() {
    const game = document.getElementById('tree-climb-game');
    // Ajustar tamaño del marco para mejor visibilidad
    if (game) {
        game.style.width = '160px';
        game.style.height = '360px';
        // Fondo de naturaleza con superposición ligera
        game.style.backgroundImage = 'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.2)), url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60)';
        game.style.backgroundSize = 'cover';
        game.style.backgroundPosition = 'center';
        game.style.backgroundRepeat = 'no-repeat';
    }
    const climber = document.getElementById('climber');
    const tree = document.getElementById('tree');
    // Textura del tronco
    if (tree) {
        tree.style.background = 'linear-gradient(180deg,#81512b,#a06a3f)';
        tree.style.opacity = '0.9';
        tree.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.25)';
    }
    let treeLevel = 1;
    let branchPattern = [];
    let currentStep = 0;
    let score = 0;
    let fails = 0;
    let maxFails = 3;
    let branchHeight = 40;
    let totalSteps = 20; // Puedes ajustar la cantidad de ramas visibles
    let climberPos = 0; // 0 es la base
    const MAX_TREE_LEVEL = 8;
    let finished = false;

    // Limpia ramas, hojas y nubes previas
    game.querySelectorAll('.branch, .cloud, .leaf').forEach(e => e.remove());

    function generatePattern(level, len) {
        // Siempre una sola rama por línea. Patrón tipo zig-zag con alguna repetición en niveles altos.
        const pat = [];
        let side = Math.random() < 0.5 ? 'left' : 'right';
        for (let i = 0; i < len; i++) {
            if (level >= 3 && Math.random() < Math.min(0.25 + level*0.03, 0.55)) {
                // mantener lado para aumentar dificultad
            } else {
                side = side === 'left' ? 'right' : 'left';
            }
            pat.push(side);
        }
        return pat;
    }
    function buildLevel() {
        if (finished) return;
        if (treeLevel > MAX_TREE_LEVEL) { showFinal(); return; }
        // limpiar anteriores
        game.querySelectorAll('.branch, .cloud, .leaf').forEach(e => e.remove());
        // Calcular pasos para que las ramas no se salgan del marco
        const gH = game.clientHeight;
        const gW = game.clientWidth;
        totalSteps = Math.max(6, Math.floor((gH - 30) / branchHeight));
        branchPattern = generatePattern(treeLevel, totalSteps);
        // Ancho de rama limitado al 45% del ancho del marco y con reducción por nivel
        let bw = Math.max(36, 56 - treeLevel * 2);
        bw = Math.min(bw, Math.floor(gW * 0.45));
        for (let i = 0; i < totalSteps; i++) {
            const pattern = branchPattern[i];
            const y = i * branchHeight + 10;
            if (pattern === 'left') {
                const branchL = document.createElement('div');
                branchL.className = 'branch';
                branchL.style.width = bw + 'px';
                branchL.style.height = '12px';
                branchL.style.background = 'linear-gradient(180deg,#7a4a21,#a06a3f), repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, rgba(0,0,0,0.06) 2px 4px)';
                branchL.style.position = 'absolute';
                branchL.style.left = '0px';
                branchL.style.bottom = `${y}px`;
                branchL.style.borderRadius = '8px';
                branchL.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.25)';
                branchL.style.zIndex = '2';
                game.appendChild(branchL);
                            }
            if (pattern === 'right') {
                const branchR = document.createElement('div');
                branchR.className = 'branch';
                branchR.style.width = bw + 'px';
                branchR.style.height = '12px';
                branchR.style.background = 'linear-gradient(180deg,#7a4a21,#a06a3f), repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 2px, rgba(0,0,0,0.06) 2px 4px)';
                branchR.style.position = 'absolute';
                branchR.style.right = '0px';
                branchR.style.bottom = `${y}px`;
                branchR.style.borderRadius = '8px';
                branchR.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.25)';
                branchR.style.zIndex = '2';
                game.appendChild(branchR);
                            }
        }
        // objetivo visual: punto rojo colocado sobre la última rama
        const lastY = (totalSteps - 1) * branchHeight + 10;
        const lastSide = branchPattern[totalSteps - 1];
        let goal = document.getElementById('tree-goal');
        if (!goal) {
            goal = document.createElement('div');
            goal.id = 'tree-goal';
            goal.style.position = 'absolute';
            goal.style.width = '12px';
            goal.style.height = '12px';
            goal.style.borderRadius = '50%';
            goal.style.background = '#F20505';
            goal.style.boxShadow = '0 0 0 2px #fff, 0 0 8px rgba(242,5,5,.6)';
            goal.style.zIndex = '9';
            game.appendChild(goal);
        } else {
            goal.style.display = '';
        }
        // Posicionar en el centro de la rama final
        const gameWidth = game.clientWidth;
        const centerX = lastSide === 'left' ? (bw / 2) : (gameWidth - bw / 2);
        const bottom = lastY + 12 + 3; // sobre la rama
        goal.style.left = centerX + 'px';
        goal.style.right = 'auto';
        goal.style.top = 'auto';
        goal.style.transform = 'none';
        goal.style.bottom = bottom + 'px';
    }
    function showFinal() {
        finished = true;
        // limpiar ramas y hojas
        game.querySelectorAll('.branch, .cloud, .leaf').forEach(e => e.remove());
        // ocultar objetivo
        const goalHide = document.getElementById('tree-goal');
        if (goalHide) goalHide.style.display = 'none';
        // trofeo
        let trophy = document.getElementById('tree-trophy');
        if (!trophy) {
            trophy = document.createElement('div');
            trophy.id = 'tree-trophy';
            trophy.textContent = '🏆';
            trophy.style.position = 'absolute';
            trophy.style.top = '8px';
            trophy.style.left = '50%';
            trophy.style.transform = 'translateX(-50%)';
            trophy.style.fontSize = '28px';
            trophy.style.zIndex = '5';
            game.appendChild(trophy);
        }
        const lvlEl = document.getElementById('tree-level'); if (lvlEl) lvlEl.textContent = MAX_TREE_LEVEL;
        const lvlTxt = document.getElementById('tree-level-text'); if (lvlTxt) lvlTxt.textContent = 'Nivel: ' + MAX_TREE_LEVEL + ' (Final)';
        // mensaje final
        let finalMsg = document.getElementById('tree-final-msg');
        if (!finalMsg) {
            finalMsg = document.createElement('div');
            finalMsg.id = 'tree-final-msg';
            finalMsg.style.margin = '8px 0';
            finalMsg.style.fontWeight = '700';
            finalMsg.style.color = '#338C30';
            game.insertAdjacentElement('afterend', finalMsg);
        }
        finalMsg.textContent = '¡Felicitaciones! Has coronado la copa del árbol. Puntaje: ' + score + '.';
        // reinicio automático
        setTimeout(()=>{
            treeLevel = 1;
            climberPos = 0;
            score = 0;
            fails = 0;
            finished = false;
            climberSide = 'center';
            if (trophy) trophy.remove();
            if (finalMsg) finalMsg.remove();
            const goalShow = document.getElementById('tree-goal');
            if (goalShow) goalShow.style.display = '';
            buildLevel();
            updateClimber();
        }, 3500);
    }
    buildLevel();

    // Asegurar contador de nivel y botón reiniciar en el modal
    try {
        const modal = document.querySelector('#tree-modal .game-modal-content');
        const scoreboard = document.querySelector('#tree-modal .scoreboard');
        if (scoreboard && !document.getElementById('tree-level')) {
            scoreboard.insertAdjacentHTML('beforeend', ' | Nivel: <span id="tree-level">1</span>');
        }
        const gameBox = document.getElementById('tree-climb-game');
        if (gameBox) {
            let label = document.getElementById('tree-level-text');
            if (!label) {
                label = document.createElement('div');
                label.id = 'tree-level-text';
                label.style.margin = '6px 0';
                label.style.fontWeight = '700';
                label.style.color = '#03658C';
                gameBox.insertAdjacentElement('afterend', label);
            }
            label.textContent = 'Nivel: ' + treeLevel;
        }
        const restart = document.getElementById('tree-restart');
        if (restart) restart.remove();
    } catch(e){}

    // Posición inicial del personaje
    const leftX = 20, centerX = 80, rightX = 120;
    let climberSide = 'center';
    function updateClimber() {
        const x = climberSide === 'left' ? leftX : (climberSide === 'right' ? rightX : centerX);
        climber.style.left = `${x}px`;
        climber.style.bottom = `${climberPos * branchHeight + 20}px`;
        const hEl = document.getElementById('tree-height'); if (hEl) hEl.textContent = climberPos;
        const sEl = document.getElementById('tree-score'); if (sEl) sEl.textContent = score;
        const lvlEl = document.getElementById('tree-level'); if (lvlEl) lvlEl.textContent = treeLevel;
        const lvlTxt = document.getElementById('tree-level-text'); if (lvlTxt) lvlTxt.textContent = 'Nivel: ' + treeLevel;
        Progress.updateBest('tree', {score, height: climberPos, level: treeLevel}, {score:'max', height:'max', level:'max'});
    }
    climberPos = 0;
    score = 0;
    fails = 0;
    climberSide = 'center';
    updateClimber();
    // Actualiza instrucciones del modal
    try {
        const instr = document.querySelector('#tree-modal .game-modal-content p');
        if (instr) instr.textContent = 'Controles: A/D o Flechas (izquierda/derecha)';
    } catch (e) {}

    // Movimiento: A/D o Flechas para izquierda/derecha (compatibilidad con W/O)
    function moveClimber(e) {
        if (e.repeat) return; // evita múltiples pasos por mantener la tecla
        if (finished) return;
        const key = e.key;
        const isLeft = key === 'a' || key === 'A' || key === 'ArrowLeft' || key === 'w' || key === 'W';
        const isRight = key === 'd' || key === 'D' || key === 'ArrowRight' || key === 'o' || key === 'O';
        if (!isLeft && !isRight) return;
        e.preventDefault();
        if (climberPos >= totalSteps - 1) return; // Llegó al tope

        const nextPattern = branchPattern[(climberPos + 1) % branchPattern.length];
        let ok = false;
        if (isLeft && (nextPattern === 'left' || nextPattern === 'both')) { ok = true; climberSide = 'left'; }
        if (isRight && (nextPattern === 'right' || nextPattern === 'both')) { ok = true; climberSide = 'right'; }

        if (ok) {
            climberPos++;
            score++;
            updateClimber();
            if (climberPos >= totalSteps - 1) {
                treeLevel++;
                fails = 0;
                climberPos = 0;
                climberSide = 'center';
                buildLevel();
                updateClimber();
                return;
            }
        } else {
            fails++;
            // Al fallar, resbala y vuelve al centro
            climberSide = 'center';
            if (fails >= maxFails) {
                alert('¡Vuelve a intentarlo! Has fallado 3 veces.');
                climberPos = 0;
                score = 0;
                fails = 0;
            } else {
                if (climberPos > 0) climberPos--;
            }
            updateClimber();
        }
    }

    document.addEventListener('keydown', moveClimber);

    // Limpiar evento al cerrar modal
    document.getElementById('tree-modal').addEventListener('click', function handler(e) {
        if (e.target.classList.contains('close-modal') || e.target === this) {
            document.removeEventListener('keydown', moveClimber);
            this.removeEventListener('click', handler);
        }
    });
}

    // 5. Laberinto
  function setupMazeGame() {
    const canvas = document.getElementById('maze-canvas');
    if (!canvas) {
        alert('No se encontró el canvas del laberinto. Revisa el HTML del modal.');
        return;
    }
    const ctx = canvas.getContext('2d');
    const levelEl = document.getElementById('maze-level');
    const messageEl = document.getElementById('maze-message');
    const width = canvas.width, height = canvas.height;
    let cellSize = 40;
    let player = { x: 1.5 * cellSize, y: 1.5 * cellSize, size: 16 };
    let maze = [];
    let level = 1;
    let moving = {up:false,down:false,left:false,right:false};
    let animationId;

    function resetPlayer() {
        player.x = 1.5 * cellSize;
        player.y = 1.5 * cellSize;
    }

    function generateMaze(level) {
        maze = [];
        let rows = Math.floor(height / cellSize);
        let cols = Math.floor(width / cellSize);
        for (let y = 0; y < rows; y++) {
            maze[y] = [];
            for (let x = 0; x < cols; x++) {
                if (y === 0 || y === rows - 1 || x === 0) {
                    maze[y][x] = 1;
                } else if (x === cols - 1) {
                    maze[y][x] = (y === Math.floor(rows / 2)) ? 0 : 1;
                } else {
                    maze[y][x] = 0;
                }
            }
        }
        // Muros internos (más con cada nivel)
        for (let l = 1; l <= level + 1; l++) {
            for (let i = 0; i < l + 2; i++) {
                let wallY = Math.floor(Math.random() * (rows - 2)) + 1;
                let wallX = Math.floor(Math.random() * (cols - 3)) + 2;
                if (maze[wallY][wallX] === 0 && wallY !== Math.floor(rows / 2)) {
                    maze[wallY][wallX] = 1;
                }
            }
        }
    }

    function drawMaze() {
        ctx.clearRect(0, 0, width, height);
        // Fondo ladrillos
        ctx.save();
        ctx.globalAlpha = 0.25;
        for (let y = 0; y < height; y += 60) {
            for (let x = 0; x < width; x += 60) {
                ctx.drawImage(brickImg, x, y, 60, 60);
            }
        }
        ctx.restore();

        // Muros
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[0].length; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = "#8B5C2A";
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
        // Salida (abertura)
        let exitY = Math.floor(maze.length / 2);
        ctx.clearRect((maze[0].length - 1) * cellSize, exitY * cellSize, cellSize, cellSize);

        // Alfombra roja hacia la salida
        ctx.fillStyle = "#F20505";
        ctx.fillRect(cellSize, exitY * cellSize + cellSize/2 - 6, (maze[0].length - 2) * cellSize, 12);

        // Jugador (caballero)
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fillStyle = "#03658C";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
        // Casco
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.x, player.y - 6, player.size/2, Math.PI, 0);
        ctx.fillStyle = "#F2F2F2";
        ctx.fill();
        ctx.restore();
    }

    function isColliding(nx, ny) {
        if (!maze || !maze.length || !maze[0] || !maze[0].length) return false;
        let rows = maze.length, cols = maze[0].length;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (maze[y][x] === 1) {
                    let wallRect = {
                        left: x * cellSize + 4,
                        right: (x + 1) * cellSize - 4,
                        top: y * cellSize + 4,
                        bottom: (y + 1) * cellSize - 4
                    };
                    let px = nx, py = ny, r = player.size - 2;
                    if (
                        px + r > wallRect.left &&
                        px - r < wallRect.right &&
                        py + r > wallRect.top &&
                        py - r < wallRect.bottom
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function isAtExit() {
        let exitY = Math.floor(maze.length / 2);
        let exitX = maze[0].length - 1;
        let px = player.x, py = player.y, r = player.size;
        let ex = exitX * cellSize;
        let ey = exitY * cellSize;
        return (
            px + r > ex &&
            py > ey &&
            py < ey + cellSize
        );
    }

    function restartLevel(msg) {
        messageEl.textContent = msg || '';
        resetPlayer();
        drawMaze();
    }

    function nextLevel() {
        level++;
        levelEl.textContent = level;
        Progress.updateBest('maze', {level}, {level:'max'});
        generateMaze(level);
        resetPlayer();
        messageEl.textContent = '';
        drawMaze();
    }

    function animate() {
        let moved = false;
        let speed = 3 + Math.min(level, 5);
        if (moving.up) {
            let ny = player.y - speed;
            if (!isColliding(player.x, ny)) {
                player.y = ny;
                moved = true;
            }
        }
        if (moving.down) {
            let ny = player.y + speed;
            if (!isColliding(player.x, ny)) {
                player.y = ny;
                moved = true;
            }
        }
        if (moving.left) {
            let nx = player.x - speed;
            if (!isColliding(nx, player.y)) {
                player.x = nx;
                moved = true;
            }
        }
        if (moving.right) {
            let nx = player.x + speed;
            if (!isColliding(nx, player.y)) {
                player.x = nx;
                moved = true;
            }
        }
        drawMaze();
        if (isAtExit()) {
            messageEl.textContent = '¡Nivel superado!';
            setTimeout(nextLevel, 1200);
            return;
        }
        animationId = requestAnimationFrame(animate);
    }

    // Mouse movement
    canvas.onmousedown = function(e) {
        canvas.onmousemove = function(ev) {
            let rect = canvas.getBoundingClientRect();
            let nx = ev.clientX - rect.left;
            let ny = ev.clientY - rect.top;
            if (!isColliding(nx, ny)) {
                player.x = nx;
                player.y = ny;
                drawMaze();
                if (isAtExit()) {
                    messageEl.textContent = '¡Nivel superado!';
                    setTimeout(nextLevel, 1200);
                }
            } else {
                restartLevel('¡Tocaste un muro! Intenta de nuevo.');
            }
        };
    };
    canvas.onmouseup = function() {
        canvas.onmousemove = null;
    };
    canvas.onmouseleave = function() {
        canvas.onmousemove = null;
    };

    // Teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp') moving.up = true;
        if (e.key === 'ArrowDown') moving.down = true;
        if (e.key === 'ArrowLeft') moving.left = true;
        if (e.key === 'ArrowRight') moving.right = true;
    });
    document.addEventListener('keyup', function(e) {
        if (e.key === 'ArrowUp') moving.up = false;
        if (e.key === 'ArrowDown') moving.down = false;
        if (e.key === 'ArrowLeft') moving.left = false;
        if (e.key === 'ArrowRight') moving.right = false;
    });

    // Imagen de ladrillo para fondo
    const brickImg = new window.Image();
    brickImg.src = "https://www.transparenttextures.com/patterns/brick-wall.png";
    brickImg.onload = function() {
        generateMaze(level);
        resetPlayer();
        drawMaze();
        animationId = requestAnimationFrame(animate);
    };

    // Reinicia el nivel si tocas un muro con flechas
    function checkCollisionLoop() {
        if (isColliding(player.x, player.y)) {
            restartLevel('¡Tocaste un muro! Intenta de nuevo.');
        }
        setTimeout(checkCollisionLoop, 30);
    }
    checkCollisionLoop();

    // Al cerrar modal, limpiar animación y eventos
    document.getElementById('maze-modal').addEventListener('click', function handler(e) {
        if (e.target.classList.contains('close-modal') || e.target === this) {
            cancelAnimationFrame(animationId);
            canvas.onmousemove = null;
            document.removeEventListener('keydown', null);
            document.removeEventListener('keyup', null);
            this.removeEventListener('click', handler);
        }
    });
}
    // 6. Teclado Musical
  function setupMusicGame() {
    const musicContainer = document.getElementById('music-game');
    const correctElement = document.getElementById('music-correct');
    const melodyElement = document.getElementById('music-melody');
    // Instrucciones
    let instructions = document.getElementById('music-instructions');
    if (!instructions) {
        instructions = document.createElement('div');
        instructions.id = 'music-instructions';
        instructions.style.margin = '10px 0';
        instructions.style.fontSize = '1rem';
        instructions.style.color = '#03658C';
        melodyElement.parentNode.insertBefore(instructions, melodyElement);
    }
    instructions.innerHTML = "Presiona las teclas <b>C D E F G A B</b> en el orden de la melodía mostrada abajo. <br>¡Solo usa el teclado!";

    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const keys = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    let correctNotes = 0, currentMelody = [], userMelody = [];
    let errorMsg = document.getElementById('music-error');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.id = 'music-error';
        errorMsg.style.color = '#F20505';
        errorMsg.style.margin = '8px 0';
        errorMsg.style.fontWeight = 'bold';
        melodyElement.parentNode.insertBefore(errorMsg, melodyElement.nextSibling);
    }
    errorMsg.textContent = '';

    musicContainer.innerHTML = '';
    keys.forEach((key, i) => {
        const keyEl = document.createElement('div');
        keyEl.className = `music-key ${i % 2 === 0 ? 'white' : 'black'}`;
        keyEl.textContent = notes[i];
        keyEl.dataset.note = notes[i];
        keyEl.dataset.key = key;
        keyEl.style.width = '60px';
        keyEl.style.height = '150px';
        keyEl.style.margin = '0 5px';
        keyEl.style.backgroundColor = i % 2 === 0 ? 'white' : 'black';
        keyEl.style.color = i % 2 === 0 ? 'black' : 'white';
        keyEl.style.border = '1px solid #333';
        keyEl.style.borderRadius = '0 0 5px 5px';
        keyEl.style.display = 'flex';
        keyEl.style.justifyContent = 'center';
        keyEl.style.alignItems = 'flex-end';
        keyEl.style.paddingBottom = '10px';
        keyEl.style.cursor = 'default';
        keyEl.style.userSelect = 'none';
        // NO agregar ningún evento de click
        musicContainer.appendChild(keyEl);
    });

    function generateMelody() {
        currentMelody = [];
        for (let i = 0; i < 5; i++) {
            currentMelody.push(notes[Math.floor(Math.random() * notes.length)]);
        }
        melodyElement.textContent = currentMelody.join('-');
        userMelody = [];
        errorMsg.textContent = '';
    }
    function playNote(note) {
        const frequencies = {
            'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23,
            'G': 392.00, 'A': 440.00, 'B': 493.88
        };
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = frequencies[note];
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) {}
    }
    function checkMelody() {
        for (let i = 0; i < userMelody.length; i++) {
            if (userMelody[i] !== currentMelody[i]) {
                errorMsg.style.color = '#F20505';
                errorMsg.textContent = '¡Melodía incorrecta! Intenta de nuevo.';
                userMelody = [];
                return;
            }
        }
        errorMsg.textContent = '';
        if (userMelody.length === currentMelody.length) {
            correctNotes++;
            correctElement.textContent = correctNotes;
            Progress.updateBest('music', {melodies: correctNotes}, {melodies:'max'});
            userMelody = [];
            generateMelody();
            if (correctNotes >= 3) {
                errorMsg.style.color = 'var(--verde)';
                errorMsg.textContent = '¡Felicidades! Has completado 3 melodías correctamente.';
            }
        }
    }
    function musicKey(e) {
        const key = e.key.toLowerCase();
        const keyIndex = keys.indexOf(key);
        if (keyIndex !== -1) {
            const keyEl = document.querySelector(`.music-key[data-key="${keys[keyIndex]}"]`);
            if (keyEl) {
                keyEl.classList.add('active');
                playNote(notes[keyIndex]);
                userMelody.push(notes[keyIndex]);
                checkMelody();
                setTimeout(() => keyEl.classList.remove('active'), 200);
            }
        }
    }
    document.addEventListener('keydown', musicKey);

    document.getElementById('music-modal').addEventListener('click', function handler(ev) {
        if (ev.target.classList.contains('close-modal') || ev.target === this) {
            document.removeEventListener('keydown', musicKey);
            this.removeEventListener('click', handler);
        }
    });

    generateMelody();
}
    // 7. Identificación de Animales
    function setupAnimalsGame() {
        const animalImage = document.getElementById('animal-image');
        const animalInput = document.getElementById('animal-input');
        const animalSubmit = document.getElementById('animal-submit');
        const animalOptions = document.getElementById('animal-options');
        const scoreElement = document.getElementById('animals-score');
        const correctElement = document.getElementById('animals-correct');
        const animals = [
            { name: 'perro', image: 'https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313_640.jpg' },
            { name: 'gato', image: 'https://cdn.pixabay.com/photo/2017/02/20/18/03/cat-2083492_640.jpg' },
            { name: 'elefante', image: 'https://cdn.pixabay.com/photo/2016/11/14/04/45/elephant-1822636_640.jpg' },
            { name: 'leon', image: 'https://cdn.pixabay.com/photo/2017/10/25/16/54/african-lion-2888519_640.jpg' },
            { name: 'tigre', image: 'https://cdn.pixabay.com/photo/2017/07/24/19/57/tiger-2535888_640.jpg' },
            { name: 'jirafa', image: 'https://cdn.pixabay.com/photo/2017/04/11/21/34/giraffe-2222908_640.jpg' },
            { name: 'cebra', image: 'https://cdn.pixabay.com/photo/2017/01/14/12/59/zebra-1979305_640.jpg' },
            { name: 'mono', image: 'https://cdn.pixabay.com/photo/2017/09/25/13/12/dog-2785074_640.jpg' },
            { name: 'oso', image: 'https://cdn.pixabay.com/photo/2017/07/18/18/24/bear-2516599_640.jpg' },
            { name: 'pinguino', image: 'https://cdn.pixabay.com/photo/2016/11/22/21/36/animal-1850455_640.jpg' }
        ];
        let score = 0, correctAnswers = 0, currentAnimal = null, incorrectOptions = [];
        function showNewAnimal() {
            animalOptions.innerHTML = '';
            animalInput.value = '';
            currentAnimal = animals[Math.floor(Math.random() * animals.length)];
            animalImage.src = currentAnimal.image;
            animalImage.alt = currentAnimal.name;
            incorrectOptions = [];
            while (incorrectOptions.length < 3) {
                const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
                if (randomAnimal.name !== currentAnimal.name && !incorrectOptions.includes(randomAnimal.name)) {
                    incorrectOptions.push(randomAnimal.name);
                }
            }
            const allOptions = [currentAnimal.name, ...incorrectOptions].sort(() => Math.random() - 0.5);
            allOptions.forEach(option => {
                const button = document.createElement('button');
                button.className = 'animal-option';
                button.textContent = option;
                button.style.margin = '5px';
                button.style.padding = '10px 15px';
                button.style.backgroundColor = '#3498db';
                button.style.color = 'white';
                button.style.border = 'none';
                button.style.borderRadius = '5px';
                button.style.cursor = 'pointer';
                button.addEventListener('click', function() {
                    checkAnswer(option);
                });
                animalOptions.appendChild(button);
            });
        }
        function checkAnswer(answer) {
            if (answer.toLowerCase() === currentAnimal.name) {
                score += 10;
                correctAnswers++;
                scoreElement.textContent = score;
                correctElement.textContent = correctAnswers;
                Progress.updateBest('animals', {score, correct: correctAnswers}, {score:'max', correct:'max'});
                if (correctAnswers >= 10) {
                    alert(`¡Felicidades! Has identificado 10 animales correctamente. Puntuación final: ${score}`);
                    document.getElementById('animals-modal').style.display = 'none';
                    resetAllGames();
                } else {
                    showNewAnimal();
                }
            } else {
                alert(`Incorrecto. El animal es un ${currentAnimal.name}. Intenta con el próximo.`);
                showNewAnimal();
            }
        }
        animalSubmit.addEventListener('click', function() {
            if (animalInput.value.trim() !== '') {
                checkAnswer(animalInput.value.trim());
            }
        });
        animalInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && animalInput.value.trim() !== '') {
                checkAnswer(animalInput.value.trim());
            }
        });
        showNewAnimal();
    }
});

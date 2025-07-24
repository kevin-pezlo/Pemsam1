document.addEventListener('DOMContentLoaded', function() {
    // Variables globales necesarias
    const gameIntervals = {};
    const gameTimeouts = {};
    // Menú hamburguesa
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    hamburgerBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (this.classList.contains('active')) {
            this.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            this.children[1].style.opacity = '0';
            this.children[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            this.children[0].style.transform = 'rotate(0) translate(0)';
            this.children[1].style.opacity = '1';
            this.children[2].style.transform = 'rotate(0) translate(0)';
        }
    });
    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
            hamburgerBtn.children[0].style.transform = 'rotate(0) translate(0)';
            hamburgerBtn.children[1].style.opacity = '1';
            hamburgerBtn.children[2].style.transform = 'rotate(0) translate(0)';
        });
    });
    // Smooth scrolling para enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    // Botón JUGAR AHORA
    const playButton = document.querySelector('.play-button');
    playButton.addEventListener('click', function() {
        window.location.href = '#juegos';
    });
    // Modales de juegos
    const gameModals = {
        obstacle: document.getElementById('obstacle-modal'),
        aim: document.getElementById('aim-modal'),
        puzzle: document.getElementById('puzzle-modal'),
        tree: document.getElementById('tree-modal'),
        maze: document.getElementById('maze-modal'),
        music: document.getElementById('music-modal'),
        animals: document.getElementById('animals-modal')
    };
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.game-modal');
            modal.style.display = 'none';
            resetAllGames();
        });
    });
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('game-modal')) {
            e.target.style.display = 'none';
            resetAllGames();
        }
    });
    // Botones de juego
    const gameButtons = document.querySelectorAll('.play-game-btn');
    gameButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game');
            openGameModal(gameId);
        });
    });
    function openGameModal(gameId) {
    const modal = gameModals[gameId];
    if (!modal) {
        console.error(`Modal no encontrado para el juego: ${gameId}`);
        return;
    }
    resetAllGames();
    // Oculta todos los modales primero
    document.querySelectorAll('.game-modal').forEach(m => {
        m.style.display = 'none';
    });
    modal.style.display = 'flex';
    initializeGame(gameId);
    }
    function resetAllGames() {
    // Detener todos los juegos y reiniciar estados
    Object.values(gameIntervals).forEach(interval => clearInterval(interval));
    Object.values(gameTimeouts).forEach(timeout => clearTimeout(timeout));
    // Reiniciar puntuaciones de manera segura
    const elementsToReset = {
        'obstacle-score': '0',
        'obstacle-level': '1',
        'aim-score': '0',
        'aim-time': '30',
        'puzzle-time': '0',
        'puzzle-pieces': '0',
        'tree-score': '0',
        'tree-height': '0',
        'maze-attempts': '0',
        'maze-level': '1',
        'music-correct': '0',
        'animals-score': '0',
        'animals-correct': '0'
    };
    Object.entries(elementsToReset).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}
    // Inicializar juegos
    function initializeGame(gameId) {
        switch(gameId) {
            case 'obstacle':
                initObstacleGame();
                break;
            case 'aim':
                initAimGame();
                break;
            case 'puzzle':
                initPuzzleGame();
                break;
            case 'tree':
                initTreeGame();
                break;
            case 'maze':
                initMazeGame();
                break;
            case 'music':
                initMusicGame();
                break;
            case 'animals':
                initAnimalsGame();
                break;
        }
    }
    /* Juego 1: Carrera de Obstáculos */
    function initObstacleGame() {
        const gameContainer = document.getElementById('obstacle-game');
        const character = document.getElementById('obstacle-character');
        const scoreElement = document.getElementById('obstacle-score');
        const levelElement = document.getElementById('obstacle-level');
        let score = 0;
        let level = 1;
        let characterPosition = 50;
        let obstacles = [];
        let gameSpeed = 5;
        // Posición inicial del personaje
        character.style.left = `${characterPosition}px`;
        // Control del personaje con teclado
        document.addEventListener('keydown', function(e) {
            if (e.key.toLowerCase() === 'w' && characterPosition < gameContainer.offsetWidth - 50) {
                characterPosition += 20;
            } else if (e.key.toLowerCase() === 's' && characterPosition > 0) {
                characterPosition -= 20;
            }
            character.style.left = `${characterPosition}px`;
        });
        // Crear obstáculos
        gameIntervals.obstacle = setInterval(function() {
            // Crear nuevo obstáculo
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            obstacle.style.right = '-30px';
            obstacle.style.bottom = `${Math.random() * 100 + 20}px`;
            gameContainer.appendChild(obstacle);
            obstacles.push(obstacle);
            // Mover obstáculos
            obstacles.forEach((obstacle, index) => {
                const currentRight = parseInt(obstacle.style.right);
                const newRight = currentRight + gameSpeed;
                obstacle.style.right = `${newRight}px`;
                // Detectar colisión
                const obstacleRect = obstacle.getBoundingClientRect();
                const characterRect = character.getBoundingClientRect();
                if (
                    characterRect.left < obstacleRect.right &&
                    characterRect.right > obstacleRect.left &&
                    characterRect.top < obstacleRect.bottom &&
                    characterRect.bottom > obstacleRect.top
                ) {
                    // Colisión detectada
                    gameContainer.removeChild(obstacle);
                    obstacles.splice(index, 1);
                    alert(`¡Chocaste! Puntuación final: ${score}. Nivel alcanzado: ${level}`);
                    clearInterval(gameIntervals.obstacle);
                    return;
                }
                // Si el obstáculo sale de la pantalla
                if (newRight > gameContainer.offsetWidth) {
                    gameContainer.removeChild(obstacle);
                    obstacles.splice(index, 1);
                    score += 10;
                    scoreElement.textContent = score;
                    // Subir de nivel cada 100 puntos
                    if (score >= level * 100) {
                        level++;
                        levelElement.textContent = level;
                        gameSpeed += 2;
                    }
                }
            });
        }, 1000);
    }
    /* Juego 2: Puntería */
    function initAimGame() {
        const gameContainer = document.getElementById('aim-game');
        const scoreElement = document.getElementById('aim-score');
        const timeElement = document.getElementById('aim-time');
        const crosshair = document.getElementById('aim-crosshair');
        let score = 0;
        let timeLeft = 30;
        let targets = [];
        // Mostrar mira
        crosshair.style.display = 'block';
        crosshair.style.position = 'absolute';
        // Mover mira con el mouse
        gameContainer.addEventListener('mousemove', function(e) {
            const rect = gameContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - 10;
            const y = e.clientY - rect.top - 10;
            crosshair.style.left = `${x}px`;
            crosshair.style.top = `${y}px`;
        });
        // Crear objetivos
        function createTarget() {
            const target = document.createElement('div');
            target.className = 'target';
            target.style.left = `${Math.random() * (gameContainer.offsetWidth - 40)}px`;
            target.style.top = `${Math.random() * (gameContainer.offsetHeight - 40)}px`;
            // Tamaño aleatorio
            const size = Math.random() * 20 + 20;
            target.style.width = `${size}px`;
            target.style.height = `${size}px`;
            // Velocidad aleatoria
            const speedX = (Math.random() - 0.5) * 5;
            const speedY = (Math.random() - 0.5) * 5;
            gameContainer.appendChild(target);
            targets.push({ element: target, speedX, speedY });
            // Hacer objetivo clickeable
            target.addEventListener('click', function() {
                gameContainer.removeChild(target);
                targets = targets.filter(t => t.element !== target);
                score += 5;
                scoreElement.textContent = score;
            });
        }
        // Crear objetivos cada segundo
        gameIntervals.aim = setInterval(createTarget, 1000);
        // Mover objetivos
        gameIntervals.aimMove = setInterval(function() {
            targets.forEach(target => {
                const currentLeft = parseFloat(target.element.style.left);
                const currentTop = parseFloat(target.element.style.top);
                const newLeft = currentLeft + target.speedX;
                const newTop = currentTop + target.speedY;
                // Rebotar en los bordes
                if (newLeft <= 0 || newLeft >= gameContainer.offsetWidth - parseFloat(target.element.style.width)) {
                    target.speedX *= -1;
                }
                if (newTop <= 0 || newTop >= gameContainer.offsetHeight - parseFloat(target.element.style.height)) {
                    target.speedY *= -1;
                }
                target.element.style.left = `${newLeft}px`;
                target.element.style.top = `${newTop}px`;
            });
        }, 50);
        // Temporizador
        gameIntervals.aimTimer = setInterval(function() {
            timeLeft--;
            timeElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(gameIntervals.aim);
                clearInterval(gameIntervals.aimMove);
                clearInterval(gameIntervals.aimTimer);
                alert(`¡Tiempo terminado! Puntuación final: ${score}`);
            }
        }, 1000);
    }
    /* Juego 3: Rompecabezas */
    function initPuzzleGame() {
        const puzzleContainer = document.getElementById('puzzle-game');
        const timeElement = document.getElementById('puzzle-time');
        const piecesElement = document.getElementById('puzzle-pieces');
        let time = 0;
        let correctPieces = 0;
        const totalPieces = 16;
        const pieceSize = 50;
        const pieces = [];
        // Crear piezas del rompecabezas
        for (let i = 0; i < totalPieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.textContent = i + 1;
            piece.setAttribute('draggable', 'true');
            piece.dataset.correctPosition = i;
            // Posición aleatoria inicial
            piece.style.left = `${Math.random() * (puzzleContainer.offsetWidth - pieceSize)}px`;
            piece.style.top = `${Math.random() * (puzzleContainer.offsetHeight - pieceSize)}px`;
            piece.style.position = 'absolute';
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;
            piece.style.border = '1px solid #333';
            piece.style.backgroundColor = '#f0f0f0';
            piece.style.display = 'flex';
            piece.style.justifyContent = 'center';
            piece.style.alignItems = 'center';
            piece.style.cursor = 'move';
            puzzleContainer.appendChild(piece);
            pieces.push(piece);
            // Eventos de arrastre
            piece.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.dataset.correctPosition);
                setTimeout(() => this.style.opacity = '0.5', 0);
            });
            piece.addEventListener('dragend', function() {
                this.style.opacity = '1';
            });
        }
        // Permitir soltar piezas
        puzzleContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        puzzleContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            const pieceIndex = e.dataTransfer.getData('text/plain');
            const piece = pieces.find(p => p.dataset.correctPosition === pieceIndex);
            if (piece) {
                // Calcular la posición correcta basada en el índice
                const col = pieceIndex % 4;
                const row = Math.floor(pieceIndex / 4);
                const correctLeft = col * pieceSize;
                const correctTop = row * pieceSize;
                // Obtener posición donde se soltó
                const rect = puzzleContainer.getBoundingClientRect();
                const dropX = e.clientX - rect.left - pieceSize / 2;
                const dropY = e.clientY - rect.top - pieceSize / 2;
                // Verificar si está cerca de la posición correcta
                if (
                    Math.abs(dropX - correctLeft) < 20 &&
                    Math.abs(dropY - correctTop) < 20
                ) {
                    // Colocar en posición correcta
                    piece.style.left = `${correctLeft}px`;
                    piece.style.top = `${correctTop}px`;
                    piece.style.backgroundColor = '#2f2152';
                    piece.style.color = 'white';
                    piece.setAttribute('draggable', 'false');
                    correctPieces++;
                    piecesElement.textContent = correctPieces;
                    // Verificar si se completó
                    if (correctPieces === totalPieces) {
                        clearInterval(gameIntervals.puzzle);
                        alert(`¡Rompecabezas completado en ${time} segundos!`);
                    }
                } else {
                    // Mover a donde se soltó
                    piece.style.left = `${dropX}px`;
                    piece.style.top = `${dropY}px`;
                }
            }
        });
        // Temporizador
        gameIntervals.puzzle = setInterval(function() {
            time++;
            timeElement.textContent = time;
        }, 1000);
    }
    /* Juego 4: Ascenso al Árbol */
    function initTreeGame() {
        const gameContainer = document.getElementById('tree-climb-game');
        const tree = document.getElementById('tree');
        const climber = document.getElementById('climber');
        const scoreElement = document.getElementById('tree-score');
        const heightElement = document.getElementById('tree-height');
        let score = 0;
        let height = 0;
        let climberPosition = 20;
        let branches = [];
        let gameSpeed = 2;
       
        // Asegurarse de que el árbol esté posicionado correctamente
        setTimeout(() => {
            // Posición inicial del escalador
            climber.style.bottom = `${climberPosition}px`;
            // Control del escalador con teclado
            document.addEventListener('keydown', function(e) {
                if (e.key.toLowerCase() === 'w' && climberPosition < gameContainer.offsetHeight - 50) {
                    climberPosition += 10;
                    height += 0.1;
                    heightElement.textContent = height.toFixed(1);
                    // Puntuar cada metro
                    if (height % 1 < 0.1) {
                        score += 1;
                        scoreElement.textContent = score;
                    }
                } else if (e.key.toLowerCase() === 's' && climberPosition > 20) {
                    climberPosition -= 5;
                    height -= 0.05;
                    heightElement.textContent = height.toFixed(1);
                }
                climber.style.bottom = `${climberPosition}px`;
            });
            // Crear ramas
            gameIntervals.tree = setInterval(function() {
                // Crear nueva rama
                const branch = document.createElement('div');
                branch.className = 'branch';
                const branchWidth = Math.random() * 100 + 50;
                branch.style.width = `${branchWidth}px`;
                branch.style.height = '10px';
                branch.style.backgroundColor = '#8B4513';
                branch.style.position = 'absolute';
                branch.style.top = `${Math.random() * gameContainer.offsetHeight}px`;
                // Posición aleatoria a la izquierda o derecha del árbol
                if (Math.random() > 0.5) {
                    branch.style.left = `${tree.offsetLeft - branchWidth}px`;
                } else {
                    branch.style.left = `${tree.offsetLeft + tree.offsetWidth}px`;
                }
                gameContainer.appendChild(branch);
                branches.push(branch);
                // Mover ramas hacia abajo
                branches.forEach((branch, index) => {
                    const currentTop = parseFloat(branch.style.top);
                    const newTop = currentTop + gameSpeed;
                    branch.style.top = `${newTop}px`;
                    // Detectar colisión
                    const branchRect = branch.getBoundingClientRect();
                    const climberRect = climber.getBoundingClientRect();
                    if (
                        climberRect.left < branchRect.right &&
                        climberRect.right > branchRect.left &&
                        climberRect.top < branchRect.bottom &&
                        climberRect.bottom > branchRect.top
                    ) {
                        // Colisión detectada
                        gameContainer.removeChild(branch);
                        branches.splice(index, 1);
                        alert(`¡Golpeado por una rama! Puntuación final: ${score}. Altura alcanzada: ${height.toFixed(1)}m`);
                        clearInterval(gameIntervals.tree);
                        return;
                    }
                    // Si la rama sale de la pantalla
                    if (newTop > gameContainer.offsetHeight) {
                        gameContainer.removeChild(branch);
                        branches.splice(index, 1);
                    }
                });
                // Aumentar dificultad
                if (score > 0 && score % 5 === 0) {
                    gameSpeed += 0.5;
                }
            }, 1000);
        }, 100); // Pequeño retraso para asegurar que el DOM esté completamente cargado
    }
    /* Juego 5: Laberinto */
    function initMazeGame() {
        const mazeContainer = document.getElementById('maze');
        const player = document.getElementById('maze-player');
        const exit = document.getElementById('maze-exit');
        const attemptsElement = document.getElementById('maze-attempts');
        const levelElement = document.getElementById('maze-level');
        const optionsDiv = document.querySelector('.maze-options');
        const giveUpBtn = document.getElementById('maze-giveup');
        const continueBtn = document.getElementById('maze-continue');
        let attempts = 0;
        let level = 1;
        let walls = [];
        // Configurar laberinto según nivel
        function setupMaze() {
            // Limpiar laberinto anterior
            walls.forEach(wall => mazeContainer.removeChild(wall));
            walls = [];
            // Tamaño del laberinto
            const mazeWidth = mazeContainer.offsetWidth;
            const mazeHeight = mazeContainer.offsetHeight;
            // Posicionar jugador y salida
            player.style.left = '20px';
            player.style.top = '20px';
            exit.style.left = `${mazeWidth - 40}px`;
            exit.style.top = `${mazeHeight - 40}px`;
            // Crear paredes según nivel
            const wallCount = 5 + level * 3;
            for (let i = 0; i < wallCount; i++) {
                const wall = document.createElement('div');
                wall.className = 'maze-wall';
                // Paredes horizontales o verticales
                if (Math.random() > 0.5) {
                    // Horizontal
                    const width = Math.random() * 200 + 50;
                    const height = 10;
                    wall.style.width = `${width}px`;
                    wall.style.height = `${height}px`;
                    wall.style.left = `${Math.random() * (mazeWidth - width)}px`;
                    wall.style.top = `${Math.random() * mazeHeight}px`;
                } else {
                    // Vertical
                    const width = 10;
                    const height = Math.random() * 200 + 50;
                    wall.style.width = `${width}px`;
                    wall.style.height = `${height}px`;
                    wall.style.left = `${Math.random() * mazeWidth}px`;
                    wall.style.top = `${Math.random() * (mazeHeight - height)}px`;
                }
                wall.style.position = 'absolute';
                wall.style.backgroundColor = '#333';
                mazeContainer.appendChild(wall);
                walls.push(wall);
            }
            // Paredes externas
            const outerWalls = [
                { left: 0, top: 0, width: mazeWidth, height: 10 }, // Superior
                { left: 0, top: 0, width: 10, height: mazeHeight }, // Izquierda
                { left: mazeWidth - 10, top: 0, width: 10, height: mazeHeight }, // Derecha
                { left: 0, top: mazeHeight - 10, width: mazeWidth, height: 10 } // Inferior
            ];
            outerWalls.forEach(wallData => {
                const wall = document.createElement('div');
                wall.className = 'maze-wall';
                wall.style.left = `${wallData.left}px`;
                wall.style.top = `${wallData.top}px`;
                wall.style.width = `${wallData.width}px`;
                wall.style.height = `${wallData.height}px`;
                wall.style.position = 'absolute';
                wall.style.backgroundColor = '#333';
                mazeContainer.appendChild(wall);
                walls.push(wall);
            });
        }
        // Mover jugador con el mouse
        mazeContainer.addEventListener('mousemove', function(e) {
            const rect = mazeContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - player.offsetWidth / 2;
            const y = e.clientY - rect.top - player.offsetHeight / 2;
            player.style.left = `${x}px`;
            player.style.top = `${y}px`;
            // Detectar colisión con paredes
            const playerRect = player.getBoundingClientRect();
            for (const wall of walls) {
                const wallRect = wall.getBoundingClientRect();
                if (
                    playerRect.left < wallRect.right &&
                    playerRect.right > wallRect.left &&
                    playerRect.top < wallRect.bottom &&
                    playerRect.bottom > wallRect.top
                ) {
                    // Colisión detectada
                    attempts++;
                    attemptsElement.textContent = attempts;
                    optionsDiv.style.display = 'flex';
                    return;
                }
            }
            // Detectar si llegó a la salida
            const exitRect = exit.getBoundingClientRect();
            if (
                playerRect.left < exitRect.right &&
                playerRect.right > exitRect.left &&
                playerRect.top < exitRect.bottom &&
                playerRect.bottom > exitRect.top
            ) {
                // Nivel completado
                level++;
                levelElement.textContent = level;
                setupMaze();
            }
        });
        // Botones de opciones
        giveUpBtn.addEventListener('click', function() {
            document.getElementById('maze-modal').style.display = 'none';
            resetAllGames();
        });
        continueBtn.addEventListener('click', function() {
            optionsDiv.style.display = 'none';
            setupMaze();
        });
        // Configurar laberinto inicial
        setupMaze();
    }
    /* Juego 6: Teclado Musical */
    function initMusicGame() {
        const musicContainer = document.getElementById('music-game');
        const correctElement = document.getElementById('music-correct');
        const melodyElement = document.getElementById('music-melody');
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const keys = ['a', 's', 'd', 'f', 'g', 'h', 'j'];
        let correctNotes = 0;
        let currentMelody = [];
        let userMelody = [];
        // Limpiar contenedor
        musicContainer.innerHTML = '';
        // Crear teclas del piano
        keys.forEach((key, index) => {
            const keyElement = document.createElement('div');
            keyElement.className = `music-key ${index % 2 === 0 ? 'white' : 'black'}`;
            keyElement.textContent = notes[index];
            keyElement.dataset.note = notes[index];
            keyElement.dataset.key = key;
            keyElement.style.width = '60px';
            keyElement.style.height = '150px';
            keyElement.style.margin = '0 5px';
            keyElement.style.backgroundColor = index % 2 === 0 ? 'white' : 'black';
            keyElement.style.color = index % 2 === 0 ? 'black' : 'white';
            keyElement.style.border = '1px solid #333';
            keyElement.style.borderRadius = '0 0 5px 5px';
            keyElement.style.display = 'flex';
            keyElement.style.justifyContent = 'center';
            keyElement.style.alignItems = 'flex-end';
            keyElement.style.paddingBottom = '10px';
            keyElement.style.cursor = 'pointer';
            keyElement.style.userSelect = 'none';
            musicContainer.appendChild(keyElement);
            // Reproducir nota al hacer clic
            keyElement.addEventListener('click', function() {
                playNote(this.dataset.note);
                userMelody.push(this.dataset.note);
                checkMelody();
                this.classList.add('active');
                setTimeout(() => {
                    this.classList.remove('active');
                }, 200);
            });
        });
        // Reproducir nota con teclado
        document.addEventListener('keydown', function(e) {
            const keyIndex = keys.indexOf(e.key.toLowerCase());
            if (keyIndex !== -1) {
                const keyElement = document.querySelector(`.music-key[data-key="${keys[keyIndex]}"]`);
                if (keyElement) {
                    keyElement.classList.add('active');
                    playNote(notes[keyIndex]);
                    userMelody.push(notes[keyIndex]);
                    checkMelody();
                    setTimeout(() => {
                        keyElement.classList.remove('active');
                    }, 200);
                }
            }
        });
        // Generar melodía aleatoria
        function generateMelody() {
            currentMelody = [];
            for (let i = 0; i < 5; i++) {
                currentMelody.push(notes[Math.floor(Math.random() * notes.length)]);
            }
            melodyElement.textContent = currentMelody.join('-');
        }
        // Reproducir nota
        function playNote(note) {
            const frequencies = {
                'C': 261.63,
                'D': 293.66,
                'E': 329.63,
                'F': 349.23,
                'G': 392.00,
                'A': 440.00,
                'B': 493.88
            };
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.value = frequencies[note];
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
                console.log("No se pudo reproducir el sonido:", e);
            }
        }
        // Verificar melodía del usuario
        function checkMelody() {
            if (userMelody.length === currentMelody.length) {
                for (let i = 0; i < userMelody.length; i++) {
                    if (userMelody[i] !== currentMelody[i]) {
                        // Error en la melodía
                        userMelody = [];
                        alert('¡Melodía incorrecta! Intenta de nuevo.');
                        return;
                    }
                }
                // Melodía correcta
                correctNotes++;
                correctElement.textContent = correctNotes;
                userMelody = [];
                generateMelody();
                if (correctNotes >= 3) {
                    alert('¡Felicidades! Has completado 3 melodías correctamente.');
                }
            }
        }
        // Generar primera melodía
        generateMelody();
    }
    /* Juego 7: Identificación de Animales */
    function initAnimalsGame() {
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
        let score = 0;
        let correctAnswers = 0;
        let currentAnimal = null;
        let incorrectOptions = [];
        // Mostrar un nuevo animal
        function showNewAnimal() {
            // Limpiar opciones anteriores
            animalOptions.innerHTML = '';
            animalInput.value = '';
            // Seleccionar animal aleatorio
            currentAnimal = animals[Math.floor(Math.random() * animals.length)];
            animalImage.src = currentAnimal.image;
            animalImage.alt = currentAnimal.name;
            // Generar opciones incorrectas
            incorrectOptions = [];
            while (incorrectOptions.length < 3) {
                const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
                if (randomAnimal.name !== currentAnimal.name && !incorrectOptions.includes(randomAnimal.name)) {
                    incorrectOptions.push(randomAnimal.name);
                }
            }
            // Mezclar opciones
            const allOptions = [currentAnimal.name, ...incorrectOptions].sort(() => Math.random() - 0.5);
            // Crear botones de opciones
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
        // Verificar respuesta
        function checkAnswer(answer) {
            if (answer.toLowerCase() === currentAnimal.name) {
                // Respuesta correcta
                score += 10;
                correctAnswers++;
                scoreElement.textContent = score;
                correctElement.textContent = correctAnswers;
                if (correctAnswers >= 10) {
                    alert(`¡Felicidades! Has identificado 10 animales correctamente. Puntuación final: ${score}`);
                    document.getElementById('animals-modal').style.display = 'none';
                    resetAllGames();
                } else {
                    showNewAnimal();
                }
            } else {
                // Respuesta incorrecta
                alert(`Incorrecto. El animal es un ${currentAnimal.name}. Intenta con el próximo.`);
                showNewAnimal();
            }
        }
        // Enviar respuesta con input
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
        // Mostrar primer animal
        showNewAnimal();
    }
    // Efecto de ripple para botones
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('play-game-btn') ||
            e.target.classList.contains('newsletter-button') ||
            e.target.classList.contains('animal-option')) {
            const btn = e.target;
            const x = e.pageX - btn.getBoundingClientRect().left;
            const y = e.pageY - btn.getBoundingClientRect().top;
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple-effect');
            btn.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        }
    });
    // Animación de suscripción al newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('.newsletter-input');
        const button = this.querySelector('.newsletter-button');
        input.style.display = 'none';
        button.textContent = '¡Gracias por suscribirte!';
        button.style.backgroundColor = '#2f2152';
        setTimeout(() => {
            input.style.display = 'block';
            input.value = '';
            button.textContent = 'Suscribirse';
            button.style.backgroundColor = '#f7e259';
        }, 3000);
    });
});

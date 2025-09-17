// Sticky header, hide nav, show hamburger
(function(){
  const header = document.getElementById('main-header');
  const nav = document.getElementById('main-nav');
  const hamburger = document.getElementById('hamburger-menu');
  const dropdown = document.getElementById('dropdown-menu');
  if (!header || !nav || !hamburger || !dropdown) return;
  window.addEventListener('scroll', () => {
      if(window.scrollY > 50) {
          header.classList.add('sticky');
          nav.classList.add('hide');
          hamburger.classList.add('show');
      } else {
          header.classList.remove('sticky');
          nav.classList.remove('hide');
          hamburger.classList.remove('show');
          dropdown.classList.remove('show');
      }
  });
  hamburger.addEventListener('click', () => {
      dropdown.classList.toggle('show');
  });
})();

// Lanzador de juegos por iframe
(function(){
  const MAP = {
    obstacle: 'juegos/obstacle/index.html',
    aim: 'juegos/aim/index.html',
    puzzle: 'juegos/puzzle/puzzle.html',
    tree: 'juegos/tree/index.html',
    maze: 'juegos/maze/index.html',
    music: 'juegos/music/music.html',
    animals: 'juegos/animals/index.html',
    buscamina: 'juegos/buscaminas/index.html',
    pingpong: 'juegos/pingpong/index.html',
    colorear: 'juegos/colorear/index.html',
    colores: 'juegos/colores/index.html',
    memorama: 'juegos/memorama/index.html',
    dibujo: 'juegos/dibujo/index.html',
    snake: 'juegos/snake/index.html',
    LABERINTO: 'juegos/LABERINTO/index.html'
  };
  const modal = document.getElementById('game-frame-modal');
  const iframe = document.getElementById('game-iframe');
  const title = document.getElementById('game-frame-title');
  const bgm = document.getElementById('game-bgm');
  const bgmToggle = document.getElementById('bgm-toggle');
  if (!modal || !iframe) return;
  let bgmReady = false;
  function ensureBgm(){
    if (!bgm) return;
    if (!bgmReady) { bgm.muted = false; bgmReady = true; }
    bgm.play().catch(()=>{});
    if (bgmToggle) bgmToggle.textContent = bgm.muted ? '🔇' : '🔊';
  }
  function stopBgm(){ if (bgm) bgm.pause(); }
  if (bgmToggle) {
    bgmToggle.addEventListener('click', ()=>{
      if (!bgm) return;
      if (bgm.paused) { ensureBgm(); } else { bgm.pause(); }
      bgmToggle.textContent = (bgm.paused || bgm.muted) ? '🔇' : '🔊';
    });
  }
  function open(game){
    const url = MAP[game];
    if(!url || !modal || !iframe){ return; }
    if (title) {
      const t = document.querySelector(`[data-game="${game}"]`)?.closest('.game-card')?.querySelector('h3')?.textContent
          || document.querySelector(`.footer-column a[data-game="${game}"]`)?.textContent || 'Juego';
      title.textContent = t;
    }
    iframe.src = url;
    modal.style.display = 'flex';
    ensureBgm();
  }
  function close(){ if(!modal || !iframe) return; modal.style.display='none'; iframe.src=''; stopBgm(); }
  document.querySelectorAll('.play-game-btn, .footer-column ul li a[data-game]').forEach(el=>{
    el.addEventListener('click', function(e){ e.preventDefault(); open(el.getAttribute('data-game')); });
  });
  modal?.querySelector('.close-modal')?.addEventListener('click', close);
  modal?.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
})();

// Mascota asistente (Actividades)
(function(){
  const mascot = document.getElementById('site-mascot');
  if (!mascot) return;
  const bubble = mascot.querySelector('.mascot-text');
  const nextBtn = document.getElementById('mascot-next');
  const avatar = mascot.querySelector('.mascot-avatar');
  const tips = [
    'Carrera de Obstáculos: usa W y S para moverte sin chocar.',
    'Puntería: mueve el cursor y haz clic en los objetivos.',
    'Rompecabezas: arrastra las piezas hasta su lugar.',
    'Ascenso al Árbol: W para izquierda, O para derecha.',
    'Laberinto: evita tocar los muros y llega a la salida.',
    'Teclado Musical: toca C D E F G A B en el orden mostrado.',
    'Identificación de Animales: elige o escribe el nombre correcto.',
    'Colorear: elige una lámina y pinta las zonas “pintables”.',
    'Colores: toca el cuadrado que se ilumina para sumar puntos.',
    'Memorama: voltea cartas y encuentra todas las parejas.',
    'Dibujo libre: selecciona color y grosor del pincel.',
    'Busca Minas: descubre casillas evitando las minas.',
    'Ping Pong: devuelve la pelota para ganar puntos.',
    'Snake: usa las flechas para comer la comida y crecer.'
  ];
  let idx = 0;
  function show(i){ idx = (i + tips.length) % tips.length; bubble.textContent = tips[idx]; }
  let timer = setInterval(()=> show(idx+1), 12000);
  function resetTimer(){ clearInterval(timer); timer = setInterval(()=> show(idx+1), 12000); }
  nextBtn?.addEventListener('click', ()=> { show(idx+1); resetTimer(); });
  avatar?.addEventListener('click', ()=> { if (mascot.classList.contains('minimized')) mascot.classList.remove('minimized'); });
  // Drag handler
  let dragging=false, startX=0,startY=0,startRight=0,startBottom=0;
  avatar?.addEventListener('mousedown', (e)=> { dragging=true; mascot.style.transition='none'; startX=e.clientX; startY=e.clientY; const rect=mascot.getBoundingClientRect(); startRight = window.innerWidth - rect.right; startBottom = window.innerHeight - rect.bottom; document.body.style.userSelect='none'; });
  window.addEventListener('mousemove', (e)=> { if (!dragging) return; const dx = e.clientX - startX; const dy = e.clientY - startY; mascot.style.right = Math.max(8, startRight - dx) + 'px'; mascot.style.bottom = Math.max(8, startBottom - dy) + 'px'; });
  window.addEventListener('mouseup', ()=> { if (!dragging) return; dragging=false; mascot.style.transition=''; document.body.style.userSelect=''; });
})();

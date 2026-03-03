/**
 * Game Manager System
 * Gère le cycle de jeu, les NPCs, le scoring, et les vagues
 */

AFRAME.registerSystem('game-manager', {
  schema: {
    gameState: { type: 'string', default: 'menu' }, // 'menu', 'playing', 'gameOver'
    npcCount: { type: 'number', default: 0 },
    npcKilled: { type: 'number', default: 0 },
    bulletsFired: { type: 'number', default: 0 },
    currentWave: { type: 'number', default: 0 },
    gameDuration: { type: 'number', default: 300 } // 5 minutes
  },

  init: function () {
    this.gameState = 'menu';
    this.npcKilled = 0;
    this.bulletsFired = 0;
    this.currentWave = 0;
    this.npcCount = 0;
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.npcWaveSpawned = {};
    this.bestScore = 0; // meilleur score de la session
    
    // Référence aux mains pour détecter les tirs
    this.leftGun = null;
    this.rightGun = null;
    
    this.tick = this.tick.bind(this);
  },

  play: function () {
    this.el.addEventListener('tick', this.tick);
  },

  pause: function () {
    this.el.removeEventListener('tick', this.tick);
  },

  tick: function (evt) {
    const sys = this.el.systems['game-manager'];
    if (sys.gameState === 'playing') {
      sys.updateGameTime();
    }
  },

  startGame: function () {
    this.gameState = 'playing';
    this.npcKilled = 0;
    this.bulletsFired = 0;
    this.currentWave = 1;
    this.npcCount = 0;
    this.gameStartTime = Date.now();
    this.gameEndTime = null;
    this.npcWaveSpawned = {};
    
    // Masquer le menu
    const menuPanel = document.getElementById('game-menu-panel');
    if (menuPanel) {
      menuPanel.setAttribute('visible', 'false');
    }

    // Masquer le panneau best score au démarrage
    const bestScorePanel = document.getElementById('best-score-panel');
    if (bestScorePanel) bestScorePanel.setAttribute('visible', 'false');
    
    // Basculer les murs
    const menuWall = document.getElementById('menu-score-wall');
    const gameWall = document.getElementById('game-score-wall');
    if (menuWall) menuWall.setAttribute('visible', 'false');
    if (gameWall) gameWall.setAttribute('visible', 'true');
    
    // Afficher les lumières du jeu
    const gameLightTop = document.getElementById('game-light-top');
    const gameLightBottom = document.getElementById('game-light-bottom');
    const gameLightPoint = document.getElementById('game-light-point');
    if (gameLightTop) gameLightTop.setAttribute('visible', 'true');
    if (gameLightBottom) gameLightBottom.setAttribute('visible', 'true');
    if (gameLightPoint) gameLightPoint.setAttribute('visible', 'true');
    
    // Afficher le HUD
    this.showHUD();
    
    // Démarrer les vagues
    this.spawnWaveNpcs(1);
    
    this.el.emit('game-started', { timestamp: this.gameStartTime });
  },

  killPlayer: function () {
    if (this.gameState !== 'playing') return;

    // Arrêter la musique de jeu
    const gameMusic = document.getElementById('game-music');
    if (gameMusic) {
      gameMusic.pause();
      gameMusic.currentTime = 0;
    }

    // Nettoyer tous les NPCs et projectiles restants
    document.querySelectorAll('.game-npc').forEach(n => { if (n.parentElement) n.parentElement.removeChild(n); });
    document.querySelectorAll('.npc-projectile').forEach(p => { if (p.parentElement) p.parentElement.removeChild(p); });

    // Remettre l'état en menu
    this.gameState = 'menu';
    this.npcWaveSpawned = {};

    // Masquer le HUD et les éléments jeu
    const hud = document.getElementById('game-hud'); if (hud) hud.setAttribute('visible', 'false');
    const gameWall = document.getElementById('game-score-wall'); if (gameWall) gameWall.setAttribute('visible', 'false');
    const menuWall = document.getElementById('menu-score-wall'); if (menuWall) menuWall.setAttribute('visible', 'true');
    const gameLightTop = document.getElementById('game-light-top'); if (gameLightTop) gameLightTop.setAttribute('visible', 'false');
    const gameLightBottom = document.getElementById('game-light-bottom'); if (gameLightBottom) gameLightBottom.setAttribute('visible', 'false');
    const gameLightPoint = document.getElementById('game-light-point'); if (gameLightPoint) gameLightPoint.setAttribute('visible', 'false');

    // Réafficher le menu
    const menuPanel = document.getElementById('game-menu-panel'); if (menuPanel) menuPanel.setAttribute('visible', 'true');

    // Mettre à jour et afficher le best score
    if (this.npcKilled > this.bestScore) {
      this.bestScore = this.npcKilled;
    }
    const bestScorePanel = document.getElementById('best-score-panel');
    if (bestScorePanel) {
      bestScorePanel.setAttribute('visible', 'true');
      const bestScoreText = document.getElementById('best-score-text');
      if (bestScoreText) bestScoreText.setAttribute('text', `value: Best Score: ${this.bestScore} KILLS; color: #000000; align: center; anchor: center; width: 3.5; wrapCount: 30;`);
    }

    // Téléporter le joueur devant le panneau menu (position -7 0 -4 face au panneau)
    const rig = document.getElementById('camera-rig');
    if (rig) {
      rig.setAttribute('position', '-7 0 -1');
      rig.object3D.rotation.set(0, 0, 0);
    }

    this.el.emit('player-killed');
  },

  endGame: function () {
    this.gameState = 'gameOver';
    this.gameEndTime = Date.now();
    const duration = Math.floor((this.gameEndTime - this.gameStartTime) / 1000);
    
    // Basculer les murs
    const menuWall = document.getElementById('menu-score-wall');
    const gameWall = document.getElementById('game-score-wall');
    if (menuWall) menuWall.setAttribute('visible', 'true');
    if (gameWall) gameWall.setAttribute('visible', 'false');
    
    // Masquer les lumières du jeu
    const gameLightTop = document.getElementById('game-light-top');
    const gameLightBottom = document.getElementById('game-light-bottom');
    const gameLightPoint = document.getElementById('game-light-point');
    if (gameLightTop) gameLightTop.setAttribute('visible', 'false');
    if (gameLightBottom) gameLightBottom.setAttribute('visible', 'false');
    if (gameLightPoint) gameLightPoint.setAttribute('visible', 'false');
    
    // Afficher l'écran de fin
    this.showGameOverScreen(duration);
    
    this.el.emit('game-ended', {
      npcKilled: this.npcKilled,
      bulletsFired: this.bulletsFired,
      duration: duration
    });
  },

  updateGameTime: function () {
    if (!this.gameStartTime) return;
    const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const remaining = Math.max(0, this.data.gameDuration - elapsed);
    
    // Mettre à jour le timer
    const timerEl = document.getElementById('game-timer');
    if (timerEl) {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerEl.setAttribute('text', `value: ${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    
    // Fin du jeu
    if (remaining <= 0) {
      this.endGame();
    }
  },

  spawnWaveNpcs: function (waveNumber) {
    if (this.npcWaveSpawned[waveNumber]) return; // Éviter les doubles
    
    this.npcWaveSpawned[waveNumber] = true;
    const scene = this.el;
    // Vagues progressives: Vague 1: 2, Vague 2: 3, Vague 3: 4... jusqu'à 11 (wave 10)
    const npcCount = 1 + waveNumber; // 1+1=2, 1+2=3, 1+3=4, etc.
    const spawnDelayMs = Math.max(500, 2000 - (waveNumber * 200)); // Plus rapide à chaque vague
    
    for (let i = 0; i < npcCount; i++) {
      setTimeout(() => {
        // Positions aléatoires autour du joueur
        const angle = (Math.random() * Math.PI * 2);
        const distance = 8 + Math.random() * 5;
        const x = Math.cos(angle) * distance - 7;
        const z = Math.sin(angle) * distance;
        
        const npcEl = document.createElement('a-entity');
        npcEl.setAttribute('position', `${x} 0 ${z}`);
        npcEl.setAttribute('gltf-model', '#pnj');
        npcEl.setAttribute('animation-mixer', 'clip: walk; loop: repeat; timeScale: 0;');
        npcEl.setAttribute('sound', 'src: #gun-shot; on: npc-shoot; poolSize: 3;');
        npcEl.setAttribute('npc-enemy', 'hitboxRadius: 0.6; speed: 0.8; shootRate: 2000;');
        npcEl.setAttribute('data-npc-wave', waveNumber);
        npcEl.classList.add('game-npc');
        
        scene.appendChild(npcEl);
        this.npcCount++;
      }, i * 500); // Spawn espacé de 500ms
    }
  },

  registerNpcKilled: function () {
    this.npcKilled++;
    this.npcCount--;
    
    // Vérifier si on doit spawn la prochaine vague
    if (this.npcCount === 0) {
      this.currentWave++;
      // Son de passage de vague: émettre sur #game-sounds (sound component écoute sa propre entité)
      const soundsEl = document.getElementById('game-sounds');
      if (soundsEl) soundsEl.emit('wave-next');
      setTimeout(() => {
        if (this.gameState === 'playing') {
          this.spawnWaveNpcs(this.currentWave);
        }
      }, 2000);
    }
    
    // Mettre à jour le HUD
    this.updateHUD();
    this.el.emit('npc-killed', { total: this.npcKilled, wave: this.currentWave });
  },

  registerBulletFired: function () {
    this.bulletsFired++;
    this.updateHUD();
  },

  updateHUD: function () {
    const killsEl = document.getElementById('game-kills');
    const waveEl = document.getElementById('game-wave');
    const bulletsEl = document.getElementById('game-bullets');
    
    if (killsEl) killsEl.setAttribute('text', `value: KILLS: ${this.npcKilled}`);
    if (waveEl) waveEl.setAttribute('text', `value: WAVE: ${this.currentWave}`);
    if (bulletsEl) bulletsEl.setAttribute('text', `value: SHOTS: ${this.bulletsFired}`);
  },

  showHUD: function () {
    const hud = document.getElementById('game-hud');
    if (hud) {
      hud.setAttribute('visible', 'true');
    }
  },

  showGameOverScreen: function (duration) {
    // Masquer le HUD
    const hud = document.getElementById('game-hud');
    if (hud) hud.setAttribute('visible', 'false');
    
    // Afficher l'écran de fin
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      const accuracy = this.bulletsFired > 0 ? Math.round((this.npcKilled / this.bulletsFired) * 100) : 0;
      gameOverScreen.querySelector('[data-text="kills"]').setAttribute('text', 
        `value: NPCs ELIMINATED: ${this.npcKilled}`);
      gameOverScreen.querySelector('[data-text="bullets"]').setAttribute('text',
        `value: SHOTS FIRED: ${this.bulletsFired}`);
      gameOverScreen.querySelector('[data-text="accuracy"]').setAttribute('text',
        `value: ACCURACY: ${accuracy}%`);
      gameOverScreen.querySelector('[data-text="duration"]').setAttribute('text',
        `value: SURVIVAL TIME: ${Math.floor(duration / 60)}m ${duration % 60}s`);
      gameOverScreen.setAttribute('visible', 'true');
    }
  }
});

/**
 * Component pour les guns pour tracker les tirs
 */
AFRAME.registerComponent('gun-tracker', {
  init: function () {
    this.onShoot = this.onShoot.bind(this);
    this.el.addEventListener('shoot', this.onShoot);
  },

  onShoot: function () {
    const sys = this.el.sceneEl.systems['game-manager'];
    if (sys && sys.gameState === 'playing') {
      sys.registerBulletFired();
    }
  },

  remove: function () {
    this.el.removeEventListener('shoot', this.onShoot);
  }
});

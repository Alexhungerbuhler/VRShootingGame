/**
 * Game Start Button Component
 * Gère le clic sur le bouton de démarrage du jeu
 * Requiert que les 2 pistolets soient dans les 2 mains
 */

AFRAME.registerComponent('start-game-btn', {
  init: function () {
    this.onClick = this.onClick.bind(this);
    this.onHitByProjectile = this.onHitByProjectile.bind(this);
    this.el.addEventListener('click', this.onClick);
    this.el.addEventListener('hit-by-projectile', this.onHitByProjectile);
  },

  hasControllers: function () {
    // Vérifier que les 2 contrôleurs sont connectés et actifs
    const leftHand = document.querySelector('#hand-left');
    const rightHand = document.querySelector('#hand-right');
    
    if (!leftHand || !rightHand) return false;
    
    // Vérifier que les composants hand-controls sont actifs
    const leftHandControls = leftHand.components['hand-controls'];
    const rightHandControls = rightHand.components['hand-controls'];
    
    if (!leftHandControls || !rightHandControls) return false;
    
    // Vérifier que les contrôleurs sont connectés (object3D visible ou avec enfants)
    const leftHasModel = leftHand.object3D.children.length > 0;
    const rightHasModel = rightHand.object3D.children.length > 0;
    
    return leftHasModel && rightHasModel;
  },

  onHitByProjectile: function () {
    this.onClick();
  },

  onClick: function () {
    const scene = this.el.sceneEl;
    const gameManager = scene.systems['game-manager'];
    if (gameManager && gameManager.gameState === 'menu') {
      // Démarrer la musique de jeu directement
      const gameMusic = document.getElementById('game-music');
      if (gameMusic) {
        gameMusic.loop = true;
        gameMusic.volume = 0.5;
        gameMusic.currentTime = 0;
        gameMusic.play().catch(e => console.log('Musique non jouée:', e));
      }
      gameManager.startGame();
    }
  },

  remove: function () {
    this.el.removeEventListener('click', this.onClick);
    this.el.removeEventListener('hit-by-projectile', this.onHitByProjectile);
  }
});

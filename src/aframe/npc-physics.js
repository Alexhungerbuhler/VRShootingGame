/**
 * NPC Physics Component
 * Ajoute la physique et la détection de collision aux NPCs
 */

AFRAME.registerComponent('npc-physics', {
  schema: {
    radius: { type: 'number', default: 0.5 }
  },

  init: function () {
    // Ajouter la physique pour les collisions
    this.el.setAttribute('physx-body', 'type: kinematic; emitCollisionEvents: true;');
    this.el.setAttribute('obb-collider', '');
    
    // Écouter les collisions
    this.onCollision = this.onCollision.bind(this);
    this.el.addEventListener('contactbegin', this.onCollision);
    
    this.alive = true;
  },

  onCollision: function (evt) {
    if (!this.alive) return;
    
    const npcComponent = this.el.components['npc-physics'];
    if (!npcComponent) return;
    
    // Vérifier si c'est un projectile qui a touché
    const otherEl = evt.detail.body.el;
    
    if (otherEl && otherEl.classList.contains('projectile')) {
      // Le NPC a été touché par un projectile
      npcComponent.killNpc();
      
      // Notifier le game manager
      const gameManager = npcComponent.el.sceneEl.systems['game-manager'];
      if (gameManager) {
        gameManager.registerNpcKilled();
      }
      
      // Supprimer le projectile
      if (otherEl.parentElement) {
        otherEl.parentElement.removeChild(otherEl);
      }
    }
  },

  killNpc: function () {
    if (!this.alive) return;
    this.alive = false;
    
    // Animation de disparition (fade out)
    this.el.setAttribute('animation', 
      'property: opacity; to: 0; dur: 300; easing: easeOutQuad; fill: forwards;'
    );
    
    // Supprimer après la fin de l'animation
    setTimeout(() => {
      if (this.el.parentElement) {
        this.el.parentElement.removeChild(this.el);
      }
    }, 300);
  },

  remove: function () {
    this.el.removeEventListener('contactbegin', this.onCollision);
  }
});

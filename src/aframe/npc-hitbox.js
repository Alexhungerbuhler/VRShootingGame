/**
 * NPC Hitbox Component
 * Ajoute une hitbox à un NPC pour détecter les collisions avec les projectiles
 */

AFRAME.registerComponent('npc-hitbox', {
  schema: {
    radius: { type: 'number', default: 0.4 },
    visible: { type: 'boolean', default: false }
  },

  init: function () {
    // Créer une sphère invisible pour la hitbox
    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('radius', this.data.radius);
    sphere.setAttribute('class', 'npc-hitbox');
    if (!this.data.visible) {
      sphere.setAttribute('visible', 'false');
    }
    
    // Ajouter la physique pour les collisions
    sphere.setAttribute('physx-body', 'type: kinematic; emitCollisionEvents: true;');
    sphere.setAttribute('obb-collider', '');
    
    // Écouter les collisions
    this.onCollision = this.onCollision.bind(this);
    sphere.addEventListener('contactbegin', this.onCollision);
    
    this.el.appendChild(sphere);
    this.hitboxEl = sphere;
    this.alive = true;
  },

  onCollision: function (evt) {
    // Vérifier si c'est un projectile qui a touché
    const otherEl = evt.detail.body.el;
    
    if (otherEl && otherEl.classList.contains('projectile')) {
      // Le NPC a été touché par un projectile
      this.el.components['npc-hitbox'].killNpc();
      
      // Notifier le game manager
      const gameManager = this.el.sceneEl.systems['game-manager'];
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
    if (this.hitboxEl && this.hitboxEl.parentElement) {
      this.hitboxEl.removeEventListener('contactbegin', this.onCollision);
      this.hitboxEl.parentElement.removeChild(this.hitboxEl);
    }
  }
});

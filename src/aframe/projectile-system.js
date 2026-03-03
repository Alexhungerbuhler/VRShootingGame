/**
 * Projectile System
 * Créé des projectiles et les lance quand l'événement 'shoot' est déclenché
 */

AFRAME.registerComponent('projectile-shooter', {
  schema: {
    projectileSpeed: { type: 'number', default: 100 },
    projectileSize: { type: 'number', default: 0.1 },
    projectileColor: { type: 'string', default: '#ff0000' },
    projectileLife: { type: 'number', default: 10000 } // millisecondes
  },

  init: function () {
    this.onShoot = this.onShoot.bind(this);
    this.el.addEventListener('shoot', this.onShoot);
  },

  onShoot: function (evt) {
    // Récupérer la position et rotation du gun
    const gunPos = this.el.object3D.getWorldPosition(new THREE.Vector3());
    const gunQuat = this.el.object3D.getWorldQuaternion(new THREE.Quaternion());
    
    // Créer un vecteur de direction basé sur la rotation du gun
    // Par défaut, la direction est vers l'avant (0, 0, -1)
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(gunQuat).normalize();
    
    // Créer le laser bolt (cylindre orienté dans la direction du tir)
    const projectileEl = document.createElement('a-cylinder');
    projectileEl.setAttribute('radius', 0.04);
    projectileEl.setAttribute('height', 0.5);
    projectileEl.setAttribute('segments-radial', '8');
    projectileEl.setAttribute('material', `color: ${this.data.projectileColor}; emissive: ${this.data.projectileColor}; emissiveIntensity: 3.0; shader: flat;`);
    projectileEl.setAttribute('position', `${gunPos.x} ${gunPos.y} ${gunPos.z}`);
    projectileEl.setAttribute('class', 'projectile');

    // Orienter le cylindre (axe Y par défaut) dans la direction du tir
    // 'YXZ' correspond à l'ordre Euler interne d'A-Frame
    const up = new THREE.Vector3(0, 1, 0);
    const boltQuat = new THREE.Quaternion().setFromUnitVectors(up, direction);
    const boltEuler = new THREE.Euler().setFromQuaternion(boltQuat, 'YXZ');
    const rx = THREE.MathUtils.radToDeg(boltEuler.x);
    const ry = THREE.MathUtils.radToDeg(boltEuler.y);
    const rz = THREE.MathUtils.radToDeg(boltEuler.z);
    projectileEl.setAttribute('rotation', `${rx} ${ry} ${rz}`);
    
    // Appliquer la vélocité avec le composant projectile
    const velocity = direction.multiplyScalar(this.data.projectileSpeed);
    projectileEl.setAttribute('projectile', `speed: ${this.data.projectileSpeed}; velocityX: ${velocity.x}; velocityY: ${velocity.y}; velocityZ: ${velocity.z};`);
    
    // Ajouter au scene
    const scene = this.el.sceneEl;
    scene.appendChild(projectileEl);
    
    // Supprimer après le délai de vie
    setTimeout(() => {
      if (projectileEl.parentElement) {
        projectileEl.parentElement.removeChild(projectileEl);
      }
    }, this.data.projectileLife);
  },

  remove: function () {
    this.el.removeEventListener('shoot', this.onShoot);
  }
});

/**
 * Composant projectile pour gérer le mouvement de chaque projectile
 */
AFRAME.registerComponent('projectile', {
  schema: {
    speed: { type: 'number', default: 100 },
    velocityX: { type: 'number', default: 0 },
    velocityY: { type: 'number', default: 0 },
    velocityZ: { type: 'number', default: 0 }
  },

  init: function () {
    this.velocity = new THREE.Vector3(
      this.data.velocityX,
      this.data.velocityY,
      this.data.velocityZ
    );
    this._worldPos = new THREE.Vector3();
    this._btnPos = new THREE.Vector3();
    this._startBtn = document.querySelector('[start-game-btn]');
  },

  tick: function (time, deltaTime) {
    const deltaSeconds = deltaTime / 1000;
    const currentPos = this.el.object3D.position;
    
    currentPos.x += this.velocity.x * deltaSeconds;
    currentPos.y += this.velocity.y * deltaSeconds;
    currentPos.z += this.velocity.z * deltaSeconds;
    
    this.el.object3D.position.copy(currentPos);

    // Check proximity with start button
    if (this._startBtn) {
      this.el.object3D.getWorldPosition(this._worldPos);
      this._startBtn.object3D.getWorldPosition(this._btnPos);
      if (this._worldPos.distanceTo(this._btnPos) < 0.4) {
        this._startBtn.emit('hit-by-projectile');
        if (this.el.parentElement) this.el.parentElement.removeChild(this.el);
        return;
      }
    }
  }
});

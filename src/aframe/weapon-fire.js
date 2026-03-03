AFRAME.registerComponent('weapon-fire', {
  schema: {
    fireRate: { type: 'number', default: 500 }
  },

  init: function () {
    this.grabbedBy = null;
    this.triggerEl = null;
    this.firing = false;
    this.lastShotTime = 0;
    // Pre-allocated THREE.js objects to avoid GC
    this._gunPos = new THREE.Vector3();
    this._gunQuat = new THREE.Quaternion();
    this._direction = new THREE.Vector3();
    this._npcPos = new THREE.Vector3();
    this._toNpc = new THREE.Vector3();
    this._closestPoint = new THREE.Vector3();
    this.onGrab = this.onGrab.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onTriggerDown = this.onTriggerDown.bind(this);
    this.onTriggerUp = this.onTriggerUp.bind(this);

    this.el.addEventListener('grab', this.onGrab);
    this.el.addEventListener('drop', this.onDrop);
  },

  onGrab: function (evt) {
    // Always clean up any previous listener to prevent duplicates (guard against double-grab)
    if (this.triggerEl) {
      this.triggerEl.removeEventListener('triggerdown', this.onTriggerDown);
      this.triggerEl.removeEventListener('triggerup', this.onTriggerUp);
      this.triggerEl = null;
    }
    this.firing = false;

    this.grabbedBy = evt && evt.detail && evt.detail.hand;
    if (!this.grabbedBy) return;
    const parentEl = this.grabbedBy.parentEl;
    this.triggerEl = parentEl && parentEl.hasAttribute('hand-controls') ? parentEl : this.grabbedBy;
    this.triggerEl.addEventListener('triggerdown', this.onTriggerDown);
    this.triggerEl.addEventListener('triggerup', this.onTriggerUp);
    // Laser sight per gun: local -Z (scale 0.25 so -80 local = 20m world)
    this.el.setAttribute('line', 'start: 0 0 0; end: 0 0 -80; color: #ff4444; opacity: 0.6');
  },

  onDrop: function () {
    if (this.triggerEl) {
      this.triggerEl.removeEventListener('triggerdown', this.onTriggerDown);
      this.triggerEl.removeEventListener('triggerup', this.onTriggerUp);
      this.triggerEl = null;
    }
    this.grabbedBy = null;
    this.firing = false;
    this.el.removeAttribute('line');
  },

  onTriggerDown: function () { this.firing = true; },
  onTriggerUp: function () { this.firing = false; },

  tick: function () {
    if (!this.firing) return;
    const now = Date.now();
    if (now - this.lastShotTime < this.data.fireRate) return;
    this.lastShotTime = now;
    this.el.emit('shoot');
    this.raycastShoot();
  },

  // Perfect hitscan: ray-sphere intersection for each NPC
  // Each gun instance runs this independently => no shared state
  raycastShoot: function () {
    const gameManager = this.el.sceneEl.systems['game-manager'];
    if (!gameManager || gameManager.gameState !== 'playing') return;

    this.el.object3D.getWorldPosition(this._gunPos);
    this.el.object3D.getWorldQuaternion(this._gunQuat);
    this._direction.set(0, 0, -1).applyQuaternion(this._gunQuat).normalize();

    let closestNpc = null;
    let closestDist = Infinity;
    const HIT_RADIUS = 0.65; // ~largeur réelle du modèle NPC

    document.querySelectorAll('[npc-enemy]').forEach(npc => {
      const comp = npc.components['npc-enemy'];
      if (!comp || !comp.alive) return;
      npc.object3D.getWorldPosition(this._npcPos);
      this._npcPos.y += 0.9; // centre mi-corps (taille ~1.8m)

      this._toNpc.subVectors(this._npcPos, this._gunPos);
      const projection = this._toNpc.dot(this._direction);
      if (projection < 0) return; // behind gun

      this._closestPoint.copy(this._gunPos).addScaledVector(this._direction, projection);
      const dist = this._closestPoint.distanceTo(this._npcPos);

      if (dist < HIT_RADIUS && projection < closestDist) {
        closestDist = projection;
        closestNpc = npc;
      }
    });

    if (closestNpc) {
      const comp = closestNpc.components['npc-enemy'];
      if (comp && comp.alive) {
        comp.kill();
        gameManager.registerNpcKilled();
      }
    }
  },

  remove: function () {
    this.el.removeEventListener('grab', this.onGrab);
    this.el.removeEventListener('drop', this.onDrop);
    if (this.triggerEl) {
      this.triggerEl.removeEventListener('triggerdown', this.onTriggerDown);
      this.triggerEl.removeEventListener('triggerup', this.onTriggerUp);
    }
  }
});

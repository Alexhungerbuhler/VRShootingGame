AFRAME.registerComponent('gun-grip', {
  schema: {
    gripOffsetX: { type: 'number', default: 0 },
    gripOffsetY: { type: 'number', default: 0 },
    gripOffsetZ: { type: 'number', default: -0.1 },
    gripRotationX: { type: 'number', default: 0 },
    gripRotationY: { type: 'number', default: 0 },
    gripRotationZ: { type: 'number', default: 0 }
  },

  init: function () {
    this.onGrab = this.onGrab.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.originalRotation = this.el.getAttribute('rotation');
    this.originalPosition = this.el.getAttribute('position');
    this.isGrabbed = false;
    this.handControlsEl = null;
    this._hiddenMeshes = [];

    this.el.addEventListener('grab', this.onGrab);
    this.el.addEventListener('drop', this.onDrop);
  },

  onGrab: function (evt) {
    this.isGrabbed = true;
    const hand = evt.detail && evt.detail.hand;
    const parentEl = hand && hand.parentEl;
    if (parentEl && parentEl.hasAttribute('hand-controls')) {
      this.handControlsEl = parentEl;
      this._hiddenMeshes = [];
      // Traverse THREE.js hierarchy and hide only mesh nodes
      // This preserves child entity object3Ds (raycaster, cursor, etc.)
      this.handControlsEl.object3D.traverse(child => {
        if (child.isMesh && child.visible) {
          child.visible = false;
          this._hiddenMeshes.push(child);
        }
      });
    }
    this.el.setAttribute('rotation', {
      x: this.data.gripRotationX - 90,
      y: this.data.gripRotationY,
      z: this.data.gripRotationZ
    });
  },

  onDrop: function () {
    this.isGrabbed = false;
    this._hiddenMeshes.forEach(mesh => { mesh.visible = true; });
    this._hiddenMeshes = [];
    this.handControlsEl = null;
    this.el.setAttribute('rotation', this.originalRotation);
  },

  remove: function () {
    this.el.removeEventListener('grab', this.onGrab);
    this.el.removeEventListener('drop', this.onDrop);
  }
});

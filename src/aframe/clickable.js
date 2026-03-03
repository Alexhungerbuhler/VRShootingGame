AFRAME.registerComponent('clickable', {
  schema: {
    color: {type: 'color', default: 'black'},
    rotateOnHover: {type: 'boolean', default: false},
    rotationAxis: {type: 'string', default: 'y'},
    rotationSpeed: {type: 'number', default: 5},
    toggleVisible: {type: 'boolean', default: false}
  },

  init: function () {
    this.cursor = null;
    this.isHovered = false;
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.tick = this.tick.bind(this);
    this.el.addEventListener('mouseenter', this.onEnter);
    this.el.addEventListener('mouseleave', this.onLeave);
    // Store initial rotation to preserve it when rotating on hover
    this.initialRotation = this.el.getAttribute('rotation');
  },

  onEnter: function (evt) {
    this.cursor = evt.detail.cursorEl;
    this.isHovered = true;
    this.changeCursorColor(this.data.color, true);
    // Make element visible on hover if toggleVisible is enabled
    if (this.data.toggleVisible) {
      this.el.setAttribute('visible', true);
    }
  },

  onLeave: function (evt) {
    this.cursor = evt.detail.cursorEl;
    this.isHovered = false;
    this.changeCursorColor(this.savedColor);
    // Hide element when not hovering if toggleVisible is enabled
    if (this.data.toggleVisible) {
      this.el.setAttribute('visible', false);
    }
  },

  changeCursorColor: function (color, saveLast = false) {
    if (this.cursor.getAttribute('raycaster').showLine) {
      if (saveLast) this.savedColor = this.cursor.getAttribute('raycaster').lineColor;
      this.cursor.setAttribute('raycaster', 'lineColor', color);
    } else {
      if (this.cursor.getAttribute('material') === null) return;
      if (saveLast) this.savedColor = this.cursor.getAttribute('material').color;
      this.cursor.setAttribute('material', 'color', color);
    }
  },

  tick: function () {
    // Rotate element on hover if rotateOnHover is enabled
    if (this.data.rotateOnHover && this.isHovered) {
      const rotation = this.el.getAttribute('rotation');
      const speed = this.data.rotationSpeed;
      
      // Only modify the specified axis, preserve others from initial rotation
      let newRotation = {x: this.initialRotation.x, y: this.initialRotation.y, z: this.initialRotation.z};
      
      if (this.data.rotationAxis === 'x') newRotation.x = rotation.x + speed;
      else if (this.data.rotationAxis === 'y') newRotation.y = rotation.y + speed;
      else if (this.data.rotationAxis === 'z') newRotation.z = rotation.z + speed;
      
      this.el.setAttribute('rotation', newRotation);
    }
  },

  remove: function () {
    this.changeCursorColor(this.savedColor);
    this.el.removeEventListener('mouseenter', this.onEnter);
    this.el.removeEventListener('mouseleave', this.onLeave);
  },

});
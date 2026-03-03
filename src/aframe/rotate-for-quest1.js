AFRAME.registerComponent('rotate-for-quest1', {
  schema: {
    rotation: {type: 'vec3', default: {x: -80, y: 0, z: 0}}
  },

  init: function () {
    // if not a quest1 return
    const userAgent = window.navigator.userAgent;
    const isQuest1 = /Quest(?! \d)/i.test(userAgent);
    if (!isQuest1) {
      return
    }
    this.el.object3D.rotation.set(
      THREE.MathUtils.degToRad(this.data.rotation.x),
      THREE.MathUtils.degToRad(this.data.rotation.y),
      THREE.MathUtils.degToRad(this.data.rotation.z)
    );
  },

});
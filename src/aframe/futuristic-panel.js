/**
 * Futuristic Panel Component
 * Crée des panneaux futuristes style Halo avec lumières et néon
 */

AFRAME.registerComponent('futuristic-panel', {
  schema: {
    width: { type: 'number', default: 4 },
    height: { type: 'number', default: 2 },
    glowColor: { type: 'string', default: '#00ff88' },
    glowIntensity: { type: 'number', default: 2 },
    interactive: { type: 'boolean', default: false }
  },

  init: function () {
    const el = this.el;
    
    // Panneau principal avec glow
    el.setAttribute('material', `color: #001a00; emissive: ${this.data.glowColor}; emissiveIntensity: 0.5; metalness: 0.7; roughness: 0.3;`);
    el.setAttribute('geometry', `primitive: box; width: ${this.data.width}; height: ${this.data.height}; depth: 0.05;`);
    
    // Ajouter une bordure lumineuse
    const border = document.createElement('a-box');
    border.setAttribute('width', this.data.width + 0.05);
    border.setAttribute('height', this.data.height + 0.05);
    border.setAttribute('depth', 0.03);
    border.setAttribute('position', '0 0 -0.05');
    border.setAttribute('material', `color: transparent; emissive: ${this.data.glowColor}; emissiveIntensity: ${this.data.glowIntensity};`);
    el.appendChild(border);
    
    // Ajouter des lumières
    const lightLeft = document.createElement('a-light');
    lightLeft.setAttribute('type', 'spot');
    lightLeft.setAttribute('color', this.data.glowColor);
    lightLeft.setAttribute('intensity', '1.5');
    lightLeft.setAttribute('position', `-${this.data.width / 2} 0 0.5`);
    lightLeft.setAttribute('angle', '60');
    el.appendChild(lightLeft);
    
    const lightRight = document.createElement('a-light');
    lightRight.setAttribute('type', 'spot');
    lightRight.setAttribute('color', this.data.glowColor);
    lightRight.setAttribute('intensity', '1.5');
    lightRight.setAttribute('position', `${this.data.width / 2} 0 0.5`);
    lightRight.setAttribute('angle', '60');
    el.appendChild(lightRight);
    
    // Animation de pulsation
    el.setAttribute('animation', `property: material.emissiveIntensity; from: 0.3; to: 0.7; dur: 2000; easing: sinInOut; loop: true;`);
    
    if (this.data.interactive) {
      el.classList.add('interactive-panel');
    }
  }
});

/**
 * Hologram Text Component
 * Crée du texte holographique style Halo
 */
AFRAME.registerComponent('hologram-text', {
  schema: {
    text: { type: 'string', default: 'HOLO TEXT' },
    color: { type: 'string', default: '#00ff88' },
    glowIntensity: { type: 'number', default: 1.5 },
    size: { type: 'number', default: 1 }
  },

  init: function () {
    const el = this.el;
    
    // Texte avec glow
    el.setAttribute('text', `value: ${this.data.text}; color: ${this.data.color}; align: center; anchor: center; baseline: center; wrapCount: 20;`);
    
    // Ajouter une light derrière le texte
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('color', this.data.color);
    light.setAttribute('intensity', this.data.glowIntensity);
    light.setAttribute('distance', '10');
    light.setAttribute('position', '0 0 -0.5');
    el.appendChild(light);
    
    // Animation de flottement
    el.setAttribute('animation__float', `property: position; to: 0 0.1 0; dur: 3000; easing: sinInOut; direction: alternate; loop: true;`);
    
    // Animation de pulse sur l'opacité
    el.setAttribute('animation__pulse', `property: opacity; from: 0.8; to: 1; dur: 1500; easing: sinInOut; loop: true;`);
  }
});

/**
 * Neon Line Component
 * Crée des lignes néon
 */
AFRAME.registerComponent('neon-line', {
  schema: {
    color: { type: 'string', default: '#00ff88' },
    width: { type: 'number', default: 2 },
    length: { type: 'number', default: 5 }
  },

  init: function () {
    const el = this.el;
    
    // Créer une ligne avec cylinder
    el.setAttribute('geometry', `primitive: cylinder; radius: ${this.data.width / 1000}; height: ${this.data.length};`);
    el.setAttribute('material', `color: ${this.data.color}; emissive: ${this.data.color}; emissiveIntensity: 2;`);
    el.setAttribute('rotation', '90 0 0');
    
    // Ajouter light
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('color', this.data.color);
    light.setAttribute('intensity', '1.5');
    light.setAttribute('distance', '20');
    el.appendChild(light);
  }
});

import { randomHsl } from '../utils/color.js';

AFRAME.registerComponent('duplicate', {
  schema: {
    tileSize: { type: 'number', default: 1 },        // Taille de base de chaque tuile (width et height)
    tileDepth: { type: 'number', default: 1 },       // Profondeur (en dur ou paramétrable)
    rows: { type: 'number', default: 5 },            // Tuiles sur l'axe X
    cols: { type: 'number', default: 5 },            // Tuiles sur l'axe Z
    offset: { type: 'number', default: 0.035 },        // Espace entre tuiles sur X et Z

    // Variation de luminosité (HSL)
    baseColor: { type: 'color', default: "#FFF" }, // Couleur random
    lightMin: { type: 'number', default: 0.35 },      // Luminosité min (0..1)
    lightMax: { type: 'number', default: 0.70 },      // Luminosité max (0..1)
  },

  init: function () {
    const target = this.el;
    const basePosition = target.getAttribute('position') || { x: 0, y: 0, z: 0 };

    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const lMin = clamp01(this.data.lightMin);
    const lMax = clamp01(this.data.lightMax);
    const lo = Math.min(lMin, lMax);
    const hi = Math.max(lMin, lMax);

    // Convertit la couleur de base en HSL, puis ne fait varier que L.
    const hsl = { h: 0, s: 0, l: 0 };
    const base = new THREE.Color(this.data.baseColor);
    base.getHSL(hsl);

    const randomLightness = () => lo + Math.random() * (hi - lo);
    const colorWithLightness = () => {
      const h = Math.round(hsl.h * 360);
      const s = Math.round(hsl.s * 100);
      const l = Math.round(randomLightness() * 100);
      return `hsl(${h}, ${s}%, ${l}%)`;
    };

    // Applique aussi la couleur sur la tuile d'origine
    target.setAttribute('color', colorWithLightness());

    for (let ix = 0; ix < this.data.rows; ix++) {
      for (let iz = 0; iz < this.data.cols; iz++) {
        // On ignore le tout premier (i=0,j=0), qui est l'élément original
        if (ix === 0 && iz === 0) continue;

        const clone = target.cloneNode(true);
        clone.removeAttribute('duplicate');
        clone.setAttribute('position', {
          x: basePosition.x + ix * (this.data.tileSize + this.data.offset),
          y: basePosition.y,
          z: basePosition.z + iz * (this.data.tileSize + this.data.offset)
        });

        // Variation de luminosité (HSL) en gardant la même teinte
        //clone.setAttribute('color', colorWithLightness());

        // color random sans variation de la luminosité
        clone.setAttribute('color', randomHsl());
        target.parentNode.appendChild(clone);
      }
    }
  },

  remove: function () {
    // A remplir si besoin de nettoyage lors de la suppression du composant
  },
});
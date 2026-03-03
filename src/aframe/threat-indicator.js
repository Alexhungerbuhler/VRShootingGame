/**
 * Threat Indicator Component
 * Affiche des cônes directionnels dans le HUD VR pour indiquer d'où viennent les tirs ennemis.
 * À attacher sur l'entité #head (caméra VR) — les flèches bougent avec le regard.
 *
 * Rendu : THREE.ShaderMaterial avec dégradé per-vertex
 *   base du cône  → opaque  (alpha = 1)
 *   pointe du cône → transparent (alpha = 0)
 *
 * Écoute l'événement scène : 'npc-shot-incoming' avec detail.position ({x,y,z})
 */

const VERT = /* glsl */`
  varying float vGrad;
  uniform float uHeight;

  void main() {
    // ConeGeometry THREE.js : pointe en y = +height/2, base en y = -height/2
    // On veut : base opaque (1), pointe transparente (0)
    float halfH = uHeight * 0.5;
    vGrad = clamp((position.y + halfH) / uHeight, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */`
  varying float vGrad;
  uniform float uOpacity;

  void main() {
    float a = vGrad * uOpacity;
    if (a < 0.001) discard;
    // Rouge vif, surbrillance maximale (additive blending = effet glow)
    gl_FragColor = vec4(1.0, 0.05, 0.0, a);
  }
`;

AFRAME.registerComponent('threat-indicator', {
  schema: {
    radius:       { type: 'number', default: 0.50  }, // rayon du cercle HUD (mètres)
    yOffset:      { type: 'number', default: -0.22 }, // hauteur par rapport au regard
    numSegments:  { type: 'number', default: 8     }, // nombre de flèches
    fadeDuration: { type: 'number', default: 1800  }  // ms avant disparition
  },

  init: function () {
    // Pré-allocation pour éviter le GC en tick/event
    this._camWorldPos  = new THREE.Vector3();
    this._camWorldQuat = new THREE.Quaternion();
    this._camForward   = new THREE.Vector3();
    this._toNpc        = new THREE.Vector3();

    // Tableau de { mesh, mat, flashTime }
    this.segments = [];

    const CONE_HEIGHT = 0.16;
    const CONE_RADIUS = 0.048;

    for (let i = 0; i < this.data.numSegments; i++) {
      const angleDeg = i * (360 / this.data.numSegments);
      const angleRad = THREE.MathUtils.degToRad(angleDeg);

      // Cône triangulaire (3 faces radiales)
      const geo = new THREE.ConeGeometry(CONE_RADIUS, CONE_HEIGHT, 3);

      const mat = new THREE.ShaderMaterial({
        vertexShader:   VERT,
        fragmentShader: FRAG,
        uniforms: {
          uOpacity: { value: 0.0 },
          uHeight:  { value: CONE_HEIGHT }
        },
        transparent: true,
        side:        THREE.DoubleSide,
        depthWrite:  false,
        depthTest:   false,                   // jamais caché par la géométrie monde
        blending:    THREE.AdditiveBlending   // effet lumineux / glow
      });

      const mesh = new THREE.Mesh(geo, mat);

      // Position en cercle dans l'espace local de #head
      const x = Math.sin(angleRad) * this.data.radius;
      const z = -Math.cos(angleRad) * this.data.radius;
      mesh.position.set(x, this.data.yOffset, z);

      // Coucher le cône (−90° X) puis orienter la pointe vers l'extérieur (−angleDeg Y)
      mesh.rotation.order = 'YXZ';
      mesh.rotation.x = THREE.MathUtils.degToRad(-90);
      mesh.rotation.y = THREE.MathUtils.degToRad(-angleDeg);

      this.el.object3D.add(mesh);
      this.segments.push({ mesh, mat, flashTime: -Infinity });
    }

    this.onIncomingShot = this.onIncomingShot.bind(this);
    this.el.sceneEl.addEventListener('npc-shot-incoming', this.onIncomingShot);
  },

  // ─── Tick : anime le fondu via uniform ───────────────────────────────────────
  tick: function (time) {
    const dur = this.data.fadeDuration;
    for (let i = 0; i < this.segments.length; i++) {
      const s = this.segments[i];
      const elapsed = time - s.flashTime;
      if (elapsed >= dur) {
        if (s.mat.uniforms.uOpacity.value !== 0) {
          s.mat.uniforms.uOpacity.value = 0;
        }
      } else {
        s.mat.uniforms.uOpacity.value = 1.0 - elapsed / dur;
      }
    }
  },

  // ─── Événement : calcul de la direction ──────────────────────────────────────
  onIncomingShot: function (evt) {
    const p = evt.detail.position;

    this.el.object3D.getWorldPosition(this._camWorldPos);
    this.el.object3D.getWorldQuaternion(this._camWorldQuat);

    // Direction de regard projetée sur le plan horizontal
    this._camForward.set(0, 0, -1).applyQuaternion(this._camWorldQuat);
    this._camForward.y = 0;
    if (this._camForward.lengthSq() < 0.0001) return;
    this._camForward.normalize();

    // Direction joueur → NPC (plan horizontal)
    this._toNpc.set(
      p.x - this._camWorldPos.x,
      0,
      p.z - this._camWorldPos.z
    );
    if (this._toNpc.lengthSq() < 0.0001) return;
    this._toNpc.normalize();

    // Angle relatif NPC / regard (−PI … +PI)
    const camAngle = Math.atan2(this._camForward.x, -this._camForward.z);
    const npcAngle = Math.atan2(this._toNpc.x,      -this._toNpc.z);
    let relAngle = npcAngle - camAngle;
    while (relAngle >  Math.PI) relAngle -= 2 * Math.PI;
    while (relAngle < -Math.PI) relAngle += 2 * Math.PI;

    // Index de segment le plus proche
    const segAngle = (2 * Math.PI) / this.data.numSegments;
    let segIdx = Math.round(relAngle / segAngle) % this.data.numSegments;
    if (segIdx < 0) segIdx += this.data.numSegments;

    this._flash(segIdx, this.el.sceneEl.time);
  },

  _flash: function (idx, now) {
    const s = this.segments[idx];
    if (!s) return;
    s.flashTime = now;
    s.mat.uniforms.uOpacity.value = 1.0;
  },

  // ─── Nettoyage ────────────────────────────────────────────────────────────────
  remove: function () {
    this.el.sceneEl.removeEventListener('npc-shot-incoming', this.onIncomingShot);
    for (const s of this.segments) {
      this.el.object3D.remove(s.mesh);
      s.mesh.geometry.dispose();
      s.mat.dispose();
    }
    this.segments = [];
  }
});

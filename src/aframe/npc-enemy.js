/**
 * NPC Enemy Component
 * Gère les NPCs ennemis avec hitbox, mouvement, et tir des yeux
 */

AFRAME.registerComponent('npc-enemy', {
  schema: {
    hitboxRadius: { type: 'number', default: 1.0 },
    speed: { type: 'number', default: 0.1 }, // m/s
    shootRate: { type: 'number', default: 2000 }, // ms entre les tirs
    shootDistance: { type: 'number', default: 10 }, // distance max pour tirer
    eyeColor: { type: 'string', default: '#0000ff' }, // bleu par défaut
    shootEyeColor: { type: 'string', default: '#ff00ff' } // magenta quand il tire
  },

  init: function () {
    this.alive = true;
    // Décaler le premier tir aléatoirement entre 0 et shootRate pour éviter les tirs synchronisés
    this.lastShootTime = Date.now() + Math.random() * (this.data.shootRate || 3000);
    this.currentAnim = null;
    this.currentTimeScale = null;
    this.camera = document.querySelector('[camera]');
    
    // Position cible fixe
    this.targetPos = new THREE.Vector3(-7, 0, 0);
    
    // Animation de mouvement: marche 2sec, pause 5sec, répète
    this.movementCycleTime = 7000; // 7 secondes totales (2 marche + 5 pause)
    this.moveActiveDuration = 2000; // 2 secondes de marche
    this.startTime = Date.now();
    
    // Position cible fixe
    this.targetPos = new THREE.Vector3(-7, 0, 0);
    
    // Décaler le modèle vers le haut pour que le pivot soit à la tête
    // Chercher l'entité avec gltf-model et la décaler
    setTimeout(() => {
      const gltfModel = this.el.querySelector('[gltf-model]');
      if (gltfModel) {
        gltfModel.setAttribute('position', '0 -1 0'); // Décaler le modèle vers le bas
      }
      // Créer des yeux visuels qui changeront de couleur
      this.createEyes();
    }, 100);
    
    // Ajouter look-at pour regarder la caméra
    this.el.setAttribute('look-at', `target: ${this.camera ? '[camera]' : '0 0 0'}`);
    
    // Ajouter une entité pour la hitbox invisible
    this.hitboxEl = document.createElement('a-box');
    this.hitboxEl.setAttribute('position', '0 -1 0'); // Aligné avec le modèle décalé
    this.hitboxEl.setAttribute('width', '0.8'); // Largeur du corps
    this.hitboxEl.setAttribute('height', '2.0'); // Hauteur complète du NPC
    this.hitboxEl.setAttribute('depth', '0.6'); // Profondeur du corps
    this.hitboxEl.setAttribute('visible', 'false');
    this.hitboxEl.setAttribute('class', 'npc-hitbox clickable');
    this.el.appendChild(this.hitboxEl);
  },

  setAnimation: function (clipName, timeScale) {
    const ts = (timeScale !== undefined) ? timeScale : 1;
    // Si même clip ET même timeScale, ne rien faire
    if (this.currentAnim === clipName && this.currentTimeScale === ts) return;
    this.currentAnim = clipName;
    this.currentTimeScale = ts;
    this.el.setAttribute('animation-mixer', `clip: ${clipName}; loop: repeat; timeScale: ${ts};`);
  },

  createEyes: function () {
    // Créer deux yeux permanents qui changeront de couleur
    const leftEye = document.createElement('a-sphere');
    leftEye.setAttribute('radius', 0.06);
    leftEye.setAttribute('position', '-0.15 -0.7 0.3');
    leftEye.setAttribute('material', `color: ${this.data.eyeColor}; emissive: ${this.data.eyeColor}; emissiveIntensity: 0.5;`);
    leftEye.setAttribute('class', 'npc-eye-left');
    
    const rightEye = document.createElement('a-sphere');
    rightEye.setAttribute('radius', 0.06);
    rightEye.setAttribute('position', '0.15 -0.7 0.3');
    rightEye.setAttribute('material', `color: ${this.data.eyeColor}; emissive: ${this.data.eyeColor}; emissiveIntensity: 0.5;`);
    rightEye.setAttribute('class', 'npc-eye-right');
    
    this.el.appendChild(leftEye);
    this.el.appendChild(rightEye);
    
    this.leftEye = leftEye;
    this.rightEye = rightEye;
  },

  tick: function (time, deltaTime) {
    if (!this.alive || !this.camera) return;
    const gameManager = this.el.sceneEl.systems['game-manager'];
    if (!gameManager || gameManager.gameState !== 'playing') return;
    
    const deltaSeconds = deltaTime / 1000;
    const npcPos = this.el.object3D.position;
    const cameraPos = this.camera.object3D.position;
    
    // Position fixe pour la sécurité (les pieds du joueur)
    const playerFeetPos = new THREE.Vector3(-7, 0, 0);
    const playerHeadPos = cameraPos.clone(); // Tête du joueur
    
    const distanceToPlayer = npcPos.distanceTo(playerFeetPos);
    const securityZoneCenter = new THREE.Vector3(-7, 0, 0); // Zone de sécurité fixe en -7 0 0
    const distanceToSecurityZone = npcPos.distanceTo(securityZoneCenter);
    const SECURITY_ZONE = 3.0; // Zone de sécurité de 3 mètres
    
    // Calculer la position dans le cycle de mouvement
    const elapsed = Date.now() - this.startTime;
    const cycleProgress = elapsed % this.movementCycleTime;
    const isMoving = cycleProgress < this.moveActiveDuration; // 2 premières secondes = mouvement
    
    // 1. Mouvement alterné: 2sec marche, 5sec pause
    // MAIS: respecter la zone de sécurité autour du joueur en -7 0 0
    if (isMoving && distanceToSecurityZone > SECURITY_ZONE) {
      // Avancer vers les PIEDS du joueur (Y=0)
      const dirToFeet = playerFeetPos.clone().sub(npcPos);
      dirToFeet.y = 0; // Garder la hauteur du NPC
      dirToFeet.normalize();
      
      // Déplacement accéléré (puisque seulement 2sec sur 7)
      npcPos.x += dirToFeet.x * this.data.speed * 1.5 * deltaSeconds;
      npcPos.z += dirToFeet.z * this.data.speed * 1.5 * deltaSeconds;
      
      // Repousser si trop proche de la zone de sécurité
      if (npcPos.distanceTo(securityZoneCenter) < SECURITY_ZONE) {
        const pushDir = npcPos.clone().sub(securityZoneCenter).normalize();
        npcPos.x = securityZoneCenter.x + pushDir.x * SECURITY_ZONE;
        npcPos.z = securityZoneCenter.z + pushDir.z * SECURITY_ZONE;
      }
      
      // Animation de marche à 2x la vitesse de déplacement pour rester synchronisé
      this.setAnimation('walk', 2);
    } else {
      // Gelé sur la pose walk (timeScale 0) = ni T-pose ni restpos
      this.setAnimation('walk', 0);
    }
    
    // Tirer si le joueur est à portée
    if (distanceToPlayer < this.data.shootDistance) {
      const now = Date.now();
      if (now - this.lastShootTime >= this.data.shootRate) {
        this.lastShootTime = now;
        this.shootFromEyes();
      }
    }
  },

  shootFromEyes: function () {
    const npcPos = this.el.object3D.position;

    // Récupérer la vraie position monde du joueur (pas hardcodée)
    const rig = document.getElementById('camera-rig');
    const playerBase = new THREE.Vector3(-7, 0, 0);
    if (rig) rig.object3D.getWorldPosition(playerBase);

    // Choisir une partie du corps aléatoire à cibler (pieds, chevilles, genoux, hanches)
    const bodyParts = [0.05, 0.15, 0.3, 0.5];
    const targetHeight = bodyParts[Math.floor(Math.random() * bodyParts.length)];
    const targetPos = new THREE.Vector3(playerBase.x, targetHeight, playerBase.z);

    // Direction vers la partie du corps choisie
    const direction = targetPos.clone().sub(npcPos).normalize();

    // Créer un laser bolt (cylindre rouge orienté dans la direction du tir)
    const projectile = document.createElement('a-cylinder');
    projectile.setAttribute('radius', 0.05);
    projectile.setAttribute('height', 0.5);
    projectile.setAttribute('segments-radial', '8'); // léger pour perfs
    projectile.setAttribute('material', 'color: #ff0000; emissive: #ff0000; emissiveIntensity: 3.0; shader: flat;');

    // Orienter le cylindre (axe Y) dans la direction du tir - 'YXZ' = ordre A-Frame
    const up = new THREE.Vector3(0, 1, 0);
    const laserQuat = new THREE.Quaternion().setFromUnitVectors(up, direction);
    const laserEuler = new THREE.Euler().setFromQuaternion(laserQuat, 'YXZ');
    const rx = THREE.MathUtils.radToDeg(laserEuler.x);
    const ry = THREE.MathUtils.radToDeg(laserEuler.y);
    const rz = THREE.MathUtils.radToDeg(laserEuler.z);
    projectile.setAttribute('rotation', `${rx} ${ry} ${rz}`);

    // Spawner à hauteur genoux/hanches du NPC pour que le laser voyage visuellement bas
    const spawnHeight = 0.3 + Math.random() * 0.4; // 0.3–0.7m (genoux à hanches)
    const spawnPos = npcPos.clone().add(new THREE.Vector3(0, spawnHeight, 0.3));
    projectile.setAttribute('position', `${spawnPos.x} ${spawnPos.y} ${spawnPos.z}`);
    projectile.setAttribute('class', 'npc-projectile');

    // Ajouter au scene
    this.el.sceneEl.appendChild(projectile);

    // Vitesse 15 m/s
    const projectileSpeed = 15;
    const velocity = direction.clone().multiplyScalar(projectileSpeed);
    projectile.setAttribute('npc-projectile', `velocityX: ${velocity.x}; velocityY: ${velocity.y}; velocityZ: ${velocity.z};`);
    
    // Jouer le son du tir
    this.el.emit('npc-shoot');

    // Changer la couleur des yeux pendant le tir
    this.flashEyes();
    
    // Supprimer le projectile après 10 secondes
    setTimeout(() => {
      if (projectile.parentElement) {
        projectile.parentElement.removeChild(projectile);
      }
    }, 10000);
  },

  flashEyes: function () {
    // Changer la couleur des yeux en ROUGE au tir
    const shootColor = '#ff0000'; // Rouge
    
    if (this.leftEye) {
      this.leftEye.setAttribute('material', `color: ${shootColor}; emissive: ${shootColor}; emissiveIntensity: 3.0;`);
    }
    if (this.rightEye) {
      this.rightEye.setAttribute('material', `color: ${shootColor}; emissive: ${shootColor}; emissiveIntensity: 3.0;`);
    }
    
    // Revenir à la couleur normale après le flash (300ms)
    const originalColor = this.data.eyeColor;
    setTimeout(() => {
      if (this.alive && this.leftEye) {
        this.leftEye.setAttribute('material', `color: ${originalColor}; emissive: ${originalColor}; emissiveIntensity: 0.5;`);
      }
      if (this.alive && this.rightEye) {
        this.rightEye.setAttribute('material', `color: ${originalColor}; emissive: ${originalColor}; emissiveIntensity: 0.5;`);
      }
    }, 300);
  },

  kill: function () {
    if (!this.alive) return;
    this.alive = false;

    // Son de mort: émettre directement sur #game-sounds (le sound component écoute sur sa propre entité)
    this.el.emit('npc-death');
    const soundsEl = this.el.sceneEl.querySelector('#game-sounds');
    if (soundsEl) soundsEl.emit('npc-death-global');

    // Animation de disparition
    this.el.setAttribute('animation', 
      'property: opacity; to: 0; dur: 300; easing: easeOutQuad; fill: forwards;'
    );
    
    // Supprimer après l'animation
    setTimeout(() => {
      if (this.el.parentElement) {
        this.el.parentElement.removeChild(this.el);
      }
    }, 300);
  },

  remove: function () {
    if (this.hitboxEl && this.hitboxEl.parentElement) {
      this.hitboxEl.parentElement.removeChild(this.hitboxEl);
    }
  }
});

/**
 * NPC Projectile Component
 * Gère le mouvement des projectiles tirés par les NPCs
 */
AFRAME.registerComponent('npc-projectile', {
  schema: {
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
    // Protection zone: 3m radius centered at (-7, 0, 0)
    this._protCenter = new THREE.Vector3(-7, 0, 0);
    this.PROTECTION_RADIUS = 3.0;
    // Hitbox sur la TÊTE (position réelle du casque dans l'espace)
    // → se baisser ou se décaler physiquement permet d'esquiver
    this._head = document.getElementById('head');
    this._headPos = new THREE.Vector3();
  },

  tick: function (time, deltaTime) {
    const deltaSeconds = deltaTime / 1000;
    const pos = this.el.object3D.position;

    // Hitbox cylindrique centrée sur la tête (XZ) — s'étend des pieds à la tête
    // → bouger physiquement la tête déplace TOUT le cylindre
    if (this._head) {
      this._head.object3D.getWorldPosition(this._headPos);
      const dx = pos.x - this._headPos.x;
      const dz = pos.z - this._headPos.z;
      const horizDist = Math.sqrt(dx * dx + dz * dz);
      // Rayon 0.20m, hauteur : du sol (tête.y - 1.8m) jusqu'au sommet de la tête (tête.y + 0.15m)
      const footY = this._headPos.y - 1.8;
      if (horizDist < 0.20 && pos.y >= footY && pos.y <= this._headPos.y + 0.15) {
        const gm = this.el.sceneEl.systems['game-manager'];
        if (gm && gm.gameState === 'playing') gm.killPlayer();
        if (this.el.parentElement) this.el.parentElement.removeChild(this.el);
        return;
      }
    }

    // Slow down inside the protection circle (bullet-time effect for dodging)
    const dx = pos.x - this._protCenter.x;
    const dz = pos.z - this._protCenter.z;
    const distXZ = Math.sqrt(dx * dx + dz * dz);
    const isInZone = distXZ < this.PROTECTION_RADIUS;
    const speedFactor = isInZone ? 0.15 : 1.0; // 85% speed reduction inside zone

    pos.x += this.velocity.x * deltaSeconds * speedFactor;
    pos.y += this.velocity.y * deltaSeconds * speedFactor;
    pos.z += this.velocity.z * deltaSeconds * speedFactor;
  }
});

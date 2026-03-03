<script setup>
import { onMounted, ref } from 'vue';
import '../aframe/clickable.js';
import '../aframe/bloom.js';
import '../aframe/simple-grab.js';
import '../aframe/look-at.js';
import '../aframe/weapon-fire.js';
import '../aframe/projectile-system.js';
import '../aframe/gun-grip.js';
import '../aframe/npc-enemy.js';
import '../aframe/game-manager.js';
import '../aframe/futuristic-panel.js';
import '../aframe/start-game-btn.js';

import TheCameraRig from './TheCameraRig.vue';

const allAssetsLoaded = ref(false);

onMounted(() => {
  // Vérifier que le game manager est initialisé
  setTimeout(() => {
    const scene = document.querySelector('a-scene');
    if (scene && scene.systems['game-manager']) {
      console.log('Game Manager initialized');
    }
  }, 1000);
})

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@700&display=swap');
</style>

<template>
  <a-scene background="color: #0a0e27" simple-grab="allowMidAirDrop: false" game-manager>

    <a-assets @loaded="allAssetsLoaded = true">
      <img id="sky-texture" :src="`assets/citrus_orchard_road_puresky.jpg`">
      <a-asset-item id="room" src="assets/vr_exhibition_gallery_baked_gltf/scene.gltf"></a-asset-item>
      <a-asset-item id="table" src="assets/simple_modern_table.glb"></a-asset-item>
      <!-- Assets spécifiques au CameraRig -->
      <a-asset-item id="hand-weapon" src="assets/heavy_plasma_gun_kurtz_x1.glb"></a-asset-item>
      <a-asset-item id="pnj" src="assets/low_poly_humanoid_robot.glb"></a-asset-item>
      <audio id="gun-shot" src="assets/gun-shoot.mp3" preload="auto"></audio>
      <audio id="npc-death-sound" src="assets/sound1.mp3" preload="auto"></audio>
      <audio id="wave-sound" src="assets/victoire.mp3" preload="auto"></audio>
      <audio id="game-music" src="assets/walking.mp3" preload="auto"></audio>
      <!-- Police Exo 2 Bold native A-Frame (format MSDF requis, pas woff) -->
      <a-mixin id="exo-font" text="font: exo2bold;"></a-mixin>
    </a-assets>

    <template v-if="allAssetsLoaded">
      <!-- === ÉCLAIRAGE GLOBAL SCI-FI === -->
      <a-light type="ambient" color="#ffffff" intensity="0.7"></a-light>
      <a-light type="directional" color="#ffffff" intensity="0.8" position="5 10 5"></a-light>
      <a-light type="directional" color="#ffffff" intensity="0.6" position="-10 8 -10"></a-light>

      <!-- Sons globaux de jeu (NPC mort + vague suivante) -->
      <a-entity
        id="game-sounds"
        sound__death="src: #npc-death-sound; on: npc-death-global; poolSize: 5;"
        sound__wave="src: #wave-sound; on: wave-next; poolSize: 2;">
      </a-entity>
      
      <a-entity gltf-model="#room" position="-20 0 0" rotation="0 0 0" scale="0.7 0.7 0.7"></a-entity>

      <!-- GUNS with trackers -->
      <a-entity id="guns"
        gltf-model="#hand-weapon"
        position="-6.8 1 -1"
        rotation="45 0 90"
        scale="0.25 0.25 0.25"
        clickable
        simple-grab
        weapon-fire="fireRate: 500"
        projectile-shooter="projectileSpeed: 15; projectileSize: 0.08; projectileColor: #ff0000;"
        gun-grip="gripRotationX: -90; gripRotationY: 0; gripRotationZ: 0;"
        sound="src: #gun-shot; on: shoot; poolSize: 5; volume: 0.8;"
        gun-tracker
        obb-collider
        animation__push-on="property: position; to: 0 1 -3.9; dur: 1000; easing: easeOutQuad; startEvents: push-on;"
        animation__push-off="property: position; to: 0 1 -3.8; dur: 1000; easing: easeOutQuad; startEvents: push-off;">
      </a-entity>

      <!-- Second gun for other hand -->
      <a-entity id="guns-left"
        gltf-model="#hand-weapon"
        position="-7.2 1 -1"
        rotation="45 0 -90"
        scale="0.25 0.25 0.25"
        clickable
        simple-grab
        weapon-fire="fireRate: 500"
        projectile-shooter="projectileSpeed: 15; projectileSize: 0.08; projectileColor: #ff0000;"
        gun-grip="gripRotationX: -90; gripRotationY: 0; gripRotationZ: 0;"
        sound="src: #gun-shot; on: shoot; poolSize: 5; volume: 0.8;"
        gun-tracker
        obb-collider
        animation__push-on="property: position; to: 0 1 -3.9; dur: 1000; easing: easeOutQuad; startEvents: push-on;"
        animation__push-off="property: position; to: 0 1 -3.8; dur: 1000; easing: easeOutQuad; startEvents: push-off;">
      </a-entity>

      <!-- SECURITY ZONE VISUALIZATION (3m radius circle outline) -->
      <a-torus
        position="-7 -0.1 0"
        radius="3"
        radius-tubular="0.1"
        material="color: #FFFFFF;"
        rotation="90 0 0">
      </a-torus>

      <!-- FUTURISTIC MENU PANEL -->
      <a-entity id="game-menu-panel" position="-7 3 -3" rotation="0 0 0">
     
        <!-- Fond blanc -->
        <a-box
          position="0 0 -0.08"
          width="4.1"
          height="2.6"
          depth="0.05"
          material="color: #e8e8e8; emissive: #f0f0f0; emissiveIntensity: 1.2; metalness: 0.3; roughness: 0.1;">
        </a-box>
        
        <!-- Title -->
        <a-text mixin="exo-font" text="value: SUPER SHOOTER VR; color: #ff0000; align: center; anchor: center; width: 3.5; wrapCount: 20;" position="0 0.9 0.01" scale="1 1 1"></a-text>

        <!-- Instructions -->
        <a-text
          mixin="exo-font"
          text="value: GRAB both guns — one in each hand.
              SHOOT the robots that spawn in waves.
              STAY inside the white circle — you are protected!
              KILL faster = score multiplier increases (x1 to x5).
              If a laser HITS you, the game ends.
              Survive as long as possible and beat your best score!; 
          color: #000000; 
          lineHeight: 40;
          align: left; 
          anchor: center; 
          width: 3.6; 
          wrapCount: 50;" 
          position="0.27 0.13 0.01" 
          scale="1 1 1">
        </a-text>

        <a-text
          mixin="exo-font"
          text="value: ► Shoot the START GAME button to begin!; 
          color: #ff0000; 
          align: center; 
          anchor: center; 
          width: 1.5; 
          wrapCount: 40;" 
          position="0 -0.95 0.01" 
          scale="1 1 1">
        </a-text>

        <!-- Start button -->
        <a-entity
          id="start-game-button"
          position="0 -0.7 -0.01"
          width="2" 
          height="0.4"
          material="emissive: #FF0000; emissiveIntensity: 2;"
          geometry="primitive: box; width: 2; height: 0.4; depth: 0.05;"
          clickable
          start-game-btn
          physx-body="type: kinematic; emitCollisionEvents: true;"
          obb-collider
          animation__hover="property: material.emissiveIntensity; to: 2; dur: 100; startEvents: mouseenter;"
          animation__unhover="property: material.emissiveIntensity; to: 0.5; dur: 100; startEvents: mouseleave;">
          <a-text mixin="exo-font" text="value: START GAME; color: #000000; align: center; anchor: center;" position="0 0 0.08" scale="0.5 0.5 0.5"></a-text>
        </a-entity>

        <!-- Lights around panel -->
        <a-light type="spot" color="#ffffff" intensity="2.5" position="-0.5 3.5 3.7" angle="180"></a-light>
        <a-light type="point" color="#ffffff" intensity="1.8" distance="8" position="0 0 2"></a-light>
      </a-entity>

      <!-- Best Score panel — caché jusqu'à la première défaite -->
      <a-entity id="best-score-panel" position="-7 1.35 -3" visible="false">
        <a-box
          position="0 0 -0.04"
          width="4.1"
          height="0.55"
          depth="0.05"
          material="color: #ffffff; emissive: #FFFFFF;">
        </a-box>
        <a-text
          id="best-score-text"
          mixin="exo-font"
          text="value: Best Score: 0 Kills; color: #000000; align: center; anchor: center; width: 2.5; wrapCount: 30;"
          position="0 0.04 0.01"
          scale="1 1 1">
        </a-text>
      </a-entity>

      <!-- Menu Score wall (Gray) - visible initially -->
      <a-box id="menu-score-wall" position="10 5.3 0" depth="0.1" height="11" width="31" rotation="0 90 0" material="color: #b5b5b5; emissive: #808080; emissiveIntensity: 0.2;" visible="true"></a-box>

      <!-- Game Score wall (White luminous screen) - hidden initially -->
      <a-box id="game-score-wall" position="10 5.3 0" depth="0.1" height="11" width="31" rotation="0 90 0" material="color: #e8e8e8; emissive: #f0f0f0; emissiveIntensity: 1.2; metalness: 0.3; roughness: 0.1;" visible="false"></a-box>
      <!-- Screen glow lights -->
      <a-light id="game-light-top" type="spot" color="#ffffff" intensity="2.5" position="10 8 5" angle="120" visible="false"></a-light>
      <a-light id="game-light-bottom" type="spot" color="#ffffff" intensity="2.5" position="10 2 5" angle="120" visible="false"></a-light>
      <a-light id="game-light-point" type="point" color="#ffffff" intensity="1.8" position="10 5.3 2" distance="20" visible="false"></a-light>

      <!-- HUD on white game wall (visible during game) -->
      <a-entity id="game-hud" visible="false" position="10 5.3 0.1" rotation="0 -90 0">
        <!-- Timer at top -->
        <a-text id="game-timer" mixin="exo-font" text="value: 5:00; color: #000000; align: center; anchor: center; width: 80;" position="-0.5 1 0.1" scale="1 1 1"></a-text>

        <!-- Kills -->
        <a-text 
          mixin="exo-font"
          id="game-kills"
          text="value: Kills: 0; color: #000000; align: center; anchor: center; width: 6;"
          position="-10 1.4 0.1"
          scale="5 5 5">
        </a-text>

        <!-- Wave -->
        <a-text 
          mixin="exo-font"
          id="game-wave"
          text="value: Waves: 1; color: #000000; align: center; anchor: center; width: 6;"
          position="-0.5 -1.5 0.1"
          scale="5 5 5">
        </a-text>

        <!-- Bullets -->
        <a-text 
          mixin="exo-font"
          id="game-bullets"
          text="value: Shots fired: 0; color: #000000; align: center; anchor: center; width: 6;"
          position="9.5 1.4 0.1"
          scale="5 5 5">
        </a-text>

        <!-- Accuracy -->
        <a-text 
          mixin="exo-font"
          id="game-accuracy"
          text="value: Accuracy: 0%; color: #000000; align: center; anchor: center; width: 6;"
          position="-10 -1 0.1"
          scale="5 5 5">
        </a-text>

        <!-- Wave Progress -->
        <a-text 
          mixin="exo-font"
          id="game-enemies"
          text="value: Enemies remaining: 0; color: #000000; align: center; anchor: center; width: 6;"
          position="-0.5 -3 0.1"
          scale="4 4 4">
        </a-text>

        <!-- Multiplier -->
        <a-text 
          mixin="exo-font"
          id="game-multiplier"
          text="value: x1.0; color: #000000; align: center; anchor: center; width: 6;"
          position="9 -1 0.1"
          scale="5 5 5">
        </a-text>

       </a-entity>

      <!-- GAME OVER SCREEN (hidden initially) -->
      <a-entity id="game-over-screen" visible="false" position="0 1.65 -2">
        <!-- Background -->
        <a-box 
          position="0 0 0"
          width="4" 
          height="3" 
          depth="0.1"
          material="color: #1a0000; emissive: #ff0088; emissiveIntensity: 0.3;">
        </a-box>

        <!-- Title -->
        <a-entity 
          mixin="exo-font"
          text="value: MISSION COMPLETE; color: #ff0088; align: center; wrapCount: 20; fontSize: 80;"
          position="0 1.1 0.1"
          scale="0.01 0.01 0.01">
        </a-entity>

        <!-- Stats -->
        <a-entity 
          mixin="exo-font"
          data-text="kills"
          text="value: NPCs ELIMINATED: 0; color: #ff0088; align: center; wrapCount: 20; fontSize: 50;"
          position="0 0.4 0.1"
          scale="0.01 0.01 0.01">
        </a-entity>

        <a-entity 
          mixin="exo-font"
          data-text="bullets"
          text="value: SHOTS FIRED: 0; color: #ff0088; align: center; wrapCount: 20; fontSize: 50;"
          position="0 0 0.1"
          scale="0.01 0.01 0.01">
        </a-entity>

        <a-entity 
          mixin="exo-font"
          data-text="accuracy"
          text="value: ACCURACY: 0%; color: #ff0088; align: center; wrapCount: 20; fontSize: 50;"
          position="0 -0.4 0.1"
          scale="0.01 0.01 0.01">
        </a-entity>

        <a-entity 
          mixin="exo-font"
          data-text="duration"
          text="value: SURVIVAL TIME: 0m 0s; color: #ff0088; align: center; wrapCount: 20; fontSize: 50;"
          position="0 -0.8 0.1"
          scale="0.01 0.01 0.01">
        </a-entity>

       </a-entity>

    </template>

    <TheCameraRig :allAssetsLoaded="allAssetsLoaded" />

  </a-scene>
</template>
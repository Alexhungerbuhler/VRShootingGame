<script setup>
  import '../aframe/disable-in-vr.js';
  import '../aframe/hide-in-vr.js';
  import '../aframe/simple-navmesh-constraint.js';
  import '../aframe/blink-controls.js';
  import '../aframe/physx-grab.js';
  import '../aframe/rotate-for-quest1.js';

  defineProps({
    allAssetsLoaded: Boolean,
  });
</script>

<template>
  <a-entity
    id="camera-rig"
    movement-controls="camera: #head;"
    disable-in-vr="component: movement-controls;"
    position="-7 0 0"
  >

      <a-entity
        id="head"
        look-controls="pointerLockEnabled: true"
        simple-navmesh-constraint="navmesh: [data-role='nav-mesh']; height: 1.65;"
        disable-in-vr="component: simple-navmesh-constraint;"
        camera
        position="0 1.65 0"
      >
        <a-entity
          geometry="primitive: circle; radius: 0.0003;"
          material="shader: flat; color: white;"
          cursor
          raycaster="far: 4; objects: [clickable]; showLine: false; direction: 0 0 -1;"
          position="0 0 -0.1"
          disable-in-vr="component: raycaster; disableInAR: false;"
          hide-in-vr="hideInAR: false"
        ></a-entity>
        <a-box
          id="dummy-hand-right"
          obb-collider
          position="0.3 -0.4 -0.5"
          visible="false"
        ></a-box>
        <a-entity
          id="dummy-hand-left"
          obb-collider
          position="-0.3 -0.4 -0.5"
          visible="false"
        ></a-entity>
      </a-entity>

      <a-entity
        hand-controls="hand: left"
        blink-controls="
          cameraRig: #camera-rig;
          teleportOrigin: #head;
          collisionEntities: [data-role='nav-mesh'];
          snapTurn: false;
        "
        position="-0.5 1.5 0"
        physx-grab
      >
      <a-entity id="raycaster-hand-left" cursor rotation="-90 0 0" raycaster="far: 4; objects: [clickable]; showLine: true; lineColor: #00ff00;"></a-entity>
        <a-sphere id="hand-left-collider"
          radius="0.02"
          visible="false"
          physx-body="type: kinematic; emitCollisionEvents: true">
        </a-sphere>
      </a-entity>

      <a-entity
        hand-controls="hand: right"
        position="0.5 1.5 0"
        physx-grab
      >
      <a-entity id="raycaster-hand-right" cursor rotation="-90 0 0" raycaster="far: 4; objects: [clickable]; showLine: true; lineColor: #00ff00;"></a-entity>
        <a-sphere id="hand-right-collider"
          radius="0.02"
          visible="false"
          physx-body="type: kinematic; emitCollisionEvents: true">
        </a-sphere>
      </a-entity>

  </a-entity>
</template>
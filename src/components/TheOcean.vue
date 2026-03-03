<script setup>
  import '../aframe/duplicate';
  import '../aframe/hex-grid';
</script>

<template>
  <a-entity>
    <a-ocean
      depth="100"
      width="100"
      amplitude="0"
      amplitude-variance="0.1"
      opacity="1"
      density="50"
    ></a-ocean>
    <!-- Sol hexagonal -->
    <a-hex-grid
      position="10 0.1 0"
      size="4"
      color="#FFF"
      cellsize="1"
      height="0.2"
    ></a-hex-grid>
    <a-box duplicate></a-box>
    <a-entity light="type: ambient; intensity: 2"; color="#1a1815"></a-entity>
    <a-entity light="type: point; intensity: 15"; color="#FFF" position="-80 12 -50"></a-entity>
   </a-entity>
</template>
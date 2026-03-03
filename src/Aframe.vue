<script setup>
  import { ref } from 'vue';
  import TheOnboarding from './components/TheOnboarding.vue';
  import TheScene from './components/TheScene.vue';

  const loaded = ref(false);
</script>

<template>
  <TheOnboarding :loaded="loaded" />

  <!-- The DOM element of the overlay must be mounted before the A-Frame Scene is mounted -->
  <!-- Otherwise the "webxr system" of the A-Frame scene wont find the DOM Element -->

  <TheScene
    @loaded="loaded = true"
  />
</template>
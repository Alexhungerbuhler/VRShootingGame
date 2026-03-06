<script setup>
  import { ref } from 'vue';

  defineProps({
    loaded: Boolean,
  });

  const showOnboarding = ref(true);

  function enterScene() {
    showOnboarding.value = false;
    if (AFRAME.utils.device.checkHeadsetConnected() && !AFRAME.utils.device.isMobile()) {
      document.querySelector('a-scene').enterVR();
    }
    document.querySelector('a-scene').emit('enter-scene');
  }
</script>

<template>
  <div id="onboarding" v-if="showOnboarding">
    <div>
      <h1>VR Shooting Game</h1>
      <p v-if="!loaded">loading...</p>
      <button v-if="loaded" @click="enterScene()">Enter scene</button>
      <div class="licences">
        <section>
          <h4>Movement modes support</h4>
          <ul>
            <li>
              Desktop – Keyboard for move (WASD or Arrows keys) + Mouse for look
              control (Drag and drop)
            </li>
          </ul>
        </section>
        <section>
          <h4>Source code</h4>
          <blockquote><a href="https://github.com/Alexhungerbuhler/VRShootingGame">Github repo</a></blockquote>
        </section>
        <dl>
          <dt>
            <i>Assets</i>
          </dt>
          <dt>
            <a href="https://www.fab.com/listings/f4559d15-b9a2-43c4-836a-5c417c04d10d" target="_blank">VR NPC Model</a>
          </dt><dd>
            by <a href="https://www.fab.com/sellers/Denys%20Almaral" target="_blank">Denys Almaral</a>
            under <a href="https://www.fab.com/eula" target="_blank">Standard License</a>
          </dd>

          <dt>
            <a href="https://www.fab.com/listings/251ea724-4602-4f36-80c3-5b27b92dabe0" target="_blank">HEAVY PLASMA GUN</a>
          </dt><dd>
            by <a href="https://www.fab.com/sellers/tekuto1s" target="_blank">tekuto1s</a>
            under <a href="https://www.fab.com/eula" target="_blank">FAB License</a>
          </dd>
          <dt>
            <a href="https://www.fab.com/listings/3922d2eb-efef-49a9-9017-ee510c6260b5" target="_blank">VR Gallery Room</a>
          </dt><dd>
            by <a href="https://www.fab.com/sellers/Christy%20Hsu" target="_blank">Christy Hsu</a>
            under <a href="https://www.fab.com/eula" target="_blank">FAB License</a>
          </dd>
          <dt>
            <a href="https://www.fab.com/listings/3922d2eb-efef-49a9-9017-ee510c6260b5" target="_blank">Music Techno</a>
          </dt><dd>
            <a href="https://pixabay.com/sound-effects/" target="_blank">by Ahmed Abdulaal from Pixabay</a>
          </dd>
           <dt>
            <a href="https://www.fab.com/listings/3922d2eb-efef-49a9-9017-ee510c6260b5" target="_blank">Sound Effects</a>
          </dt><dd>
            <a href="https://pixabay.com/sound-effects/" target="_blank">by u_o8xh7gwsrj from Pixabay</a>
          </dd>
          <dt>
            <i>Included</i>
          </dt>
          <dt>
            <a href="https://github.com/c-frame/aframe-extras" target="_blank">aframe-extras</a>
          </dt><dd>
            <a href="https://github.com/c-frame/aframe-extras/blob/master/LICENSE" target="_blank">MIT License</a>
          </dd>

          <dt>
            <a href="https://github.com/c-frame/physx" target="_blank">aframe physx</a>
          </dt><dd>
            <a href="https://github.com/c-frame/aframe-extras/blob/master/LICENSE" target="_blank">MIT License</a>
          </dd>

          <dt>
            <a href="https://github.com/jure/aframe-blink-controls/" target="_blank">aframe-blink-controls</a>
          </dt><dd>
            <a href="https://github.com/jure/aframe-blink-controls/blob/main/LICENSE" target="_blank">MIT License</a>
          </dd>

          <dt>
            <a href="https://github.com/diarmidmackenzie/aframe-multi-camera/" target="_blank">aframe-multi-camera</a>
          </dt><dd>
            <a href="https://github.com/diarmidmackenzie/aframe-multi-camera/blob/main/LICENSE" target="_blank">MIT License</a>
          </dd>

          <dt>
            <a href=" https://github.com/AdaRoseCannon/aframe-xr-boilerplate" target="_blank">simple-navmesh-constraint</a>
          </dt><dd>
            By Ada Rose Cannon under MIT License
          </dd>

          </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
  h1 { font-size: 1.5rem }
  a {
    color: #eee;
    text-decoration: none;
  }
  .licences {
    margin: 2rem 0;
    padding-bottom: 1rem;
    font-size: 1rem;
    text-align: left;
  }
  .licences dt {
    padding-top: 0.75rem;
    font-size: 0.9rem;
    font-weight: bold;
  }
  .licences dd {
    margin-left: 0;
    font-size: 0.8rem;
  }

  #onboarding {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #333;
    color: #ccc;
    width: 100vw;
    height: 100vh;
    padding: 1rem;
    font-family: monospace;
    z-index: 10000;
    overflow: auto;
  }
  #onboarding > * {
    margin: 0 auto;
    max-width: 50rem;
    width: calc(100vw - 10rem);
    text-align: center;
    border-radius: 0.3rem;
    padding: 1rem;
    font-size: 1.3rem;
  }
  #onboarding button {
    font-size: 1.3rem;
    padding: 0.5rem 1rem;
    border-radius: 0.3rem;
    background-color: white;
    color: black;
    border: none;
    cursor: pointer;
  }
</style>#onboarding li {
#onboarding li {
  font-size: 1rem;
  text-align: left;
}

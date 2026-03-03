<template>
  <a-entity ref="npc" :position="posString" npc-hitbox="radius: 0.5;">
    <!-- If a glTF model is provided, use it; otherwise fall back to a simple box -->
    <a-entity v-if="modelSrc" ref="modelEntity" :gltf-model="modelSrc" animation-mixer="clip: idle; loop: repeat" />
    <a-box v-else :color="color" depth="0.6" height="1.6" width="0.6" />
  </a-entity>
</template>

<script>
export default {
  name: 'Npc',
  props: {
    position: { type: Object, default: () => ({ x: 0, y: 0, z: -3 }) },
    speed: { type: Number, default: 1.5 }, // meters / second
    path: { type: Array, default: () => [] }, // array of {x,y,z}
    followCamera: { type: Boolean, default: true },
    animateMovement: { type: Boolean, default: true },
    approachDistance: { type: Number, default: 2.0 },
    pauseDuration: { type: Number, default: 1000 },
    stopDistance: { type: Number, default: 1.2 },
    modelSrc: { type: String, default: '' },
    color: { type: String, default: '#ff4444' }
  },
  data() {
    return {
      moving: false,
      isAnimating: false,
      walking: false,
      paused: false,
      pauseTimer: null,
      currentIndex: 0,
      waypoints: [],
      _tickHandler: null
    }
  },
  computed: {
    posString() {
      const p = this.position || { x: 0, y: 0, z: 0 }
      return `${p.x} ${p.y} ${p.z}`
    }
  },
  mounted() {
    this.el = this.$refs.npc
    // build three.js helpers
    this.Vector3 = AFRAME.THREE.Vector3
    // find camera entity in the scene
    this.cameraEntity = (this.el && this.el.sceneEl && (this.el.sceneEl.querySelector('[camera]') || this.el.sceneEl.querySelector('a-camera'))) || document.querySelector('[camera]')

    if (this.path && this.path.length) {
      this.waypoints = this.path.map(p => new this.Vector3(p.x, p.y, p.z))
      this.currentIndex = 0
      this.startPathFollowing()
    } else if (this.followCamera) {
      this.startFollowCamera()
    }
  },
  methods: {
    _onTickEvent(e) {
      // e.detail.delta is ms since last tick
      const dt = (e && e.detail && e.detail.delta) ? (e.detail.delta / 1000) : 0.016
      const obj = this.el.object3D
      const pos = obj.position

      let target = null
      if (this.waypoints && this.waypoints.length && this.currentIndex < this.waypoints.length) {
        target = this.waypoints[this.currentIndex]
      } else if (this.followCamera && this.cameraEntity && this.cameraEntity.object3D) {
        target = new this.Vector3()
        this.cameraEntity.object3D.getWorldPosition(target)
      }

      if (!target) return

      const dir = target.clone().sub(pos)
      const dist = dir.length()
      if (dist <= this.stopDistance) {
        if (this.waypoints && this.currentIndex < this.waypoints.length - 1) {
          this.currentIndex++
          return
        }
        // reached final target
        this.stop()
        return
      }

      // If animateMovement is enabled, create an A-Frame animation toward the target
      if (this.animateMovement) {
        if (this.isAnimating) return
        this.isAnimating = true

        const to = `${target.x} ${target.y} ${target.z}`
        const duration = Math.max(50, Math.floor((dist / this.speed) * 1000))

        // remove any existing move animation
        this.el.removeAttribute('animation__move')

        const animStr = `property: position; to: ${to}; dur: ${duration}; easing: linear; fill: forwards;`
        this.el.setAttribute('animation__move', animStr)

        const onComplete = (ev) => {
          if (ev && ev.type && ev.type.indexOf('animationcomplete') === 0) {
            this.isAnimating = false
            this.el.removeEventListener('animationcomplete__move', onComplete)

            // advance waypoint if any
            if (this.waypoints && this.currentIndex < this.waypoints.length - 1) {
              this.currentIndex++
            } else if (!this.followCamera) {
              // if not following camera and no more waypoints, stop
              this.stop()
            }
          }
        }

        this.el.addEventListener('animationcomplete__move', onComplete)
        // start animation immediately (attribute is present so it autoplays)
        return
      }

      // fallback: direct position update (non-animated)
      // If following the camera, move forward along NPC's forward vector toward the camera
      if (this.followCamera && this.cameraEntity) {
        // compute horizontal direction to camera
        const toCam = target.clone().sub(pos)
        toCam.y = 0
        const distHoriz = toCam.length()
        // if within stopDistance, do nothing
        if (distHoriz <= this.stopDistance) return

        // pause/resume behavior: if within approachDistance, pause then resume after pauseDuration
        if (distHoriz <= this.approachDistance) {
          if (!this.paused) {
            this.stopWalking()
            this.paused = true
            if (this.pauseTimer) clearTimeout(this.pauseTimer)
            this.pauseTimer = setTimeout(() => {
              this.paused = false
              this.startWalking()
            }, this.pauseDuration)
          }
          return
        }

        // if paused but camera moved away, resume immediately
        if (this.paused && distHoriz > this.approachDistance + 0.2) {
          this.paused = false
          if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null }
          this.startWalking()
        }

        // get NPC forward vector (world -Z)
        const forward = new this.Vector3()
        obj.getWorldDirection(forward)
        // keep horizontal
        forward.y = 0
        forward.normalize()

        // ensure forward is pointing roughly toward the camera; flip if necessary
        const camDir = toCam.clone().normalize()
        if (forward.dot(camDir) < 0) forward.negate()

        // compute move and clamp to not overshoot target horizontally
        const step = this.speed * dt
        const moveDist = Math.min(step, Math.max(0, distHoriz - this.stopDistance))
        const moveVec = forward.multiplyScalar(moveDist)
        pos.add(moveVec)
        obj.position.copy(pos)
        return
      }

      dir.normalize()
      const move = dir.multiplyScalar(this.speed * dt)
      pos.add(move)
      obj.position.copy(pos)
    },

    startPathFollowing() {
      if (this.moving) return
      this.moving = true
      this.startWalking()
      // if animateMovement is enabled, build chained A-Frame animations and start them
      if (this.animateMovement && this.waypoints && this.waypoints.length) {
        this.setupPathAnimations()
        return
      }
      // ensure look-at not present for path movement
      if (this.el && this.el.removeAttribute) this.el.removeAttribute('look-at')
      // fallback to tick-based movement
      this._tickHandler = this._onTickEvent.bind(this)
      this.el.sceneEl.addEventListener('tick', this._tickHandler)
    },

    startFollowCamera() {
      // clear waypoints and follow camera continously
      this.waypoints = []
      this.currentIndex = 0
      this.moving = true
      this.startWalking()
      // enable look-at so NPC faces the camera's head at correct height
      if (this.el && this.el.setAttribute) this.el.setAttribute('look-at', 'target: #head; matchY: true')
      this._tickHandler = this._onTickEvent.bind(this)
      this.el.sceneEl.addEventListener('tick', this._tickHandler)
    },

    moveTo(positionObj) {
      // set a single waypoint and start following it
      this.waypoints = [new this.Vector3(positionObj.x, positionObj.y, positionObj.z)]
      this.currentIndex = 0
      this.startPathFollowing()
    },

    stop() {
      this.moving = false
      this.stopWalking()
      // remove look-at when stopping
      if (this.el && this.el.removeAttribute) this.el.removeAttribute('look-at')
      if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null }
      this.paused = false
      if (this._tickHandler && this.el && this.el.sceneEl) {
        this.el.sceneEl.removeEventListener('tick', this._tickHandler)
        this._tickHandler = null
      }
    },

    startWalking() {
      if (this.walking) return
      this.walking = true
      // if model entity exists, set its animation-mixer to walk
      const model = this.$refs.modelEntity
      if (model && model.setAttribute) {
        try {
          model.setAttribute('animation-mixer', 'clip: walk; loop: repeat')
        } catch (err) {
          // fallback: set attribute via el
          model.el && model.el.setAttribute && model.el.setAttribute('animation-mixer', 'clip: walk; loop: repeat')
        }
      }
    },

    stopWalking() {
      if (!this.walking) return
      this.walking = false
      const model = this.$refs.modelEntity
      if (model && model.setAttribute) {
        try {
          // try switching to idle if available, otherwise remove
          model.setAttribute('animation-mixer', 'clip: idle; loop: repeat')
        } catch (err) {
          model.el && model.el.removeAttribute && model.el.removeAttribute('animation-mixer')
        }
      }
    },

    setupPathAnimations() {
      if (!this.el || !this.waypoints || !this.waypoints.length) return
      const n = this.waypoints.length
      // remove existing walk animations
      for (let i = 0; i < 20; i++) {
        this.el.removeAttribute(`animation__walk${i}`)
      }

      // compute durations per segment and set animations chaining to previous completion (circular)
      // For each segment we create: animation__turn{i} (rotation) -> animation__walk{i} (position)
      for (let i = 0; i < n; i++) {
        const prevIndex = (i - 1 + n) % n
        const fromVec = (i === 0) ? this.el.object3D.position.clone() : this.waypoints[prevIndex].clone()
        const toVec = this.waypoints[i].clone()

        // compute yaw so NPC faces the target
        const dx = toVec.x - fromVec.x
        const dz = toVec.z - fromVec.z
        const yawRad = Math.atan2(dx, dz)
        const yawDeg = (yawRad * 180) / Math.PI
        const rotTo = `0 ${yawDeg.toFixed(2)} 0`
        const turnDur = 300

        // compute movement duration based on distance
        const dist = fromVec.distanceTo(toVec)
        const walkDur = Math.max(50, Math.floor((dist / this.speed) * 1000))
        const posTo = `${toVec.x} ${toVec.y} ${toVec.z}`

        const turnStartEvent = `animationcomplete__walk${prevIndex}`
        const walkStartEvent = `animationcomplete__turn${i}`

        const turnAnim = `property: rotation; to: ${rotTo}; dur: ${turnDur}; easing: linear; startEvents: ${turnStartEvent};`
        const walkAnim = `property: position; to: ${posTo}; dur: ${walkDur}; easing: linear; startEvents: ${walkStartEvent};`

        this.el.setAttribute(`animation__turn${i}`, turnAnim)
        this.el.setAttribute(`animation__walk${i}`, walkAnim)
      }

      // kick off chain by emitting the previous-complete event for the first animation
      // emit on next tick to ensure attributes are registered
      setTimeout(() => {
        this.el.emit(`animationcomplete__walk${n - 1}`)
      }, 50)
    }
  },
  beforeUnmount() {
    this.stop()
  }
}
</script>

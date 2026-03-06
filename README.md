<p align="center">
    <img src="./logo.svg" alt="VAV Logo" align="center"/>
</p>
<h1 align="center">Vue + A-Frame + Vite boilerplate</h1>

> A boilerplate for A-Frame, Vue and Vite

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![A-Frame](https://img.shields.io/badge/A%E2%80%93Frame-brightgreen?style=for-the-badge&labelColor=%23ef2d5e&color=%23ef2d5e)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

### [>> DEMO <<](https://vr.onivers.com/alexandre/)

## Included in the boilerplate

### Libs and components

- [aframe-extras](https://github.com/c-frame/aframe-extras) (MIT License)
- [aframe physx](https://github.com/c-frame/physx) (MIT License)
- [aframe-blink-controls](https://github.com/jure/aframe-blink-controls) (MIT License)
- [aframe-multi-camera](https://github.com/diarmidmackenzie/aframe-multi-camera/) (MIT License)
- [simple-navmesh-constraint](https://github.com/AdaRoseCannon/aframe-xr-boilerplate) (MIT Licence)

### Movement modes support

- **Desktop** – Keyboard for move (_WASD_ or Arrows keys) + Mouse for look control (Drag and drop)
- **Mobile** – 1x Finger touch to go forward + 2x Fingers touch to go backward + Gaze cursor for click
- **VR/AR** – walk + Teleport (Grip for grab and laser for click) + Gaze cursor for click in AR

### 3D models

#### Assets utilisés

| Asset              | Auteur / Source                                                                 | Licence / Lien                                                                 |
|--------------------|-------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [VR NPC Model](https://www.fab.com/listings/f4559d15-b9a2-43c4-836a-5c417c04d10d) | [Denys Almaral](https://www.fab.com/sellers/Denys%20Almaral)                  | [Standard License](https://www.fab.com/eula)                                  |
| [HEAVY PLASMA GUN](https://www.fab.com/listings/251ea724-4602-4f36-80c3-5b27b92dabe0) | [tekuto1s](https://www.fab.com/sellers/tekuto1s)                              | [FAB License](https://www.fab.com/eula)                                       |
| [VR Gallery Room](https://www.fab.com/listings/3922d2eb-efef-49a9-9017-ee510c6260b5) | [Christy Hsu](https://www.fab.com/sellers/Christy%20Hsu)                      | [FAB License](https://www.fab.com/eula)                                       |
| [Music Techno](https://www.fab.com/listings/3922d2eb-efef-49a9-9017-ee510c6260b5)   | [Ahmed Abdulaal from Pixabay](https://pixabay.com/sound-effects/)              | Free (Pixabay)                                                                |
| [Sound Effects](https://www.fab.com/listings/3922d2eb-efef-49a9-9017-ee510c6260b5)  | [u_o8xh7gwsrj from Pixabay](https://pixabay.com/sound-effects/)                | Free (Pixabay)                                                                |

---

## Quickstart

### Create a folder for your project and move to it

### Clone (or fork, or download)

```sh
git clone https://github.com/Alexhungerbuhler/VRShootingGame.git
```

### Install dependencies

```sh
npm ci
```

### Dev

```sh
npm run dev
```

### Build

```sh
npm run build
```

## Notes for local dev on VR headset

1. Check that your development device and your VR headset are connected on **the same network**.

2. Expose you local development:

```sh
npm run dev-expose
```

3. In your VR headset, browse to the local development adress `[ip]:[port]`.

> [!NOTE]
> The certificate is self-signed, so you will probably have to confirm access to the resource in your browser.

---

## License

![MIT License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge&color=%23262626)

import * as THREE from "../three.js-master/build/three.module.js";
import { PointerLockControls } from "../three.js-master/examples/jsm/controls/PointerLockControls.js";

//create renderer
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//create camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//position camera
camera.position.y = 2;
camera.position.z = 5;

//add light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.y = 10;
dirLight.position.z = 5;
dirLight.castShadow = true;
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambLight);

const clock = new THREE.Clock();

//setup controls
const controls = new PointerLockControls(camera, document.body);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

//event listener for pointer lock
document.addEventListener(
  "click",
  () => {
    controls.lock();
  },
  false
);

//event listener for keydown
document.addEventListener(
  "keydown",
  (event) => {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
      case "Escape":
        controls.unlock();
        break;
    }
  },
  false
);

//event listener for keyup
document.addEventListener(
  "keyup",
  (event) => {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
    }
  },
  false
);

//handle pointer lock state changes
controls.addEventListener("lock", () => {
  console.log("pointer locked");
});

controls.addEventListener("unlock", () => {
  console.log("pointer unlocked");
});


//add cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
scene.add(cube);

//add ground
const ground = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.5, 10),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
ground.receiveShadow = true;
ground.position.y = -4;
scene.add(ground);

//add animation
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  //calculate delta for smooth movement
  const delta = clock.getDelta();

  //movement settings
  const accelerationFactor = 10;
  const dampingFactor = 10.0;
  const speedMultiplier = 40.0;

  //update velocity
  velocity.x -= velocity.x * dampingFactor * delta;
  velocity.z -= velocity.z * dampingFactor * delta;

  //update direction based on input
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize(); // this ensures consistent movements in all directions

  //update velocity
  if (moveForward || moveBackward)
    velocity.z -= direction.z * accelerationFactor * speedMultiplier * delta;
  if (moveLeft || moveRight)
    velocity.x -= direction.x * accelerationFactor * speedMultiplier * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  renderer.render(scene, camera);
}

animate();

//window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

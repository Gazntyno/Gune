import * as THREE from "../three.js-master/build/three.module.js";
import { PointerLockControls } from "../three.js-master/examples/jsm/controls/PointerLockControls.js";

//create renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
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
camera.position.set(4, 6, 15);

//add light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.y = 15;
dirLight.position.z = 5;
dirLight.castShadow = true;
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambLight);

const clock = new THREE.Clock();

const controls = new PointerLockControls(camera, document.body);

//event listener for pointer lock
document.addEventListener(
  "click",
  () => {
    controls.lock();
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

//console.Log(ground.top);
//console.log(cube.bottom);

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = "#00ff00",
    velocity = { x: 0, y: 0, z: 0 },
    position = { x: 0, y: 0, z: 0 },
    zAcceleration = false,
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    );

    this.castShadow = true;

    this.height = height;
    this.width = width;
    this.depth = depth;

    this.position.set(position.x, position.y, position.z);

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;

    this.velocity = velocity;
    this.gravity = -0.002;

    this.zAcceleration = zAcceleration;
  }

  updateSides() {
    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update(ground) {
    this.updateSides();

    if (this.zAcceleration) this.velocity.z += 0.0003;

    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    //this is the ground collision
    this.applyGravity(ground);
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity;

    if (boxCollision({ box1: this, box2: ground })) {
      this.velocity.y *= 0.8;
      this.velocity.y = -this.velocity.y;
    } else this.position.y += this.velocity.y;
  }
}

function boxCollision({ box1, box2 }) {
  //detect collision
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.front >= box2.back && box1.back <= box2.front;

  return xCollision && yCollision && zCollision;
}

//add cube
const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: { x: 0, y: -0.01, z: 0 },
  position: { x: 0, y: 0, z: 5 },
});

scene.add(cube);

//add ground
const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 50,
  color: "#792bff",
  position: { x: 0, y: -2, z: 0 },
});

ground.receiveShadow = true;
scene.add(ground);

//setup controls

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
};

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "KeyS":
      keys.s.pressed = true;
      break;
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "Space":
      cube.velocity.y = 0.1;
      break;
    case "Escape":
      controls.unlock();
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "KeyS":
      keys.s.pressed = false;
      break;
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
    case "Escape":
      controls.unlock();
      break;
  }
});

const enemies = [];

let frames = 0;
let spawnRate = 200;

//add animation
function animate() {
  const animationID = requestAnimationFrame(animate);

  /*cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;*/

  //movement settings
  let playerSpeed = 0.05;
  cube.velocity.x = 0;
  cube.velocity.z = 0;
  if (keys.a.pressed) cube.velocity.x = -playerSpeed;
  else if (keys.d.pressed) cube.velocity.x = playerSpeed;

  if (keys.w.pressed) cube.velocity.z = -playerSpeed;
  else if (keys.s.pressed) cube.velocity.z = playerSpeed;

  cube.update(ground);
  enemies.forEach((enemy) => {
    enemy.update(ground);
    if (boxCollision({ box1: cube, box2: enemy })) {
      window.cancelAnimationFrame(animationID);
      sdw;
    }
  });

  if (frames % spawnRate === 0) {
    if (spawnRate > 20) spawnRate -= 10;
    const enemy = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: { x: (Math.random() - 0.5) * 10, y: 0, z: -25 },
      velocity: { x: 0, y: 0, z: 0.008 },
      color: "red",
      zAcceleration: true,
    });

    scene.add(enemy);
    enemies.push(enemy);
  }
  frames++;

  renderer.render(scene, camera);
}

animate();

//window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

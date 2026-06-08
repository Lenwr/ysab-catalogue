<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";

const props = defineProps({
  textureUrl: {
    type: String,
    default: "/images/waxhollandais.jpg",
  },
});

const container = ref(null);
const hasWebGL = ref(true);

let renderer;
let scene;
let camera;
let fabric;
let animationFrameId;
let resizeObserver;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function resize() {
  if (!container.value || !renderer || !camera) return;

  const { width, height } = container.value.getBoundingClientRect();
  if (!width || !height) return;

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate(time) {
  if (!fabric) return;

  const position = fabric.geometry.attributes.position;
  const elapsed = time * 0.001;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const wave =
      Math.sin(x * 2.2 + elapsed * 1.25) * 0.12 +
      Math.sin(y * 3.4 + elapsed * 1.7) * 0.07;

    position.setZ(index, wave);
  }

  position.needsUpdate = true;
  fabric.rotation.y = Math.sin(elapsed * 0.35) * 0.08 - 0.18;
  fabric.rotation.x = -0.12 + Math.sin(elapsed * 0.25) * 0.03;

  renderer.render(scene, camera);
  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  if (!container.value || !supportsWebGL()) {
    hasWebGL.value = false;
    return;
  }

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.15, 5.8);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2.6, 3.2, 4);
  const fillLight = new THREE.DirectionalLight(0xf3c88b, 1.2);
  fillLight.position.set(-3, -1, 2);
  scene.add(ambientLight, keyLight, fillLight);

  const texture = new THREE.TextureLoader().load(props.textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.15, 1.05);
  texture.anisotropy = 8;

  const geometry = new THREE.PlaneGeometry(3.7, 4.7, 64, 64);
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.82,
    metalness: 0,
    side: THREE.DoubleSide,
    sheen: 0.45,
    sheenRoughness: 0.65,
  });

  fabric = new THREE.Mesh(geometry, material);
  fabric.rotation.set(-0.12, -0.18, 0.04);
  scene.add(fabric);

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container.value);
  resize();
  animationFrameId = requestAnimationFrame(animate);
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (resizeObserver) resizeObserver.disconnect();

  if (fabric) {
    fabric.geometry.dispose();
    fabric.material.map?.dispose();
    fabric.material.dispose();
  }

  renderer?.dispose();
  renderer?.domElement?.remove();
});
</script>

<template>
  <div class="relative min-h-[420px] overflow-hidden md:min-h-[560px]">
    <div
      class="absolute inset-x-8 bottom-5 top-10 rounded-full bg-[#d7a753]/25 blur-3xl"
    />

    <div
      ref="container"
      class="absolute inset-0"
      aria-hidden="true"
    />

    <img
      v-if="!hasWebGL"
      :src="textureUrl"
      alt="Pagne YSAB"
      class="absolute inset-0 h-full w-full object-cover"
    />
  </div>
</template>

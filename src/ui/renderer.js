import * as THREE from 'three';

export function createRenderer() {
  // Only create renderer when in browser environment
  if (typeof window !== 'undefined') {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
  }
  return null;
}
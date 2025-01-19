import * as THREE from 'three';

export function createAvatar() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const avatar = new THREE.Mesh(geometry, material);
  return avatar;
}
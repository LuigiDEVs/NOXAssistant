import { createScene } from './scene.js';
import { createAvatar } from './avatar.js';
import { createRenderer } from './renderer.js';

export function setupUI() {
  console.log('Initializing UI in headless mode...');
  
  // Create components without browser dependencies
  const scene = createScene();
  const avatar = createAvatar();
  scene.add(avatar);

  return {
    scene,
    avatar,
    update() {
      // Update avatar animation state
      avatar.rotation.x += 0.01;
      avatar.rotation.y += 0.01;
    }
  };
}
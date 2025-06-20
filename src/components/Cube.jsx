import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function Cube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const element = mountRef.current;
    const dimensions = 3;
    const background = 0x000000;

    const width = element.clientWidth;
    const height = element.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(background, 1.0);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    element.appendChild(renderer.domElement);

    camera.position.set(-20, 20, 30);
    camera.lookAt(scene.position);

    const controls = new OrbitControls(camera, renderer.domElement);

    /*** Light ***/
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);


    const cubeSize = 3;
    const spacing = 0.5;
    const increment = cubeSize + spacing;
    const colours = [0xFF5800, 0xC41E3A, 0xFFFFFF, 0xFFD500, 0x0051BA, 0x009E60];
    const faceMaterials = colours.map((c) => new THREE.MeshLambertMaterial({ color: c }));
    const cubeMaterials = faceMaterials;

    const allCubes = [];

    const positionOffset = (dimensions - 1) / 2;
    for (let i = 0; i < dimensions; i++) {
      for (let j = 0; j < dimensions; j++) {
        for (let k = 0; k < dimensions; k++) {
          const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
          const cube = new THREE.Mesh(geometry, cubeMaterials);
          cube.position.set(
            (i - positionOffset) * increment,
            (j - positionOffset) * increment,
            (k - positionOffset) * increment
          );
          cube.castShadow = true;
          scene.add(cube);
          allCubes.push(cube);
        }
      }
    }

    /*** Animate ***/
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    /*** Cleanup on unmount ***/
    return () => {
      element.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}

export default Cube;
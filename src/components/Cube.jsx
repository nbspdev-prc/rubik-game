import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

function Cube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const element = mountRef.current;
    const dimensions = 3;
    // const background = 0xf5e1b8;
    const background = 0x1a1d2b;

    const width = element.clientWidth;
    const height = element.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Set up render
    renderer.setClearColor(background, 1.0);
    renderer.setSize(width, height);
    element.appendChild(renderer.domElement);
    
    // Starting position
    camera.position.set(-20, 20, 30);
    camera.lookAt(scene.position);

    // Set up camera controls rules
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableZoom = false;
    controls.enablePan = false;

    // Set up lights
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(20, 20, 20);
    scene.add(light);

    // Generate cubes
    const cubeSize = 3;
    const spacing = 0;
    const increment = cubeSize + spacing;

    const allCubes = [];
    const positionOffset = (dimensions - 1) / 2;

    for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
            for (let k = 0; k < dimensions; k++) {
                
                const x = (i - positionOffset) * increment;
                const y = (j - positionOffset) * increment;
                const z = (k - positionOffset) * increment;

                // Compute booleans for edges
                const orangeSide  = (i === dimensions - 1);
                const redSide     = (i === 0);
                const whiteSide   = (j === dimensions - 1);
                const yellowSide  = (j === 0);
                const blueSide    = (k === dimensions - 1);
                const greenSide   = (k === 0);

                const faceMaterials = [
                    new THREE.MeshToonMaterial({ color: orangeSide ? 0xf54118 : 0x000000 }),
                    new THREE.MeshToonMaterial({ color: redSide    ? 0xd1112e : 0x000000 }),
                    new THREE.MeshToonMaterial({ color: whiteSide  ? 0xffffff : 0x000000 }),
                    new THREE.MeshToonMaterial({ color: yellowSide ? 0xffc824 : 0x000000 }),
                    new THREE.MeshToonMaterial({ color: blueSide   ? 0x303af0 : 0x000000 }),
                    new THREE.MeshToonMaterial({ color: greenSide  ? 0x08d108 : 0x000000 })
                ];

                const geometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 2, 0.5);
                const cube = new THREE.Mesh(geometry, faceMaterials);

                cube.position.set(x, y, z);
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
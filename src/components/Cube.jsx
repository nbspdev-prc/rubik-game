import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import gsap from 'gsap';

const Cube = forwardRef((props, ref) => {
	const mountRef = React.useRef();
	const cubeGroupRef = React.useRef([]);
	const cubeMap = React.useRef({});
	const sceneRef = React.useRef();
	const isRotatingRef = React.useRef(false);
	const moveQueueRef = React.useRef([]);

	useEffect(() => {
		const element = mountRef.current;
		const dimensions = 3;
		const background = 0x1a1d2b;
		const width = element.clientWidth;
		const height = element.clientHeight;

		sceneRef.current = new THREE.Scene();
		const scene = sceneRef.current;
		const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setClearColor(background, 1.0);
		renderer.setSize(width, height);
		element.appendChild(renderer.domElement);

		camera.position.set(-20, 20, 30);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableZoom = false;
		controls.enablePan = false;

		const light = new THREE.DirectionalLight(0xffffff, 1.5);
		light.position.set(20, 20, 20);
		scene.add(light);

		const cubeSize = 3;
		const spacing = 0.25;
		const increment = cubeSize + spacing;
		const positionOffset = (dimensions - 1) / 2;

		for (let i = 0; i < dimensions; i++) {
			for (let j = 0; j < dimensions; j++) {
				for (let k = 0; k < dimensions; k++) {
					const x = (i - positionOffset) * increment;
					const y = (j - positionOffset) * increment;
					const z = (k - positionOffset) * increment;

					const orange = i === dimensions - 1;
					const red = i === 0;
					const white = j === dimensions - 1;
					const yellow = j === 0;
					const blue = k === dimensions - 1;
					const green = k === 0;

					const materials = [
						new THREE.MeshToonMaterial({ color: orange ? 0xf54118 : 0x000000 }),
						new THREE.MeshToonMaterial({ color: red ? 0xd1112e : 0x000000 }),
						new THREE.MeshToonMaterial({ color: white ? 0xffffff : 0x000000 }),
						new THREE.MeshToonMaterial({ color: yellow ? 0xffc824 : 0x000000 }),
						new THREE.MeshToonMaterial({ color: blue ? 0x303af0 : 0x000000 }),
						new THREE.MeshToonMaterial({ color: green ? 0x08d108 : 0x000000 }),
					];

					const geometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 2, 0.5);
					const cube = new THREE.Mesh(geometry, materials);
					cube.position.set(x, y, z);
					cube.castShadow = true;

					scene.add(cube);
					cubeGroupRef.current.push(cube);
					cubeMap.current[`${i}${j}${k}`] = cube;
				}
			}
		}

		const animate = () => {
			controls.update();
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		};
		animate();

		return () => {
			element.removeChild(renderer.domElement);
		};
	}, []);

	const rotateFaceInternal = (move) => {
		const axisMap = {
			R: { axis: 'x', val: 1 },
			L: { axis: 'x', val: -1 },
			U: { axis: 'y', val: 1 },
			D: { axis: 'y', val: -1 },
			F: { axis: 'z', val: 1 },
			B: { axis: 'z', val: -1 },
		};

		const prime = move.includes("'");
		const baseMove = move.replace("'", "");
		const { axis, val } = axisMap[baseMove];

		const slice = cubeGroupRef.current.filter((cube) => {
			const rounded = Math.round(cube.position[axis] * 2) / 2;
			return val === 1 ? rounded > 1 : rounded < -1;
		});

		const group = new THREE.Group();
		sceneRef.current.add(group);
		slice.forEach((cube) => group.attach(cube));

		const angle = (prime ? -1 : 1) * Math.PI / 2;

		gsap.to(group.rotation, {
			[axis]: group.rotation[axis] + angle,
			duration: 0.3,
			ease: "power1.inOut",
			onComplete: () => {
				group.rotation[axis] = Math.round(group.rotation[axis] / (Math.PI / 2)) * (Math.PI / 2);
				slice.forEach((cube) => sceneRef.current.attach(cube));
				sceneRef.current.remove(group);
				isRotatingRef.current = false;
				if (moveQueueRef.current.length > 0) {
					rotateFaceInternal(moveQueueRef.current.shift());
				}
			},
		});
	};

	useImperativeHandle(ref, () => ({
		rotateFace: (move) => {
			if (isRotatingRef.current) {
				moveQueueRef.current.push(move);
			} else {
				isRotatingRef.current = true;
				rotateFaceInternal(move);
			}
		},
	}));

	return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
});

export default Cube;

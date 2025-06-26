import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

const Cube = forwardRef((props, ref) => {
	const mountRef = React.useRef();
	const cubeGroupRef = React.useRef([]);
	const cubeMap = React.useRef({});
	const sceneRef = React.useRef();
	const isRotatingRef = React.useRef(false);
	const moveQueueRef = React.useRef([]);
	const rotationStateRef = React.useRef(null);

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

		if (slice.length === 0) return;

		const group = new THREE.Group();
		sceneRef.current.add(group);
		slice.forEach((cube) => group.attach(cube));

		const direction = prime ? -1 : 1;
		const targetAngle = (Math.PI / 2) * direction;

		rotationStateRef.current = {
			group,
			axis,
			targetAngle,
			currentAngle: 0,
			speed: 0.1,
			slice,
		};
	};

	const isCubeSolved = () => {
        const faces = [
            { axis: 'x', value: 3, faceIndex: 0 }, // Right
            { axis: 'x', value: -3, faceIndex: 1 }, // Left
            { axis: 'y', value: 3, faceIndex: 2 }, // Top
            { axis: 'y', value: -3, faceIndex: 3 }, // Bottom
            { axis: 'z', value: 3, faceIndex: 4 }, // Front
            { axis: 'z', value: -3, faceIndex: 5 }, // Back
        ];

        for (const { axis, value, faceIndex } of faces) {
            const faceCubes = cubeGroupRef.current.filter(
                (cube) => Math.round(cube.position[axis]) === value
            );
            const color = faceCubes[0].material[faceIndex].color.getHex();

            if (!faceCubes.every(cube => cube.material[faceIndex].color.getHex() === color)) {
                return false;
            }
        }

        return true;
    };

	useImperativeHandle(ref, () => ({
		rotateFace: (move) => {
			if (isRotatingRef.current || rotationStateRef.current) {
				moveQueueRef.current.push(move);
			} else {
				isRotatingRef.current = true;
				rotateFaceInternal(move);
			}
		},
		isCubeSolved,
	}));

	// eslint-disable-next-line react-hooks/exhaustive-deps
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

		// Create cubes
		const cubeSize = 3;
		const spacing = 0.25;
		const increment = cubeSize + spacing;
		const offset = (dimensions - 1) / 2;

		for (let i = 0; i < dimensions; i++) {
			for (let j = 0; j < dimensions; j++) {
				for (let k = 0; k < dimensions; k++) {
					const x = (i - offset) * increment;
					const y = (j - offset) * increment;
					const z = (k - offset) * increment;

					const orange = i === dimensions - 1;
					const red = i === 0;
					const white = j === dimensions - 1;
					const yellow = j === 0;
					const blue = k === dimensions - 1;
					const green = k === 0;

					const materials = [
						new THREE.MeshToonMaterial({ color: orange ? 0xf54118 : 0x000000 }), // Right
						new THREE.MeshToonMaterial({ color: red ? 0xd1112e : 0x000000 }),   // Left
						new THREE.MeshToonMaterial({ color: white ? 0xffffff : 0x000000 }), // Top
						new THREE.MeshToonMaterial({ color: yellow ? 0xffc824 : 0x000000 }), // Bottom
						new THREE.MeshToonMaterial({ color: blue ? 0x303af0 : 0x000000 }),   // Front
						new THREE.MeshToonMaterial({ color: green ? 0x08d108 : 0x000000 }),  // Back
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

		const updateRotationFrame = () => {
			const r = rotationStateRef.current;
			if (!r) return;

			const delta = r.speed;
			const remaining = r.targetAngle - r.currentAngle;
			const step = Math.abs(remaining) < delta ? remaining : Math.sign(remaining) * delta;

			r.group.rotation[r.axis] += step;
			r.currentAngle += step;

			if (Math.abs(r.currentAngle - r.targetAngle) < 0.001) {
				r.group.rotation[r.axis] = Math.round(r.group.rotation[r.axis] / (Math.PI / 2)) * (Math.PI / 2);
				r.slice.forEach(cube => sceneRef.current.attach(cube));
				sceneRef.current.remove(r.group);
				rotationStateRef.current = null;
				isRotatingRef.current = false;

				if (moveQueueRef.current.length > 0) {
					const nextMove = moveQueueRef.current.shift();
					isRotatingRef.current = true;
					rotateFaceInternal(nextMove);
				}
			}
		};

		const animate = () => {
			if (rotationStateRef.current) updateRotationFrame();
			controls.update();
			renderer.render(scene, camera);
			requestAnimationFrame(animate);
		};
		animate();

		return () => {
			element.removeChild(renderer.domElement);
		};
	}, []);

	return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
});

export default Cube;

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Hero Section</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        #hero-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
        }

        #three-canvas {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }

        .hero-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 10;
            color: white;
            pointer-events: none;
        }

        .hero-title {
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 4s ease-in-out infinite;
            text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
        }

        .hero-subtitle {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            font-weight: 300;
            letter-spacing: 2px;
        }

        .hero-button {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            padding: 15px 40px;
            font-size: 1.2rem;
            color: white;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: all;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-button:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            background: linear-gradient(45deg, #7c4dff, #e91e63);
        }

        .floating-elements {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        }

        .floating-orb {
            position: absolute;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
            border-radius: 50%;
            animation: float 6s ease-in-out infinite;
        }

        .floating-orb:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
        .floating-orb:nth-child(2) { top: 60%; left: 80%; animation-delay: 2s; }
        .floating-orb:nth-child(3) { top: 30%; left: 70%; animation-delay: 4s; }
        .floating-orb:nth-child(4) { top: 80%; left: 20%; animation-delay: 1s; }
        .floating-orb:nth-child(5) { top: 10%; left: 60%; animation-delay: 3s; }

        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
            50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
        }

        .glass-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            z-index: 2;
            pointer-events: none;
        }

        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.5rem;
            }
            .hero-subtitle {
                font-size: 1.2rem;
            }
            .hero-button {
                padding: 12px 30px;
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div id="hero-container">
        <canvas id="three-canvas"></canvas>
        <div class="glass-overlay"></div>
        
        <div class="floating-elements">
            <div class="floating-orb"></div>
            <div class="floating-orb"></div>
            <div class="floating-orb"></div>
            <div class="floating-orb"></div>
            <div class="floating-orb"></div>
        </div>

        <div class="hero-content">
            <h1 class="hero-title">FUTURE IS NOW</h1>
            <p class="hero-subtitle">Experience the next dimension of web design</p>
            <button class="hero-button" onclick="handleCTAClick()">Explore More</button>
        </div>
    </div>

    <script>
        // Three.js Scene Setup
        let scene, camera, renderer, geometry, material, mesh;
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        let particles = [];

        function init() {
            // Scene
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x667eea, 1, 3000);

            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
            camera.position.z = 1000;

            // Renderer
            renderer = new THREE.WebGLRenderer({ 
                canvas: document.getElementById('three-canvas'),
                alpha: true,
                antialias: true 
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000, 0);

            // Create main geometric shape
            createMainShape();
            
            // Create particle system
            createParticles();

            // Create floating geometric shapes
            createFloatingShapes();

            // Event listeners
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            window.addEventListener('resize', onWindowResize, false);

            animate();
        }

        function createMainShape() {
            // Create a complex geometric shape
            const group = new THREE.Group();

            // Main torus
            const torusGeometry = new THREE.TorusGeometry(200, 50, 16, 100);
            const torusMaterial = new THREE.MeshPhongMaterial({
                color: 0x4ecdc4,
                transparent: true,
                opacity: 0.7,
                wireframe: false
            });
            const torus = new THREE.Mesh(torusGeometry, torusMaterial);
            group.add(torus);

            // Nested sphere
            const sphereGeometry = new THREE.SphereGeometry(80, 32, 32);
            const sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6b6b,
                transparent: true,
                opacity: 0.6,
                wireframe: true
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            group.add(sphere);

            // Octahedron
            const octaGeometry = new THREE.OctahedronGeometry(120);
            const octaMaterial = new THREE.MeshPhongMaterial({
                color: 0x45b7d1,
                transparent: true,
                opacity: 0.5,
                wireframe: true
            });
            const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
            group.add(octahedron);

            group.position.set(0, 0, 0);
            scene.add(group);
            mesh = group;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x4ecdc4, 1, 1000);
            pointLight.position.set(200, 200, 200);
            scene.add(pointLight);
        }

        function createParticles() {
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = 2000;
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 4000;
                positions[i + 1] = (Math.random() - 0.5) * 4000;
                positions[i + 2] = (Math.random() - 0.5) * 2000;

                const color = new THREE.Color();
                color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5);
                colors[i] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }

            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particleMaterial = new THREE.PointsMaterial({
                size: 3,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particleSystem);
            particles.push(particleSystem);
        }

        function createFloatingShapes() {
            for (let i = 0; i < 20; i++) {
                const shapes = [
                    new THREE.BoxGeometry(20, 20, 20),
                    new THREE.ConeGeometry(15, 30, 8),
                    new THREE.TetrahedronGeometry(20),
                    new THREE.DodecahedronGeometry(15)
                ];
                
                const geometry = shapes[Math.floor(Math.random() * shapes.length)];
                const material = new THREE.MeshPhongMaterial({
                    color: Math.random() * 0xffffff,
                    transparent: true,
                    opacity: 0.3,
                    wireframe: Math.random() > 0.5
                });
                
                const shape = new THREE.Mesh(geometry, material);
                shape.position.set(
                    (Math.random() - 0.5) * 2000,
                    (Math.random() - 0.5) * 2000,
                    (Math.random() - 0.5) * 1000
                );
                shape.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                
                scene.add(shape);
                particles.push(shape);
            }
        }

        function onDocumentMouseMove(event) {
            mouseX = (event.clientX - windowHalfX);
            mouseY = (event.clientY - windowHalfY);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;

            if (mesh) {
                mesh.rotation.x += 0.005;
                mesh.rotation.y += 0.01;
                mesh.rotation.x += (targetY - mesh.rotation.x) * 0.05;
                mesh.rotation.y += (targetX - mesh.rotation.y) * 0.05;
            }

            // Animate particles
            particles.forEach((particle, index) => {
                if (particle.rotation) {
                    particle.rotation.x += 0.01 * (index % 3 + 1);
                    particle.rotation.y += 0.015 * (index % 2 + 1);
                }
                if (particle.position && index > 0) {
                    particle.position.y += Math.sin(Date.now() * 0.001 + index) * 0.5;
                }
            });

            // Rotate particle system
            if (particles[0]) {
                particles[0].rotation.x += 0.0005;
                particles[0].rotation.y += 0.001;
            }

            renderer.render(scene, camera);
        }

        function handleCTAClick() {
            // Add click animation
            if (mesh) {
                mesh.scale.set(1.2, 1.2, 1.2);
                setTimeout(() => {
                    mesh.scale.set(1, 1, 1);
                }, 200);
            }
            alert('Welcome to the future of web design!');
        }

        // Initialize the scene
        init();
    </script>
</body>
</html>
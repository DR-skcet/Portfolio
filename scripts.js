// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('cube-container').appendChild(renderer.domElement);

// Add environment map for realistic reflections
const loader = new THREE.CubeTextureLoader();
const environmentMap = loader.load([
    'images/posx.jpg', 'images/negx.jpg',
    'images/posy.jpg', 'images/negy.jpg',
    'images/posz.jpg', 'images/negz.jpg'
]);

scene.background = environmentMap;

// Cube geometry with realistic materials
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Materials with realistic colors and properties
const materials = [
    new THREE.MeshStandardMaterial({ color: 0x2c3e50, envMap: environmentMap, roughness: 0.2, metalness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0xf39c12, envMap: environmentMap, roughness: 0.3, metalness: 1.0 }),
    new THREE.MeshStandardMaterial({ color: 0x16a085, envMap: environmentMap, roughness: 0.4, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, envMap: environmentMap, roughness: 0.2, metalness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x9b59b6, envMap: environmentMap, roughness: 0.3, metalness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x34495e, envMap: environmentMap, roughness: 0.6, metalness: 0.3 })
];

// Create the cube
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

cube.rotation.x = Math.PI / 6; // Rotate 45 degrees around the X-axis
cube.rotation.y = Math.PI / 6; // Rotate 45 degrees around the Y-axis

// Add icons for each face of the cube
const iconUrls = [
    'icon/front.png', 'icon/back.png', 'icon/top.png',
    'icon/bottom.png', 'icon/left.png', 'icon/right.png'
];

// Plane geometry for icons
const planeGeometry = new THREE.PlaneGeometry(1.3, 1.3);  // Adjust icon size as needed

// Icon textures and materials (use MeshStandardMaterial instead)
const iconMaterials = iconUrls.map(url => {
    const texture = new THREE.TextureLoader().load(url);
    texture.minFilter = THREE.LinearFilter;
    return new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
    });
});

// Create planes for each face
const planes = iconUrls.map((url, index) => {
    const plane = new THREE.Mesh(planeGeometry, iconMaterials[index]);
    plane.material.side = THREE.DoubleSide;
    return plane;
});

// Position and rotate the planes
planes[0].position.set(0, 0, 1.1);
planes[1].position.set(0, 0, -1.1);
planes[2].position.set(0, 1.1, 0);
planes[3].position.set(0, -1.1, 0);
planes[4].position.set(1.1, 0, 0);
planes[5].position.set(-1.1, 0, 0);
planes[2].rotation.x = Math.PI / 2;
planes[3].rotation.x = -Math.PI / 2;
planes[4].rotation.y = Math.PI / 2;
planes[5].rotation.y = -Math.PI / 2;

// Parent planes to cube
planes.forEach(plane => cube.add(plane));

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 50);
pointLight.position.set(0, 5, 10);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 1.5);
spotLight.position.set(5, 5, 5);
spotLight.target = cube;
scene.add(spotLight);

// Camera position and adjustments
camera.position.z = 3;
camera.fov = 75;
camera.updateProjectionMatrix();
camera.lookAt(cube.position);

// Resize handling
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Track mouse position
document.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    // Normalize mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster without calling updateMatrixWorld
    raycaster.setFromCamera(mouse, camera);

    // Get intersected objects
    const intersects = raycaster.intersectObjects(planes);  // Check intersection with planes (cube faces)

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const faceIndex = planes.indexOf(clickedObject);  // Get the index of the clicked face

        // Show the floating window (popup)
        showFloatingWindow(faceIndex);
    }
}

// Function to show the floating window with more content and animation
// Function to show the floating window with more content and animation
function showFloatingWindow(faceIndex) {
    const floatingWindow = document.createElement('div');
    floatingWindow.classList.add('floating-window');
    floatingWindow.style.position = 'fixed';
    floatingWindow.style.top = '5%';
    floatingWindow.style.left = '50%';
    floatingWindow.style.transform = 'translateX(-50%)';
    floatingWindow.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Light transparent background to blend
    floatingWindow.style.color = '#333'; // Darker text for contrast
    floatingWindow.style.padding = '30px';
    floatingWindow.style.borderRadius = '15px';
    floatingWindow.style.zIndex = '9999';
    floatingWindow.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4)';
    floatingWindow.style.width = '80%';
    floatingWindow.style.maxWidth = '900px';
    floatingWindow.style.height = 'auto';
    floatingWindow.style.overflowY = 'auto'; // Scrollable content
    floatingWindow.style.opacity = '0';
    floatingWindow.style.transition = 'opacity 1s ease-in-out, transform 1s ease-in-out';
    floatingWindow.style.transform = 'translateX(-50%) scale(0.5)'; // Start with scale down for animation

    // Add smooth fade-in and zoom effect
    setTimeout(() => {
        floatingWindow.style.opacity = '1';
        floatingWindow.style.transform = 'translateX(-50%) scale(1)'; // Zoom to normal size
    }, 100);

    // Create a close button
    const closeButton = document.createElement('span');
    closeButton.innerText = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '15px';
    closeButton.style.right = '15px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '30px';
    closeButton.style.color = '#000'; // Black color for close button
    closeButton.addEventListener('click', () => {
        // Animate pop-up closing (fade out and zoom out)
        floatingWindow.style.opacity = '0';
        floatingWindow.style.transform = 'translateX(-50%) scale(0.5)';
        setTimeout(() => floatingWindow.remove(), 1000); // Remove after animation completes
    });

    floatingWindow.appendChild(closeButton);

    // Add structured content based on the clicked face index
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('floating-window-content');

    const faceContent = [
        // Front face content
        `
          <h2 class="floating-window-title">SKILLS</h2>
            <ul>
                <li><strong>Skills:</strong></li>
                <ul>
                    <li>Python</li>
                    <li>C, C++</li>
                    <li>SQL and Concepts</li>
                    <li>OOPS</li>
                    <li>Data Structures</li>
                    <li>HTML, CSS, JS</li>
                    <li>AWS Concepts</li>
                </ul>
            </ul>

        `,

        // Back face content
        `
            <h2 class="floating-window-title">PROJECTS</h2>
            <p>Here are some of the notable projects I have worked on:</p>
            <ul>
                <li><strong>Ovarian Cancer and Outlier Detection | Python-TensorFlow, Keras, Streamlit</strong></li>
                <p>Developed deep learning models using Convolutional Neural Networks, achieving 90% accuracy in classifying ovarian cancer subtypes, stages, and atypical cases. Integrated with Explainable AI tech to assist doctors.</p>
                <p><a href="https://github.com/DR-skcet/OvarianCancer.git" target="_blank">GitHub: Ovarian Cancer and Outlier Detection</a></p>
                
                <li><strong>Escalator Fall Detection System for Pune Metro Rail Corporation | Python-TensorFlow, Keras</strong></li>
                <p>Developed an AI system to detect escalator falls, ensuring enhanced safety for metro passengers.</p>
                <p><a href="https://github.com/DR-skcet/EscalatorFallDetection.git" target="_blank">GitHub: Escalator Fall Detection</a></p>
                
                <li><strong>PCB Board Defect Detection for Flextronics, Bangalore | Python, TensorFlow, Keras</strong></li>
                <p>Built an AI model to identify and classify PCB defects, optimizing manufacturing processes at a service side for consumers.</p>
                <p><a href="https://github.com/DR-skcet/PCB-board-defect-detection-.git" target="_blank">GitHub: PCB Board Defect Detection</a></p>
                
                <li><strong>Vehicle and Object Detection for Road Traffic Management | Python-TensorFlow, Keras, Streamlit</strong></li>
                <p>Built an autonomous vehicle detection AI model for the Government of India, focusing on road safety and traffic management, using real-time datasets.</p>
                <p><a href="https://github.com/DR-skcet/VehicleDetection-for-TrafficManagement.git" target="_blank">GitHub: Vehicle Detection for Traffic Management</a></p>
            </ul>
        `,

        // Top face content
        `
            <h2 class="floating-window-title">EDUCATION</h2>
            <p>Education Background:</p>
            <ul>
                <li><strong>Sri Krishna College of Engineering and Technology </strong></li>
                <p>Bachelors in Computer Science and Business Systems</p>
                <p>CGPA: 8.22</p>
                
                <li><strong>Sri Sankara Vidhyalaya Matriculation Higher Secondary School</strong></li>
                <p>92 percentile</p>
            </ul>

        `,

        // Bottom face content
        `
            <h2 class="floating-window-title"><strong>CERTIFICATIONS</strong></h2>
            <ul>
            <li><strong>Agile Scrum in Practice</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Artificial Intelligence Primer Certification</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Computer Vision</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Deep Learning for Developers</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Email Writing Skills</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Generative Models for Developers</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>High Impact Presentations</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to Agile Methodology</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to Artificial Intelligence</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to Data Science</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to Deep Learning</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to Natural Language Processing</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to OpenAI GPT Models</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to Robotic Process Automation</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>OpenAI Generative Pre-trained Transformer 3 (GPT-3) for Developers</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Principles of Generative AI Certification</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Software Engineering and Agile Software Development</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Time Management</strong> - Infosys Springboard, Issued Aug 2024</li>
            <li><strong>Introduction to MongoDB for Students</strong> - MongoDB, Issued Jun 2024</li>
            <li><strong>Introduction to Cultural Studies</strong> - NPTEL, Issued May 2024</li>
            <li><strong>YESIST'12 Hackathon</strong> - IEEE YESIST12, Issued Mar 2024</li>
            <li><strong>SYNERGY'24</strong> - PSGR Krishnammal College for Women, Issued Feb 2024</li>
            <li><strong>Thiran 2.0</strong> - Jansons Institute of Technology, Issued Feb 2024</li>
            <li><strong>Celonis Foundations</strong> - Celonis, Issued Sep 2023</li>
            <li><strong>Enhancing Soft Skills and Personality</strong> - NPTEL, Issued Apr 2023</li>
            <li><strong>IoT Intern</strong> - Centre for Entrepreneurship Development, Anna University</li>
            <li><strong>PRASUNETHON 48-Hrs Hackathon</strong> - PRASUNET COMPANY</li>
            <li><strong>Solve for Tomorrow</strong> - Samsung Electronics Benelux</li>
            </ul>
        `,

        // Left face content
        `
            <h2 class="floating-window-title">EXPERIENCE</h2>
            <ul>
                <li><strong>Machine Learning Intern - Tamil Nadu Smart and Advanced Manufacturing Centre (TANSAM) powered by Siemens:</strong></li>
                <ul>
                    <li>Developed AI models for PCB defect detection at Flextronics, Bangalore, enhancing quality control processes.</li>
                </ul>
                <li><strong>IoT Intern - Centre for Entrepreneurship Development (CED), Anna University:</strong></li>
                <ul>
                    <li>Developed an IoT-based Smart Public Toilet System for real-time monitoring, improving hygiene and maintenance efficiency.</li>
                </ul>
                <li><strong>MyGov Campus Ambassador - Ministry of Electronics and Information Technology:</strong></li>
                <ul>
                    <li>Selected as a MyGov Campus Ambassador, contributing skills, creativity, and passion to nation-building initiatives.</li>
                </ul>
            </ul>

        `,

        // Right face content
        `
            <h2 class="floating-window-title">HACKATHONS</h2>
            <ul>
                <li><strong>Ideas to Impact-IIT Madras:</strong> Top 20 finalist among 701 ideas, selected for IIT Madras pre-incubation NIRMAAN.</li>
                <li><strong>Synergy 2024:</strong> Runner-up in a competitive business pitch event at PSG, Coimbatore.</li>
                <li><strong>Pune Metro Rail Hackathon:</strong> Worked for the betterment of Metro-Rail Passengers in collaboration with Pune Metro Rail Corporation to prevent escalator falls, enhancing passenger safety.</li>
                <li><strong>PRASUNETHON HACKATHON 2024:</strong> Contributed to the well-being of cancer patients focusing on healthcare.</li>
                <li><strong>Hackfest’24-NITTE, Mangalore:</strong> Finalist of Hackfest’24 at NITTE University, Mangalore, among 240 teams.</li>
            </ul>

        `
    ];

    const faceTitle = ` `; // Example title based on face clicked
    const faceDescription = faceContent[faceIndex];  // Dynamic content for each face

    contentDiv.innerHTML = `
        <h2 class="floating-window-title">${faceTitle}</h2>
        <p class="floating-window-description">${faceDescription}</p>
    `;

    floatingWindow.appendChild(contentDiv);

    // Append the floating window to the body
    document.body.appendChild(floatingWindow);
}

// Interaction (mouse drag to rotate)
let isDragging = false;
let lastMousePosition = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

document.addEventListener('mousedown', function (event) {
    isDragging = true;
    lastMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener('mouseup', function () {
    isDragging = false;
});

document.addEventListener('mousemove', function (event) {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;

    const rotationSpeed = 0.009;
    currentRotation.x -= deltaY * rotationSpeed;
    currentRotation.y -= deltaX * rotationSpeed;

    lastMousePosition = { x: event.clientX, y: event.clientY };
});

// Initial cube rotation and revolution animation
function animateInitialRotation() {
    gsap.to(cube.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        z: Math.PI * 2,
        duration: 3,
        ease: "power1.inOut"
    });

    gsap.to(camera.position, {
        x: 5,
        z: 5,
        duration: 3,
        onUpdate: () => camera.lookAt(cube.position),
        onComplete: resetToDefaultView
    });
}

function resetToDefaultView() {
    gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 3,
        duration: 2,
        ease: "power1.inOut",
        onUpdate: () => camera.lookAt(cube.position)
    });

    gsap.to(cube.rotation, {
        x: Math.PI / 4,
        y: Math.PI / 4,
        duration: 2,
        ease: "power1.inOut"
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (isDragging) {
        cube.rotation.x = currentRotation.x;
        cube.rotation.y = currentRotation.y;
    }

    renderer.render(scene, camera);
}

// Start the animation
animateInitialRotation();
animate();

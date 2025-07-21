const input = document.getElementById('imageInput');
const canvas = document.getElementById('threeCanvas');

let scene, camera, renderer, mesh;

function estimateFakeDepth(imageData, width, height) {
  const depthMap = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      const brightness = (r + g + b) / 3;
      const z = (brightness / 255) * 20; // Scale depth
      depthMap.push(z);
    }
  }
  return depthMap;
}

function generateMesh(image, depthMap, width, height) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      vertices.push(x - width / 2, height / 2 - y, -depthMap[i]);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
}

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
}

input.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const width = 128;
      const height = 128;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const ctx = offCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);

      const depthMap = estimateFakeDepth(imageData, width, height);
      initScene();
      generateMesh(img, depthMap, width, height);
      animate();
    };
    img.src = event.target.result;
  };

  if (file) reader.readAsDataURL(file);
};

function animate() {
  requestAnimationFrame(animate);
  if (mesh) mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}

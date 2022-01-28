import './style.css'

let port = null;
let reader = null;

document.querySelector('#RocketSim').addEventListener('click', async function() {
  port = await navigator.serial.requestPort()
  await port.open({ baudRate: 115200 });
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  reader = textDecoder.readable.getReader();
})

import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 4) / (window.innerHeight / 2), 0.1, 1000 );

const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector('#RocketSim'),
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth / 4, window.innerHeight / 2 );
camera.position.setZ(30);

renderer.render( scene, camera );

const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
const material = new THREE.MeshBasicMaterial( { color: 0xFF6347, wireframe: true } );
const torus = new THREE.Mesh( geometry, material );

scene.add(torus);

const sphereAxis = new THREE.AxesHelper(5);
torus.add(sphereAxis);

let data = []

async function animate() {
  requestAnimationFrame(animate);

  if(port && reader){
    const { value, done } = await reader.read();

    let InitCharFound = false
    let TempString = ""

    value.split("").forEach(char => {
      if(InitCharFound){
        if(char == "@"){
          data = TempString.split(":").map(val => (val * (Math.PI/180)) )
          InitCharFound = false
          TempString = ""
        } else {
          TempString += char
        }
      }

      if(char == "#")
        InitCharFound = true
    });
  }

  if(data.length > 0){
    torus.rotation.y = data[2];
    torus.rotation.x = -data[0];
    torus.rotation.z = -data[1];

    document.querySelector('#RocketSimAngles').innerHTML = `Pitch: ${Math.round(-data[0] * 180/Math.PI)}&deg; Yaw: ${Math.round(-data[1]  * 180/Math.PI)}&deg; Roll: ${Math.round(data[2]  * 180/Math.PI)}&deg;`
  }

  renderer.render( scene, camera );
}

animate();
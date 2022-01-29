import './style.css'

let port = null;
let reader = null;

function drawNumbers(radius) {
  ctx.restore();
  ctx.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
  var ang;
  var num;
  ctx.fillStyle = 'red';
  ctx.font = radius*0.1 + "px arial";
  ctx.textBaseline="end";
  ctx.textAlign="center";
  
  for(num = 1; num < 21; num++){
    ang = num * Math.PI / 10;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    ctx.fillRect(0, 0, 3, 15)
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }

  for(num = 1; num < 21; num++){
    ang = num * Math.PI / 10;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.88);
    ctx.fillText((num*18).toString(), 0, 0);
    ctx.translate(0, radius*0.88);
    ctx.rotate(-ang);
  }
}

document.querySelector('#Overlay').addEventListener('click', async function() {
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

var canvas = document.getElementById("Overlay");  
canvas.width = document.querySelector('#RocketSim').width;
canvas.height = document.querySelector('#RocketSim').height;
var ctx = canvas.getContext("2d");

var radius = canvas.height / 2;
ctx.translate(radius, radius);
radius = radius * 0.90

camera.position.setZ(30);

renderer.render( scene, camera );

const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
const material = new THREE.MeshBasicMaterial( { color: 0xFF6347, wireframe: true } );
const torus = new THREE.Mesh( geometry, material );

scene.add(torus);

const sphereAxis = new THREE.AxesHelper(5);
torus.add(sphereAxis);

let data = []

var ang = 0 * Math.PI / 180;

async function animate() {
  requestAnimationFrame(animate);
  drawNumbers(radius)

  ctx.rotate(ang);
  ctx.translate(0, -radius*0.85);
  ctx.fillRect(0, 0, 3, 15)
  ctx.translate(0, radius*0.85);
  ctx.rotate(-ang);

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
    ang = Math.round(data[1] * 180/Math.PI) * Math.PI / 180;

    //document.querySelector('#RocketSimAngles').innerHTML = `Pitch: ${Math.round(-data[0] * 180/Math.PI)}&deg; Yaw: ${Math.round(-data[1]  * 180/Math.PI)}&deg; Roll: ${Math.round(data[2]  * 180/Math.PI)}&deg;`
  }

  renderer.render( scene, camera );
}

animate();
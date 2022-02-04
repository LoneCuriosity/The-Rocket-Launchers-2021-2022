import * as THREE from 'three';
import drawOverlay from './functions';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

export default class Rocket {
    constructor(canvas, overlayCanvas) {
        this.canvas = canvas
        this.overlayCanvas = overlayCanvas
        this.port = null;
        this.reader = null;
        var _self = this;

        this.overlayCanvas.addEventListener('click', async function() {
            _self.port = await navigator.serial.requestPort()
            await _self.port.open({ baudRate: 115200 });
            let textDecoder = new TextDecoderStream();
            const readableStreamClosed = _self.port.readable.pipeTo(textDecoder.writable);
            _self.reader = textDecoder.readable.getReader();
        })
    }

    async InitViewport() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 4) / (window.innerHeight / 2), 0.1, 1000 );
    
        this.renderer = new THREE.WebGL1Renderer({
            canvas: this.canvas,
        });
    
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth / 4, window.innerHeight / 2 );
    
        this.camera.position.setZ(30);
    
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    
        const objLoader = new OBJLoader()
        this.obj = await objLoader.loadAsync('./model/rocket.obj')

        this.obj.rotation.x = (Math.PI/180 * 90);
        this.obj.scale.set(0.6,0.6,0.6)

        this.obj.traverse(function (child) {
            if ((child).isMesh) {
                (child).material = material
            }
        })
    
        this.scene.add(this.obj)
        this.renderer.render( this.scene, this.camera );
    }

    async InitOverlay() {
        this.overlayCanvas.width = this.canvas.width;
        this.overlayCanvas.height = this.canvas.height;
        this.overlayCanvasContext = this.overlayCanvas.getContext("2d");

        this.radius = this.overlayCanvas.height / 2;
        this.overlayCanvasContext.translate(this.radius*0.99, this.radius);
        //this.radius = this.radius * 0.90

        this.rawData = []
        this.ang = 0;
    }

    async animate() {
        requestAnimationFrame(this.animate.bind(this));
        drawOverlay(this.overlayCanvasContext, this.canvas, this.radius)
      
        this.overlayCanvasContext.rotate(this.ang);
        this.overlayCanvasContext.translate(0, -this.radius*0.85);
        this.overlayCanvasContext.fillRect(0, 0, 3, 15)
        this.overlayCanvasContext.translate(0, this.radius*0.85);
        this.overlayCanvasContext.rotate(-this.ang);

        if(this.port && this.reader && this.obj){
          const { value, done } = await this.reader.read();
      
          let InitCharFound = false
          let TempString = ""
      
          value.split("").forEach(char => {
            if(InitCharFound){
              if(char == "@"){
                this.rawData = TempString.split(":").map(val => (val * (Math.PI/180)) )
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
      
        if(this.rawData.length > 0){
          this.obj.rotation.y = this.rawData[2];
          this.obj.rotation.x = -this.rawData[0] + (Math.PI/180 * 90);
          this.obj.rotation.z = -this.rawData[1];
          this.ang = Math.round(this.rawData[1] * 180/Math.PI) * Math.PI / 180;
        }
      
        this.renderer.render( this.scene, this.camera );
    }
  }
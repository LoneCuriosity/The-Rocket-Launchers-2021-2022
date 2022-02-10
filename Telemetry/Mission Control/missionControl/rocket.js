import * as THREE from 'three';
import drawOverlay from './functions';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

export default class Rocket {
    constructor(canvas, overlayCanvas) {
      this.canvas = canvas
      this.overlayCanvas = overlayCanvas
    }

    async InitViewport() {
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth / 6) / (window.innerHeight / 3), 0.1, 1000 );
  
      this.renderer = new THREE.WebGL1Renderer({
          canvas: this.canvas,
          alpha: true
      });
  
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth / 6, window.innerHeight / 3 );
  
      this.camera.position.setZ(30);

      let texture = new THREE.TextureLoader().load( './FibraDiCarbonio.jpg' );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set( 24, 24 )
      const material = new THREE.MeshBasicMaterial( { map: texture } );
  
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
        this.overlayCanvasContext.translate(this.radius, this.radius);

        this.ang = 0;

        drawOverlay(this.overlayCanvasContext, this.canvas, this.radius)
    }

    set rotate(angles) {
      if(this.obj){
        this.obj.rotation.x = angles.pitch;
        this.obj.rotation.y = -angles.roll;
        this.obj.rotation.z = -angles.yaw;
        this.ang = angles.ang;

        drawOverlay(this.overlayCanvasContext, this.canvas, this.radius)

        this.overlayCanvasContext.rotate(this.ang);
        this.overlayCanvasContext.translate(0, -this.radius*0.85);
        this.overlayCanvasContext.fillRect(0, 0, 3, 15)
        this.overlayCanvasContext.translate(0, this.radius*0.85);
        this.overlayCanvasContext.rotate(-this.ang);

        this.renderer.render( this.scene, this.camera );
      }
    }
  }
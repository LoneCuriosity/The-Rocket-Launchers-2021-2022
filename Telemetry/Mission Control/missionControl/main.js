import './style.css'
import Rocket from './rocket.js'

let port, reader, data = []

var RocketOne = new Rocket(document.getElementById('RocketSim'),document.getElementById('Overlay'));
RocketOne.InitViewport()
RocketOne.InitOverlay()

var RocketTwo = new Rocket(document.getElementById('RocketSim1'),document.getElementById('Overlay1'));
RocketTwo.InitViewport()
RocketTwo.InitOverlay()

var RocketThree = new Rocket(document.getElementById('RocketSim2'),document.getElementById('Overlay2'));
RocketThree.InitViewport()
RocketThree.InitOverlay()

document.getElementById("link").addEventListener('click', async function() {
    port = await navigator.serial.requestPort()
    await port.open({ baudRate: 115200 });
    let textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
})

async function animationLoop(){
    requestAnimationFrame(animationLoop);

    if(port && reader){
      const { value, done } = await reader.read();
  
      let InitCharFound = false, TempString = ""
  
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
        RocketOne.rotate = {pitch: (Math.PI/180 * 90), roll: data[0], yaw: 0, ang: data[0]}
        RocketTwo.rotate = {pitch: 0, roll: 0, yaw: -data[1], ang: -data[1]}
        RocketThree.rotate = {pitch: (Math.PI/180 * 90), roll: data[2], yaw: 0, ang: data[2]}
    }
}

animationLoop()
import './style.css'
import Rocket from './rocket.js'
import Chart from 'chart.js/auto';
import { CustomOptions } from './functions';
import 'chartjs-adapter-date-fns';

let port, reader, data = []
let InitCharFound = false, TempString = ""

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
  
      value.split("").forEach(char => {
        if(InitCharFound){
          if(char == "+"){
            data = TempString.split(",")[2].split(":").map(val => (val * (Math.PI/180)))
            InitCharFound = false
            TempString = ""
          } else {
            TempString += char
          }
        }
        
        if(char == "+"){
          InitCharFound = true
        }
      });
    }

    if(data.length > 0){
        RocketOne.rotate = {pitch: (Math.PI/180 * 90), roll: data[0], yaw: 0, ang: data[0]}
        RocketTwo.rotate = {pitch: 0, roll: 0, yaw: -data[1], ang: -data[1]}
        RocketThree.rotate = {pitch: (Math.PI/180 * 90), roll: data[2], yaw: 0, ang: data[2]}
    }
}

animationLoop()

let XAccelerationData = [{x: new Date(), y: 20}], AltitudeData = [], PressureData = []
let title = "Acceleration vs Time"

let AccChart = new Chart(document.getElementById("AccelerationChart"), {
  type: 'line',
  data: {
    datasets: [{
      data: XAccelerationData,
      tension: 0.3
    }]
  },
  options: CustomOptions("Acceleration vs Time","Acceleration")
});

let AltChart = new Chart(document.getElementById("AltitudeChart"), {
  type: 'line',
  data: {
    datasets: [{
      data: AltitudeData,
      tension: 0.3
    }]
  },
  options: CustomOptions("Altitude vs Time","Altitude")
});

let PresChart = new Chart(document.getElementById("PressureChart"), {
  type: 'line',
  data: {
    datasets: [{
      data: PressureData,
      tension: 0.3
    }]
  },
  options: CustomOptions("Pressure vs Time","Pressure")
});

document.getElementsByClassName('Viewport')[0].style.width = document.getElementsByClassName('Viewport')[0].clientHeight + "px"
document.getElementsByClassName('Viewport')[1].style.width = document.getElementsByClassName('Viewport')[0].clientHeight + "px"
document.getElementsByClassName('Viewport')[2].style.width = document.getElementsByClassName('Viewport')[0].clientHeight + "px"

window.addEventListener("resize", () => {
  var diff = 74 - (document.getElementsByClassName('Dials')[0].clientHeight - document.getElementsByClassName('Viewport')[0].clientHeight)
  document.getElementsByClassName('Viewport')[0].style.width = (document.getElementsByClassName('Viewport')[0].clientHeight - diff) + "px"
  document.getElementsByClassName('Viewport')[0].style.height = (document.getElementsByClassName('Viewport')[0].clientHeight - diff) + "px"
  RocketOne.InitViewport()
  RocketOne.InitOverlay()

  document.getElementsByClassName('Viewport')[1].style.width = (document.getElementsByClassName('Viewport')[1].clientHeight - diff) + "px"
  document.getElementsByClassName('Viewport')[1].style.height = (document.getElementsByClassName('Viewport')[1].clientHeight - diff) + "px"
  RocketTwo.InitViewport()
  RocketTwo.InitOverlay()

  document.getElementsByClassName('Viewport')[2].style.width = (document.getElementsByClassName('Viewport')[2].clientHeight - diff) + "px"
  document.getElementsByClassName('Viewport')[2].style.height = (document.getElementsByClassName('Viewport')[2].clientHeight - diff) + "px"
  RocketThree.InitViewport()
  RocketThree.InitOverlay()
})
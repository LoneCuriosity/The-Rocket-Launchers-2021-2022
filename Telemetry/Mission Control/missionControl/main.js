import './style.css'
import Rocket from './rocket.js'


var RocketOne = new Rocket(document.getElementById('RocketSim'),document.getElementById('Overlay'));

RocketOne.InitViewport()
RocketOne.InitOverlay()
RocketOne.animate()

var RocketTwo = new Rocket(document.getElementById('RocketSim1'),document.getElementById('Overlay1'));

RocketTwo.InitViewport()
RocketTwo.InitOverlay()
RocketTwo.animate()


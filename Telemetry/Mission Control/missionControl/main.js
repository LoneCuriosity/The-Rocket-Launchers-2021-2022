import './style.css'
import Rocket from './rocket.js'


var RocketOne = new Rocket(document.getElementById('RocketSim'),document.getElementById('Overlay'));

RocketOne.InitViewport()
RocketOne.InitOverlay()
RocketOne.animate()

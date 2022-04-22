import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.123.0/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.123.0/examples/jsm/loaders/OBJLoader.js';

function customOptions(title, yAxis){
    return {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                title: {
                    display: true,
                    text: yAxis
                }
            },
            x: {
                type: 'time',
                position: 'bottom',
                time: {
                    unit: 'second'
                },
                ticks: {
                    source: 'data'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title
            }
        }
    }
}

let XAccelerationData = [
    {x: new Date(), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+5), y: 30},
    {x: new Date().setMinutes(new Date().getMinutes()+10), y: 10},
    {x: new Date().setMinutes(new Date().getMinutes()+20), y: -205},
    {x: new Date().setMinutes(new Date().getMinutes()+30), y: 25}
]

let YAccelerationData = [
    {x: new Date(), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+5), y: 10},
    {x: new Date().setMinutes(new Date().getMinutes()+10), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+20), y: -15},
    {x: new Date().setMinutes(new Date().getMinutes()+30), y: 5}
]

new Chart(document.getElementById("AccelerationChart"), {
    type: 'line',
    data: {
        datasets: [
            {
                data: XAccelerationData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.3
            },
            {
                data: YAccelerationData,
                borderColor: 'rgb(100,20,255)',
                tension: 0.3
            }
        ]
    },
    options: customOptions("Acceleration vs Time","Acceleration")
});

new Chart(document.getElementById("VelocityChart"), {
    type: 'line',
    data: {
        datasets: [
            {
                data: XAccelerationData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.3
            },
            {
                data: YAccelerationData,
                borderColor: 'rgb(100,20,255)',
                tension: 0.3
            }
        ]
    },
    options: customOptions("Velocity vs Time","Velocity")
});

var AttitudeIndicator = $.flightIndicator('#attitude', 'attitude',{size: 163});
var AltimeterIndicator = $.flightIndicator('#altimeter', 'altimeter',{size: 163});
var HeadingIndicator = $.flightIndicator('#heading', 'heading',{size: 163});

var map = L.map('map').setView({lon: -98.172941, lat: 26.306059}, 17);

L.tileLayer('./OSMPublicTransport/{z}/{x}/{y}.png', {
    maxZoom: 17,
    minZoom: 12,
    tileSize: 512,
    zoomOffset: -1
}).addTo(map)

L.control.scale({imperial: true, metric: true}).addTo(map)

var list = [{lon: -98.172941, lat: 26.306059},{lon: -98.172941, lat: 26.301099}]

L.polyline(list).addTo(map)

L.marker({lon: -98.172941, lat: 26.306059}).bindPopup('The center of the world').addTo(map)
L.marker({lon: -98.172941, lat: 26.301099}).bindPopup('The center of the world').addTo(map)

$("#SevenSegDisplay").sevenSegArray({ digits: 5, value: -12.35 });

$('#viewport').width($('#viewport-container').width());
$('#viewport').height($('#viewport').width());

let obj, renderer, camera, scene

async function ViewportDraw(){
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, ($('#viewport').width()) / ($('#viewport').height()), 0.1, 1000 );

    renderer = new THREE.WebGL1Renderer({
        canvas: document.getElementById("viewport"),
        alpha: true
    });

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize($('#viewport').width(), $('#viewport').height());

    camera.position.setZ(25);

    let texture = new THREE.TextureLoader().load( '../model/texture/FibraDiCarbonio.jpg' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 24, 24 )
    const material = new THREE.MeshBasicMaterial( { map: texture } );

    const objLoader = new OBJLoader()
    obj = await objLoader.loadAsync('../model/rocket.obj')

    obj.rotation.x = (90*(Math.PI/180))
    obj.scale.set(0.6,0.6,0.6)

    obj.traverse(function (child) {
        if ((child).isMesh) {
            (child).material = material
        }
    })

    scene.add(obj)
    renderer.render( scene, camera );
}

function rotate(x,y,z){
    obj.rotation.x = (x*(Math.PI/180));
    obj.rotation.y = (y*(Math.PI/180));
    obj.rotation.z = (z*(Math.PI/180));

    renderer.render(scene, camera);
}

await ViewportDraw()

$(window).resize(async function(){
    $('#viewport').width($('#viewport-container').width());
    $('#viewport').height($('#viewport').width());
    await ViewportDraw()
});

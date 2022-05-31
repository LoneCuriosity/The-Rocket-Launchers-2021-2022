import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.123.0/build/three.module.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.123.0/examples/jsm/loaders/OBJLoader.js';

var packet, Packets = [], SecPackets = [], InitCharFound = false, TempString = "", XAccelerationData = [], YAccelerationData = [], ZAccelerationData = [], ZVelocityData = [], PreviousZVelocity = 0;

const AccelerationChart = new Chart(document.getElementById("AccelerationChart"), {
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
            },
            {
                data: ZAccelerationData,
                borderColor: 'rgb(100,120,255)',
                tension: 0.3
            }
        ]
    },
    options: customOptions("Acceleration vs Time","Acceleration",-10)
});

let VelocityChart = new Chart(document.getElementById("VelocityChart"), {
    type: 'line',
    data: {
        datasets: [
            {
                data: ZVelocityData,
                borderColor: 'rgb(100,120,255)',
                tension: 0.3
            }
        ]
    },
    options: customOptions("Velocity vs Time","Velocity",0)
});

document.getElementById("link").addEventListener('click', async function() {
    //navigator.serial.getPorts().then((ports) => {
    //    console.log(ports[0].getInfo())
    //});
    navigator.serial.requestPort({ filters: [{ usbVendorId: 9025, usbProductId: 67 }]}).then(async (port) => {
        await port.open({ baudRate: 9600 })

        //const writer = port.writable.getWriter();
        //const encoder = new TextEncoder()
        //await writer.write(encoder.encode("AT+PARAMETER=10,7,1,7\r\n"));
        //writer.close();
        //writer.releaseLock();

        let textDecoder = new TextDecoderStream();
        port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        while(port.readable){
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }

                    value.split("").forEach(char => {
                        if(InitCharFound){
                            if(char == "+"){
                                packet = TempString.split(",")
                                console.log(packet)
                                InitCharFound = false
                                TempString = ""
                            } else {
                                TempString += char
                            }
                        }
                        
                        if(char == ":"){
                            InitCharFound = true
                        }
                    });
                    
                    const packetTemplate = ({Date, Lat, Lon, Alt, Speed, Sats, }) => `
                            <p class="pl-2 text-white">Packet Received - [${Date}]</p>
                            <div class="flex flex-row">
                                <ul>
                                    <li><p class="pl-2 text-white">- Latitude: ${Lat}</p></li>
                                    <li><p class="pl-2 text-white">- Longitude: ${Lon}</p></li>
                                    <li><p class="pl-2 text-white">- Altitude: ${Alt}ft</p></li>
                                </ul>
                                <ul>
                                    <li><p class="pl-2 text-white">- Speed: ${Speed}Kn</p></li>
                                    <li><p class="pl-2 text-white">- Satellites: ${Sats}</p></li>
                                </ul>
                            </div>`;

                    const packetToObject = (packet) => {
                        return { Date: `${packet[3]}/${packet[4]}/${packet[2]} - ${packet[5]}:${packet[6]}:${packet[7]}`, Lat: packet[15], Lon: packet[16], Alt: packet[18], Speed: packet[17], Sats: packet[19]}
                    }
                
                    if(packet[0] == "RCV=1"){
                        packet = packet.filter(e => (e != "" && !isNaN(e)) );
                        if(Packets.length < 5){
                            Packets.push(packet)
                        } else {
                            Packets.shift(packet)
                            Packets.push(packet)
                        }

                        if((SecPackets.length < 20) && (SecPackets[SecPackets.length-1] == undefined || (SecPackets[SecPackets.length-1][6] != packet[6]))){
                            SecPackets.push(packet)
                        } else if(SecPackets[SecPackets.length-1][6] != packet[6]){
                            SecPackets.shift(packet)
                            SecPackets.push(packet)
                        }
                          
                        XAccelerationData = SecPackets.map((packet) => {
                            return {x: `${packet[1]}-${packet[2].padStart(2, '0')}-${packet[3].padStart(2, '0')} ${packet[4].padStart(2, '0')}:${packet[5].padStart(2, '0')}:${packet[6].padStart(2, '0')}`, y: packet[7].trim()}
                        })

                        YAccelerationData = SecPackets.map((packet) => {
                            return {x: `${packet[1]}-${packet[2].padStart(2, '0')}-${packet[3].padStart(2, '0')} ${packet[4].padStart(2, '0')}:${packet[5].padStart(2, '0')}:${packet[6].padStart(2, '0')}`, y: packet[8].trim()}
                        })

                        ZAccelerationData = SecPackets.map((packet) => {
                            return {x: `${packet[1]}-${packet[2].padStart(2, '0')}-${packet[3].padStart(2, '0')} ${packet[4].padStart(2, '0')}:${packet[5].padStart(2, '0')}:${packet[6].padStart(2, '0')}`, y: packet[9].trim()}
                        })

                        parseFloat((packet[10].trim()) > 30 || parseFloat(packet[10].trim()) < -30) && console.log(packet)
                        
                        AccelerationChart["config"]["data"]["datasets"][0]["data"] = XAccelerationData
                        AccelerationChart["config"]["data"]["datasets"][1]["data"] = YAccelerationData
                        AccelerationChart["config"]["data"]["datasets"][2]["data"] = ZAccelerationData
                        AccelerationChart.update()

                        ZVelocityData = SecPackets.map((packet) => {
                            let p = {x: `${packet[1]}-${packet[2].padStart(2, '0')}-${packet[3].padStart(2, '0')} ${packet[4].padStart(2, '0')}:${packet[5].padStart(2, '0')}:${packet[6].padStart(2, '0')}`, y: PreviousZVelocity}
                            PreviousZVelocity = (PreviousZVelocity + (parseFloat(packet[9].trim())*1))
                            return p
                        })

                        VelocityChart["config"]["data"]["datasets"][0]["data"] = ZVelocityData
                        VelocityChart.update()

                        //$('#Console').html(Packets.map(packetToObject).map(packetTemplate).join(''));
                    }
                }
            } catch (error) {
              console.log(error)
            }          
        }
    }).catch((e) => {
        console.log(e)
    });
})

function customOptions(title, yAxis, min){
    return {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            y: {
                title: {
                    display: true,
                    text: yAxis
                },
                ticks: {
                    min: min
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

/*let XAccelerationData = [
    {x: new Date(), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+5), y: 30},
    {x: new Date().setMinutes(new Date().getMinutes()+10), y: 10},
    {x: new Date().setMinutes(new Date().getMinutes()+20), y: -205},
    {x: new Date().setMinutes(new Date().getMinutes()+30), y: 25}
]*/

/*let YAccelerationData = [
    {x: new Date(), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+5), y: 10},
    {x: new Date().setMinutes(new Date().getMinutes()+10), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+20), y: -15},
    {x: new Date().setMinutes(new Date().getMinutes()+30), y: 5}
]*/

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
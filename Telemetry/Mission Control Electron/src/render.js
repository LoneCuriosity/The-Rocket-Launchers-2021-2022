var opts = {
    angle: -0.50, // The span of the gauge arc
    lineWidth: 0.15, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.6, // // Relative to gauge radius
        strokeWidth: 0.035, // The thickness
        color: '#000000' // Fill color
    },
    limitMax: false,     // If false, max value increases automatically if value > maxValue
    limitMin: false,     // If true, the min value of the gauge will be fixed
    colorStart: '#FFFFFF',   // Colors
    colorStop: '#FFFFFF',    // just experiment with them
    strokeColor: '#FFFFFF',  // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    renderTicks: {
        divisions: 5,
        divWidth: 1.1,
        divLength: 0.7,
        divColor: "#333333",
        subDivisions: 3,
        subLength: 0.5,
        subWidth: 0.6,
        subColor: "#666666"
    }
};

var target = document.getElementById('gauge-test'); // your canvas element
var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
gauge.maxValue = 360; // set max gauge value
gauge.minValue = 0;  // Prefer setter over gauge.minValue = 0
gauge.animationSpeed = 32; // set animation speed (32 is default value)

var target1 = document.getElementById('gauge-test1'); // your canvas element
var gauge1 = new Gauge(target1).setOptions(opts); // create sexy gauge!
gauge1.maxValue = 360; // set max gauge value
gauge1.minValue = 0;  // Prefer setter over gauge.minValue = 0
gauge1.animationSpeed = 32; // set animation speed (32 is default value)

var target2 = document.getElementById('gauge-test2'); // your canvas element
var gauge2 = new Gauge(target2).setOptions(opts); // create sexy gauge!
gauge2.maxValue = 360; // set max gauge value
gauge2.minValue = 0;  // Prefer setter over gauge.minValue = 0
gauge2.animationSpeed = 32; // set animation speed (32 is default value)

setInterval(() => {
    gauge.set(Math.floor(Math.random() * 361)); // set actual value
}, 3000);
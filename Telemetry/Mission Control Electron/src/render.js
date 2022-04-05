let options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
        y: {
            title: {
                display: true,
                text: "Acceleration"
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
            text: "Acceleration vs Time"
        }
    }
}

let XAccelerationData = [
    {x: new Date(), y: 20},
    {x: new Date().setMinutes(new Date().getMinutes()+5), y: 30},
    {x: new Date().setMinutes(new Date().getMinutes()+10), y: 10},
    {x: new Date().setMinutes(new Date().getMinutes()+20), y: -5},
    {x: new Date().setMinutes(new Date().getMinutes()+30), y: 25}
]

let AccChart = new Chart(document.getElementById("AccelerationChart"), {
    type: 'line',
    data: {
        datasets: [
            {
                data: XAccelerationData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.3
            }
        ]
    },
    options: options
});

var AttitudeIndicator = $.flightIndicator('#attitude', 'attitude');
var AltimeterIndicator = $.flightIndicator('#altimeter', 'altimeter');
var HeadingIndicator = $.flightIndicator('#heading', 'heading');
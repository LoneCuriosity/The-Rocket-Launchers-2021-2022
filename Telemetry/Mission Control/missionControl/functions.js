export function drawOverlay(ctx, canvas, radius) {
  ctx.restore();
  ctx.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
  var ang;
  var num;
  ctx.fillStyle = 'white';
  ctx.font = radius*0.1 + "px arial";
  ctx.textBaseline="end";
  ctx.textAlign="center";

  for(num = 1; num < 21; num++){
    ang = num * Math.PI / 10;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    ctx.fillRect(0, 0, 2, 15)
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }

  for(num = 1; num < 21; num++){
    ang = num * Math.PI / 10;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.9);
    ctx.fillText((num*18).toString(), 0, 0);
    ctx.translate(0, radius*0.9);
    ctx.rotate(-ang);
  }
}

export function CustomOptions(title, YLabel){
  return {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      y: {
        title: {
          display: true,
          text: YLabel
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
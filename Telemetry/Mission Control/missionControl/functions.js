function drawOverlay(ctx, canvas, radius) {
    ctx.restore();
    ctx.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
    var ang;
    var num;
    ctx.fillStyle = 'white';
    ctx.font = radius*0.09 + "px arial";
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
      ctx.translate(0, -radius*0.88);
      ctx.fillText((num*18).toString(), 0, 0);
      ctx.translate(0, radius*0.88);
      ctx.rotate(-ang);
    }
  }

  export default drawOverlay
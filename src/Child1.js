import React, { useEffect, useRef } from "react";

const Child1 = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

     
      ctx.clearRect(0, 0, canvas.width, canvas.height);

     
      const width = canvas.width;
      const height = canvas.height;
      const padding = 50;

    
      const maxPrice = Math.max(...data.map((point) => Math.max(point.open, point.close)));
      const minPrice = Math.min(...data.map((point) => Math.min(point.open, point.close)));

     
      const scaleY = (value) => ((value - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
      const scaleX = (index) => (index / (data.length - 1)) * (width - 2 * padding);

     
      ctx.strokeStyle = "#ddd";
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * (height - 2 * padding);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

     
      ctx.strokeStyle = "#000";
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

     
      ctx.strokeStyle = "blue";
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding + scaleX(index);
        const y = height - padding - scaleY(point.open);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

     
      ctx.strokeStyle = "red";
      ctx.beginPath();
      data.forEach((point, index) => {
        const x = padding + scaleX(index);
        const y = height - padding - scaleY(point.close);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
  }, [data]);

  return <canvas ref={canvasRef} width="600" height="400" />;
};

export default Child1;

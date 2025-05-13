import React, { useRef, useEffect, useState } from 'react';
import type {Positions} from "../types";

const Canvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prevPos, setPrevPos] = useState<Positions[]>([]);

    const startDrawing = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        setPrevPos([{ x: offsetX, y: offsetY }]);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;

        const { offsetX, offsetY } = e.nativeEvent;
        const newPoint = { x: offsetX, y: offsetY };

        setPrevPos(prev => {
            const newPoints = [...prev, newPoint];

            const ctx = canvasRef.current!.getContext('2d');
            if (ctx && newPoints.length > 1) {
                const prevPoint = newPoints[newPoints.length - 2];
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(newPoint.x, newPoint.y);
                ctx.stroke();
            }

            return newPoints;
        });
    };



    console.log(prevPos)

    const stopDrawing = () => {
        setIsDrawing(false);
        setPrevPos([]);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = 'black';
            }
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{ border: '1px solid black' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
};

export default Canvas;


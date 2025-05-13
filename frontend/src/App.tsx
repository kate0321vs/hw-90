import React, { useRef, useEffect, useState } from 'react';
import type { IncomingPositions, Positions } from "../types";

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prevPos, setPrevPos] = useState<Positions[]>([]);

    const ws = useRef<WebSocket | null>(null);

    const drawing = (context: CanvasRenderingContext2D | null, newPoint: Positions) => {
        setPrevPos(prev => {
            const newPoints = [...prev, newPoint];
            if (context && newPoints.length > 1) {
                const prevPoint = newPoints[newPoints.length - 2];
                context.beginPath();
                context.moveTo(prevPoint.x, prevPoint.y);
                context.lineTo(newPoint.x, newPoint.y);
                context.stroke();
            }
            return newPoints;
        });
    }

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/canvas`);

        ws.current.onclose = () => console.log('ws closed');

        ws.current.onmessage = event => {
            const decodedMessage = JSON.parse(event.data) as IncomingPositions;

            if (decodedMessage.type === 'DRAW') {
                const newPoint = decodedMessage.payload;
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                drawing(context, newPoint);
            }
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const startDrawing = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = e.nativeEvent;
        setPrevPos([{ x: offsetX, y: offsetY }]);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;

        const { offsetX, offsetY } = e.nativeEvent;
        const newPoint = { x: offsetX, y: offsetY };

        if (!ws.current) return;

        ws.current.send(JSON.stringify({
            type: "DRAW",
            payload: newPoint,
        }));
        const context = canvasRef.current!.getContext('2d');

        drawing(context, newPoint);
    };

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

export default App;


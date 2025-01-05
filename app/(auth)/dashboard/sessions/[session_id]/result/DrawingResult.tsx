import React, { useEffect, useRef, useState } from 'react';

interface Path {
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

const DrawingResult = ({ answerContent }: { answerContent: { paths: Path[] } }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (canvas && container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;

            canvas.width = containerWidth;
            canvas.height = containerHeight;

            setScale(containerWidth / canvas.width);

            drawPaths();
        }
    };

    const drawPaths = () => {
        const canvas = canvasRef.current;
        if (!canvas || !answerContent?.paths) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.lineCap = 'round';
        context.lineJoin = 'round';

        answerContent.paths.forEach(path => {
            if (path.points.length < 2) return;

            context.beginPath();
            context.moveTo(path.points[0].x * scale, path.points[0].y * scale);
            path.points.forEach(point => {
                context.lineTo(point.x * scale, point.y * scale);
            });
            context.strokeStyle = path.color;
            context.lineWidth = path.width * scale;
            context.stroke();
        });
    };

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        drawPaths();
    }, [answerContent, scale]);

    return (
        <div ref={containerRef} className="w-full h-full">
            <canvas
                ref={canvasRef}
                className="w-full h-full border border-gray-300 rounded-md"
            />
        </div>
    );
};

export default DrawingResult;
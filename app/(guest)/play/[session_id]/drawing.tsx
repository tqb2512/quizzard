import { TimeBar } from "@/components/time-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useRef, useState } from "react";

interface DrawingQuestionProps {
    p_id: string;
    session_id: string;
    question: any;
}

interface Point {
    x: number
    y: number
}

interface Path {
    points: Point[]
    color: string
    width: number
}

export function DrawingQuestion({ p_id, session_id, question }: DrawingQuestionProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(question.time);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState<Path[]>([]);
    const [currentPath, setCurrentPath] = useState<Path>({ points: [], color: '#000000', width: 2 });
    const [color, setColor] = useState('#000000');
    const [width, setWidth] = useState(2);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        setIsSubmitted(false);
        setTimeLeft(question.time);
    }, [question.id]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft((prevTime: number) => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            if (!isSubmitted)
                handleSubmit();
        }
    }, [timeLeft, isSubmitted]);

    const resizeCanvas = useCallback(() => {
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

            const context = canvas.getContext('2d');
            if (context) {
                context.lineCap = 'round';
                context.lineJoin = 'round';
            }

            drawPaths();
        }
    }, []);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    useEffect(() => {
        drawPaths();
    }, [paths]);

    const handleSubmit = () => {
        setIsSubmitted(true);
        createClient()
            .channel(`game_session:${session_id}`)
            .send({
                type: "broadcast",
                event: "submit_answer",
                payload: {
                    p_id,
                    question_id: question.id,
                    answer_type: "drawing",
                    answer_data: {
                        paths: paths
                    },
                    time_left: timeLeft,
                }
            });
    };

    const drawPath = useCallback((path: Path) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context || path.points.length < 2) return;

        context.beginPath();
        context.moveTo(path.points[0].x, path.points[0].y);
        path.points.forEach((point) => {
            context.lineTo(point.x, point.y);
        });
        context.strokeStyle = path.color;
        context.lineWidth = path.width;
        context.stroke();
    }, []);

    const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        return { x, y };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const point = getCanvasPoint(e);
        setIsDrawing(true);
        setCurrentPath({ points: [point], color, width });
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const point = getCanvasPoint(e);
        setCurrentPath(prev => {
            const newPath = {
                ...prev,
                points: [...prev.points, point]
            };
            drawPath(newPath);
            return newPath;
        });
    };

    const endDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            setPaths(prev => [...prev, currentPath]);
        }
    };

    const drawPaths = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!context) return;

        if (canvas)
            context.clearRect(0, 0, canvas.width, canvas.height);
        paths.forEach(drawPath);
    };

    return (
        <Card className="h-[70vh] w-2/3">
            <CardHeader className="justify-between items-center h-[15%]">
                <div className="w-full top-0">
                    <TimeBar totalTime={question.time} timeLeft={timeLeft} />
                </div>
                <CardTitle className="text-xl sm:text-4xl font-bold text-primary">
                    {question.question_text}
                </CardTitle>
                <div />
            </CardHeader>
            <CardContent className="h-[70%] flex flex-col justify-center items-center space-y-4">
                <div ref={containerRef} className="w-full h-full">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={isSubmitted ? undefined : draw}
                        onMouseUp={endDrawing}
                        onMouseOut={endDrawing}
                        className="border border-gray-300 w-full h-full"
                    />
                </div>
            </CardContent>
            <CardFooter className="h-[15%] justify-end items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="color">Color:</Label>
                    <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-8"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="width">Width:</Label>
                    <Input
                        id="width"
                        type="number"
                        min={1}
                        max={20}
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-16"
                    />
                </div>
                <Button
                    disabled={isSubmitted}
                    size="lg"
                    className="bg-yellow-300 hover:bg-yellow-400 text-black"
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </CardFooter>
        </Card>
    );
}
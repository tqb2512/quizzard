import { TimeBar } from "@/components/time-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface MultipleChoiceQuestionProps {
    p_id: string;
    session_id: string;
    question: any;
}

export function MultipleChoiceQuestion({ p_id, session_id, question }: MultipleChoiceQuestionProps) {

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(question.time);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted) {
            const timer = setTimeout(() => {
                setTimeLeft((prevTime: number) => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isSubmitted) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted]);

    const handleSubmit = () => {
        console.log(selected);
        setIsSubmitted(true);
        createClient()
            .channel(`game_session:${session_id}`)
            .send({
                type: "broadcast",
                event: "submit_answer",
                payload: {
                    p_id,
                    question_id: question.id,
                    answer_type: "multiple_choice",
                    answer_data: {
                        answer_id: selected,
                    },
                    time_left: timeLeft,
                }
            });
    }

    return (
        <Card className="h-[70vh] w-2/3">
            <CardHeader className="justify-between items-center h-2/5">
                <div className="w-full top-0">
                    <TimeBar totalTime={question.time} timeLeft={timeLeft} />
                </div>
                <CardTitle className="text-xl sm:text-4xl font-bold text-primary">
                    {question.question_text}
                </CardTitle>
                <div />
            </CardHeader>
            <CardContent className="h-1/2 flex flex-row justify-between space-x-4">
                {question.answers.map((answer: any) => (
                    <Button
                        disabled={isSubmitted}
                        key={answer.id}
                        className={`h-full w-full bg-gray-300 hover:bg-gray-400 rounded-lg flex flex-col justify-center items-center ${selected === answer.id ? 'bg-yellow-400 hover:bg-yellow-500' : ''}`}
                        onClick={() => setSelected(answer.id)} >
                        <Label className="text-3xl font-medium text-black">{answer.answer_text}</Label>
                    </Button>
                ))}
            </CardContent>
            <CardFooter className="justify-end items-center">
                <Button
                    disabled={isSubmitted}
                    size="lg"
                    className="bg-yellow-300 hover:bg-yellow-400 text-black"
                    onClick={handleSubmit}
                >Submit</Button>
            </CardFooter>
        </Card>
    );
}
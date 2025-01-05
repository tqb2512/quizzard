import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { X } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { TimeBar } from "@/components/time-bar";

interface MatchingQuestionProps {
    p_id: string;
    session_id: string;
    question: any;
}

interface Match {
    answerId: string;
    answerText: string;
    matchingText: string;
}

export function MatchingQuestion({ p_id, session_id, question }: MatchingQuestionProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isShowAnswer, setIsShowAnswer] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [randomizedMatching, setRandomizedMatching] = useState<any[]>([]);
    const [timeLeft, setTimeLeft] = useState(question.time);

    useEffect(() => {
        setIsSubmitted(false);
        setIsShowAnswer(false);
        setSelected(null);
        setMatches([]);
        setTimeLeft(question.time);
        setRandomizedMatching([...question.answers].sort(() => Math.random() - 0.5));
    }, [question.id]);

    useEffect(() => {
        setRandomizedMatching([...question.answers].sort(() => Math.random() - 0.5));
    }, [question.answers]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft((prevTime: number) => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            if (!isSubmitted)
                handleSubmit();
            setIsShowAnswer(true);
        }
    }, [timeLeft, isSubmitted]);

    const handleAnswerClick = (answerText: string) => {
        setSelected(answerText);
    };

    const handleMatchingClick = (matchingText: string, answerId: string) => {
        if (selected) {
            const newMatch: Match = { answerText: selected, matchingText, answerId };
            setMatches([...matches, newMatch]);
            setSelected(null);
        }
    };

    const isMatched = (text: string) => {
        return matches.some(match => match.answerText === text || match.matchingText === text);
    };

    const getMatchedAnswer = (matchingText: string) => {
        const match = matches.find(m => m.matchingText === matchingText);
        return match ? match.answerText : null;
    };

    const handleDeleteMatch = (matchingText: string) => {
        setMatches(matches.filter(match => match.matchingText !== matchingText));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        console.log(matches);
        createClient()
            .channel(`game_session:${session_id}`)
            .send({
                type: "broadcast",
                event: "submit_answer",
                payload: {
                    p_id,
                    question_id: question.id,
                    answer_type: "matching",
                    answer_data: matches,
                    time_left: timeLeft
                }
            });
    };

    return (
        <Card className="h-[70vh] w-full max-w-4xl mx-auto">
            <CardHeader className="justify-between items-center h-2/5">
                <div className="w-full top-0">
                    <TimeBar totalTime={question.time} timeLeft={timeLeft} />
                </div>
                <CardTitle className="text-xl sm:text-4xl font-bold text-primary">
                    {question.question_text}
                </CardTitle>
                <div />
            </CardHeader>
            <CardContent className="h-1/2 flex flex-col space-y-4">
                <div className="w-full h-1/2 flex flex-row space-x-4">
                    {question.answers.map((answer: any) => (
                        <Button
                            disabled={isSubmitted}
                            key={answer.id}
                            onClick={() => !isMatched(answer.answer_text) && handleAnswerClick(answer.answer_text)}
                            className={`h-full w-full bg-yellow-400 hover:bg-yellow-500 rounded-lg flex flex-col justify-center items-center p-2
                                ${selected === answer.answer_text ? 'ring-2 ring-blue-500' : ''}
                                ${isMatched(answer.answer_text) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <Label className="text-lg sm:text-xl font-medium text-black text-center">{answer.answer_text}</Label>
                        </Button>
                    ))}
                </div>
                <div className="w-full h-1/2 flex flex-row space-x-4">
                    {randomizedMatching.map((answer: any) => (
                        <div
                            key={answer.id}
                            onClick={() => !isMatched(answer.answer_specific_data.matching_text) && handleMatchingClick(answer.answer_specific_data.matching_text, answer.id)}
                            className={`h-full w-full bg-gray-300 hover:bg-gray-400 rounded-lg flex flex-col justify-center items-center p-2 relative
                                ${isMatched(answer.answer_specific_data.matching_text) ? 'opacity-50' : 'cursor-pointer'}
                            `}
                        >
                            <Label className="text-lg sm:text-xl font-medium text-black text-center">{answer.answer_specific_data.matching_text}</Label>
                            {isMatched(answer.answer_specific_data.matching_text) && (
                                <>
                                    <Label className="text-sm sm:text-base font-medium text-blue-600 mt-2 text-center">
                                        {getMatchedAnswer(answer.answer_specific_data.matching_text)}
                                    </Label>
                                    {
                                        isShowAnswer &&
                                        <Label className="text-sm sm:text-base font-medium text-green-400 mt-1 text-center">
                                            {answer.answer_text}
                                        </Label>
                                    }
                                    <Button
                                        disabled={isSubmitted}
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMatch(answer.answer_specific_data.matching_text);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Delete match</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="justify-end items-center">
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
    )
}


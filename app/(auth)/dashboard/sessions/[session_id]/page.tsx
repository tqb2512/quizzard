"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Ban, Play, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { time } from "console";
import { TimeBar } from "@/components/time-bar";

interface Session {
    id: string;
    created_at: string;
    game_id: string;
    session_data: Record<string, unknown>;
    status: string;
    start_time: string;
    end_time: string | null;
    creator_id: string;
    games: Game;
    participants: Participant[];
}

interface Game {
    id: string;
    title: string;
    settings: GameSettings;
    questions: Question[];
    created_at: string;
    creator_id: string;
    has_answer: boolean;
    description: string;
}

interface GameSettings {
    game_mode: string;
    time_limit: number;
    show_answers: boolean;
    randomize_questions: boolean;
}

interface Question {
    id: string;
    time: number | null;
    index: number;
    answers: Answer[];
    game_id: string;
    media_content: string | null;
    question_text: string;
    question_type: string;
    question_specific_data: Record<string, unknown> | null;
}

interface Answer {
    id: string;
    is_correct: boolean;
    answer_text: string;
    question_id: string;
    answer_specific_data: Record<string, unknown> | null;
}

interface Participant {
    id: string;
    score: number;
    nickname: string;
    created_at: string;
    game_session_id: string;
    participant_answers: ParticipantAnswer[];
}

interface ParticipantAnswer {
    id: string;
    created_at: string;
    question_id: string;
    answer_content: string;
    participant_id: string;
}

export default function SessionDetailPage({ params }: { params: Promise<{ session_id: string }> }) {
    const router = useRouter();
    const toast = useToast();
    const [session, setSession] = useState<any | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (timeLeft && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft((prevTime: number) => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {

        }
    }, [timeLeft]);

    useEffect(() => {
        params.then(({ session_id }) => {
            const supabase = createClient();

            supabase
                .from("game_sessions")
                .select("*, games(*, questions(*, answers(*))), participants(*, participant_answers(*))")
                .eq("id", session_id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error(error);
                    } else {
                        if (data.status === "ended")
                            router.push(`/dashboard/sessions/${data.id}/result`);
                        else
                            setSession(data);
                    }
                });

            supabase
                .channel(`game_session:${session_id}`)
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "participants" }, (payload) => {
                    setSession((prev: any) => {
                        return {
                            ...prev,
                            participants: [...prev.participants, payload.new],
                        };
                    });
                })
                .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_sessions" }, (payload) => {
                    setSession((prev: any) => {
                        return {
                            ...prev,
                            ...payload.new,
                        };
                    });
                })
                .subscribe();
        });
    }, []);

    const renderAnswers = (answers: any[], question_type: string, questionId: string) => {
        switch (question_type) {
            case "multiple_choice":
                return (
                    <div className="space-y-2">
                        {answers.map((answer) => (
                            <div key={answer.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className={answer.is_correct ? "bg-green-300" : "bg-red-300"}>
                                        {answer.is_correct ? "Correct" : "Incorrect"}
                                    </Badge>
                                    <span className="text-sm">{answer.answer_text}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case "matching":
                return (
                    <div className="space-y-2">
                        {answers.map((answer) => (
                            <div key={answer.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{answer.answer_text}</Badge>
                                    <span className="text-sm">matches</span>
                                    <Badge variant="outline">{answer.answer_specific_data.matching_text}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case "drawing":
                return (
                    <div />
                )
            default:
                return <div className="text-sm text-muted-foreground">Unsupported question type</div>;
        }
    };

    const handleStartSession = () => {
        const supabase = createClient();

        supabase
            .from("game_sessions")
            .update({ status: "started" })
            .eq("id", session.id)
            .then(({ error }) => {
                if (error) {
                    console.error(error);
                } else {
                    toast.toast({
                        title: "Success",
                        description: "Session started successfully",
                    });
                }
            });

        supabase
            .channel(`game_session:${session.id}`)
            .on("broadcast", { event: "submit_answer" }, async (payload) => {
                const { data: p_data } = await createClient()
                    .from("participants")
                    .select("*")
                    .eq("id", payload.payload.p_id)
                    .single();

                console.log(p_data.score + 1);

                switch (payload.payload.answer_type) {
                    case "multiple_choice":
                        const questionMC = session.games.questions.find((question: any) => question.id === payload.payload.question_id);
                        const is_correctMC = questionMC.answers.find((answer: any) => answer.id === payload.payload.answer_data.answer_id).is_correct;
                        const scoreMC = payload.payload.time_left / questionMC.time * 100 * (is_correctMC ? 1 : 0);

                        console.log(scoreMC);

                        await createClient()
                            .from("participant_answers")
                            .insert({
                                question_id: payload.payload.question_id,
                                participant_id: payload.payload.p_id,
                                answer_content: payload.payload.answer_data,
                            });

                        await createClient()
                            .from("participants")
                            .update({
                                score: p_data.score + Math.round(scoreMC),
                            })
                            .eq("id", payload.payload.p_id);

                        break;
                    case "matching":
                        const questionM = session.games.questions.find((question: any) => question.id === payload.payload.question_id);
                        const matches = payload.payload.answer_data;
                        const correctMatches = questionM.answers.filter((answer: any) => {
                            const match = matches.find((match: any) => match.answerId === answer.id);
                            return match.matchingText === answer.answer_specific_data.matching_text;
                        });
                        //const is_correctM = correctMatches.length === questionM.answers.length;
                        const scoreM = payload.payload.time_left / questionM.time * correctMatches.length / questionM.answers.length * 100;


                        await createClient()
                            .from("participant_answers")
                            .insert({
                                question_id: payload.payload.question_id,
                                participant_id: payload.payload.p_id,
                                answer_content: payload.payload.answer_data,
                            })

                        await createClient()
                            .from("participants")
                            .update({
                                score: p_data + Math.round(scoreM),
                            })
                            .eq("id", payload.payload.p_id);

                        break;
                    case "drawing":
                        await createClient()
                            .from("participant_answers")
                            .insert({
                                question_id: payload.payload.question_id,
                                participant_id: payload.payload.p_id,
                                answer_content: payload.payload.answer_data,
                            })
                        break;
                    default:
                        break;
                }
            })
            .subscribe();
    };

    const changeCurrentQuestion = (questionId: string) => {
        const supabase = createClient();

        setTimeLeft(session.games.questions.find((question: any) => question.id === questionId).time);

        supabase
            .from("game_sessions")
            .update({
                session_data: {
                    current_question: questionId,
                    current_question_index: session.games.questions.find((question: any) => question.id === questionId).index,
                    completed_questions: [...session.session_data.completed_questions || [], questionId],
                }
            })
            .eq("id", session.id)
            .then(({ error }) => {
                if (error) {
                    console.error(error);
                } else {
                    toast.toast({
                        title: "Success",
                        description: "Question changed successfully",
                    });
                }
            });

        supabase
            .channel(`game_session:${session.id}`)
            .send({
                type: "broadcast",
                event: "question_change",
                payload: {
                    question: session.games.questions.find((question: any) => question.id === questionId),
                }
            });
    };

    const showLeaderboard = () => {
        const supabase = createClient();

        supabase
            .channel(`game_session:${session.id}`)
            .send({
                type: "broadcast",
                event: "leaderboard",
                payload: {
                    is_show_leaderboard: true,
                }
            });
    };

    if (!session) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 space-y-6 h-max">
            <Card className="w-full h-max">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-bold text-primary">
                        Session Controller
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div>
                            <span className="font-semibold">Session ID:</span> {session.id}
                        </div>
                        <div>
                            <span className="font-semibold">Short session ID:</span> {session.short_id}
                        </div>
                        <div>
                            <span className="font-semibold">Status:</span> {session.status}
                        </div>
                        <div>
                            <span className="font-semibold">Created At:</span> {new Date(session.created_at).toLocaleString()}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleStartSession}
                                disabled={session.status === "started"}
                            >
                                <Play className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                    await createClient().from("game_sessions").update({ status: "ended" }).eq("id", session.id);
                                }}
                            >
                                <Ban className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    changeCurrentQuestion(session.games.questions.find((question: any) => question.index === session.session_data.current_question_index - 1).id);
                                }}
                                disabled={session.session_data.current_question_index ? session.session_data.current_question_index === 0 : true}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    changeCurrentQuestion(session.games.questions.find((question: any) => question.index === session.session_data.current_question_index + 1).id);
                                }}
                                disabled={session.session_data.current_question_index ? session.session_data.current_question_index === session.games.questions.length - 1 : true}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={showLeaderboard}
                            >
                                <Trophy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-primary">Current Question</h1>
                        <div className="space-y-2">
                            <div className="font-semibold flex flex-row justify-between items-center space-x-2">
                                <h1 className="">Time:</h1>
                                {
                                    session.session_data.current_question &&
                                    <TimeBar totalTime={session.games.questions.find((question: any) => question.id === session.session_data.current_question).time} timeLeft={timeLeft} />
                                }
                            </div>

                            <div className="space-x-2">
                                <span className="font-semibold">Question ID:</span> {session.session_data.current_question}
                            </div>

                            <div className="space-x-2">
                                <span className="font-semibold">Question:</span> {session.session_data.current_question && session.games.questions.find((question: any) => question.id === session.session_data.current_question).question_text}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="w-full h-max">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-bold text-primary">
                        Questions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {session.games.questions
                        .sort((a: any, b: any) => a.index - b.index)
                        .map((question: any, index: any) => (
                            <Card key={question.id} className="border border-secondary">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-semibold flex justify-between items-center">
                                        <span>{question.question_text}</span>
                                        <Badge>{question.question_type}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {renderAnswers(question.answers, question.question_type, question.id)}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="space-x-2">

                                    </div>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => changeCurrentQuestion(question.id)}
                                            disabled={session.session_data.completed_questions ? session.session_data.completed_questions.includes(question.id) : false}
                                        >
                                            <Play className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                </CardContent>
            </Card>
            <Card className="w-full h-max">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-bold text-primary">
                        Participants
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-x-2">
                    {session.participants.map((participant: any) => (
                        <Badge key={participant.id} variant="outline" className="bg-secondary">
                            {participant.nickname}
                        </Badge>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}


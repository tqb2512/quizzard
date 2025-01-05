"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

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

    const [session, setSession] = useState<any>();
    const [selectedParticipant, setSelectedParticipant] = useState<any>();

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
                        setSession(data);
                        console.log(data);
                    }
                });
        });
    }, []);

    const renderAnswers = (answers: any[], question_type: string, questionId: string) => {
        switch (question_type) {
            case "multiple_choice":
                return (
                    <div className="space-y-2">
                        {answers.map((answer) => {
                            const isSelected = selectedParticipant?.participant_answers.find((pa: any) => pa.question_id === questionId)?.answer_content.answer_id === answer.id;
                            const isCorrect = answer.is_correct;
                            const badgeColor = isCorrect ? "bg-green-300" : "bg-red-300";

                            return (
                                <div key={answer.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className={badgeColor}>
                                            {isCorrect ? "Correct" : "Incorrect"}
                                        </Badge>
                                        <span className="text-sm">{answer.answer_text}</span>
                                    </div>
                                    {isSelected && <Check />}
                                </div>
                            );
                        })}
                    </div>
                );
            case "matching":
                return (
                    <div className="space-y-2">
                        {answers.map((answer) => {
                            const participantAnswer = selectedParticipant?.participant_answers.find((pa: any) => pa.question_id === questionId)?.answer_content.find((ac: any) => ac.answerId === answer.id)?.matchingText;

                            return (
                                <div key={answer.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline" onClick={() => console.log(participantAnswer)}>{answer.answer_text}</Badge>
                                        <span className="text-sm">matches</span>
                                        <Badge variant="outline">{answer.answer_specific_data.matching_text}</Badge>
                                    </div>
                                    {participantAnswer && <Badge variant="outline">{participantAnswer}</Badge>}
                                </div>
                            )
                        })}
                    </div>
                );
            default:
                return <div className="text-sm text-muted-foreground">Unsupported question type</div>;
        }
    };

    if (!session) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 space-y-6 h-max">
            <Card className="w-full h-max">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-bold text-primary">
                        Participants
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-x-2">
                    {session.participants
                        .sort((a: any, b: any) => b.score - a.score)
                        .map((participant: any) => (
                            <Badge
                                key={participant.id}
                                variant="outline"
                                className={`bg-secondary hover:cursor-pointer ${selectedParticipant?.id === participant.id ? "bg-yellow-500" : ""}`}
                                onClick={() => setSelectedParticipant(participant)}
                            >
                                {participant.nickname}
                            </Badge>
                        ))}
                </CardContent>
            </Card>
            {selectedParticipant &&
                <Card className="w-full h-max">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                        <CardTitle className="flex flex-row items-center justify-between w-full">
                            <h1 className="text-2xl font-bold text-primary">
                                Participant Answers
                            </h1>
                            <div className="flex items-center space-x-2">
                                <h1>
                                    Score:
                                </h1>
                                <Badge variant="outline" className="bg-secondary">
                                    {selectedParticipant?.score}
                                </Badge>
                            </div>
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
                                </Card>
                            ))}
                    </CardContent>
                </Card>}
        </div>
    )
}
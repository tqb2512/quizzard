"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EnterNickname } from './enter-nickname';
import { createClient } from '@/utils/supabase/client';
import { Badge } from '@/components/ui/badge';
import { MultipleChoiceQuestion } from './multiple-choice-question';
import { MatchingQuestion } from './matching-question';

const activities = [
    'enter-nickname',
    'waiting-game-start',
    'idle',
    'question',
    'answer',
    'leaderboard',
]

export default function PlayPage({ params }: { params: Promise<{ session_id: string }> }) {
    const [p_id] = useState(uuidv4());
    const [nickname, setNickname] = useState('');
    const [session, setSession] = useState<any | null>(null);
    const [currentActivity, setCurrentActivity] = useState('enter-nickname');
    const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);

    useEffect(() => {
        params.then(({ session_id }) => {
            const supabase = createClient();

            supabase
                .from('game_sessions')
                .select('*, participants(*)')
                .eq('id', session_id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error(error);
                        return;
                    }

                    setSession(data);
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
                .on("broadcast", { event: "question_change" }, (payload) => {
                    setCurrentQuestion(payload.payload.question);
                    console.log(payload.payload.question);
                })
                .on("broadcast", { event: "leaderboard" }, (payload) => {
                    
                })
                .subscribe();
        });
    }, []);

    useEffect(() => {
        console.log(currentQuestion);
    }, [currentQuestion]);

    const renderQuestion = (question: any) => {
        switch (question.question_type) {
            case 'multiple_choice':
                return <MultipleChoiceQuestion p_id={p_id} session_id={session.id} question={question} />;
            case 'matching':
                return <MatchingQuestion p_id={p_id} session_id={session.id} question={question} />;
            default:
                return <div>Unknown question type</div>;
        }
    }

    if (!session) {
        return (
            <div className="h-screen w-screen bg-blue-500 bg-pattern items-center justify-center flex">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (session.status == 'pending') {
        return (
            <div className="h-screen w-screen bg-blue-500 bg-pattern items-center justify-center flex">
                {currentActivity === 'enter-nickname' && (
                    EnterNickname({ p_id, session, nickname, setNickname, setCurrentActivity })
                )}
                {currentActivity === 'waiting-game-start' && (
                    <Card className="max-w-[500px]">
                        <CardHeader className="justify-center items-center">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                                Waiting for host to start the game
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-x-1 w-full">
                            {session.participants.map((participant: any) => (
                                <Badge key={participant.id} className={`text-center ${participant.id === p_id ? 'bg-yellow-400 text-black' : ''}`}>
                                    {participant.nickname}
                                </Badge>    
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-blue-500 bg-pattern items-center justify-center flex">
            {currentQuestion && renderQuestion(currentQuestion)}
        </div>
    )
}

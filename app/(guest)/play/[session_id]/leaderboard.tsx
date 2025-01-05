import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface LeaderboardProps {
    p_id: string;
    session_id: string;
}

interface Participant {
    id: string;
    nickname: string;
    score: number;
}

export default function Leaderboard({ p_id, session_id }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<Participant[]>([]);

    useEffect(() => {
        const supabase = createClient();

        supabase
            .from('participants')
            .select('*')
            .eq('game_session_id', session_id)
            .order('score', { ascending: false })
            .limit(10)
            .then(({ data, error }) => {
                if (error) {
                    console.error(error);
                    return;
                }
                setLeaderboard(data as Participant[]);
            });
    }, [session_id]);

    if (leaderboard.length === 0) {
        return null;
    }

    const currentParticipant = leaderboard.find(p => p.id === p_id);
    const currentParticipantRank = leaderboard.findIndex(p => p.id === p_id) + 1;

    return (
        <Card className="h-[70vh] w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="justify-between items-center h-1/6">
                <CardTitle className="text-2xl sm:text-4xl font-bold text-primary flex items-center">
                    Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent className="h-4/6 overflow-y-auto">
                {leaderboard.map((participant, index) => (
                    <div
                        key={participant.id}
                        className={`flex flex-row justify-between w-full p-3 rounded-lg mb-2 ${participant.id === p_id ? 'bg-yellow-500 text-yellow-900' : index % 2 === 0 ? 'bg-secondary' : 'bg-background'
                            }`}
                    >
                        <div className="flex flex-row items-center space-x-3">
                            <div className="text-xl font-semibold w-8">
                                {index === 0 && `${index + 1}`}
                                {index === 1 && `${index + 1}`}
                                {index === 2 && `${index + 1}`}
                                {index > 2 && `${index + 1}`}
                            </div>
                            <div className="font-medium">{participant.nickname}</div>
                        </div>
                        <div className="font-bold">{participant.score}</div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="h-1/6">
                <div
                    className={`flex flex-row justify-between w-full p-3 rounded-lg bg-yellow-500 text-yellow-900`}
                >
                    <div className="flex flex-row items-center space-x-3">
                        <div className="text-xl font-semibold w-8">
                            {currentParticipantRank}
                        </div>
                        <div className="font-medium">{currentParticipant?.nickname}</div>
                    </div>
                    <div className="font-bold">{currentParticipant?.score}</div>
                </div>
            </CardFooter>
        </Card>
    );
}


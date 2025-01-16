import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

interface EnterNicknameProps {
    p_id: string;
    session: any;
    nickname: string;
    setNickname: (nickname: string) => void;
    setCurrentActivity: (activity: string) => void;
}

export function EnterNickname({ p_id, session, nickname, setNickname, setCurrentActivity }: EnterNicknameProps) {
    return (
        <Card>
            <CardHeader className="justify-center items-center">
                <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                    Enter your nickname
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                />
                <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                    onClick={() => {
                        if (!nickname) {
                            alert("Please enter a nickname");
                            return;
                        }
                        createClient().from('participants').upsert({ id: p_id, nickname, game_session_id: session.id })
                            .then(() =>
                                setCurrentActivity('waiting-game-start')
                            );
                    }}>
                    START
                </Button>
            </CardContent>
        </Card >
    )
}
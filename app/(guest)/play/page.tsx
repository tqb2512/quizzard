"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PlayPage() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    return (
        <div className="h-screen w-screen bg-blue-500 bg-pattern items-center justify-center flex">
            <Card>
                <CardHeader className="justify-center items-center">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-primary">
                        Enter room code
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Input
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Enter room code"
                    />
                    <Button
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                        onClick={async () => {
                            await createClient()
                                .from('game_sessions')
                                .select()
                                .eq('short_id', roomCode)
                                .single()
                                .then(({ data }) => {
                                    if (!data) {
                                        alert('Room not found');
                                    } else {
                                        router.push(`play/${data.id}`);
                                    }
                                });
                        }}>
                        JOIN
                    </Button>
                </CardContent>
            </Card >
        </div>
    );
}
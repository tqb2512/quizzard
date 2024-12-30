"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Game {
    id: string;
    created_at: string;
    title: string;
    description: string;
    settings: {
        game_mode: string;
        time_limit: number;
        show_answers: boolean;
        randomize_questions: boolean;
    };
}

export default function GamesPage() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from("games")
                    .select("*")
                    .eq("creator_id", user.id);

                if (error) {
                    console.error(error);
                } else {
                    setGames(data);
                }
            }
            setLoading(false);
        };

        fetchGames();
    }, []);

    return (
        <div className="p-4 overflow-y-auto sm:p-6 space-y-6 lg:space-y-0 lg:flex lg:gap-6">
            <Card className="w-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Games</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading games...</p>
                    ) : games.length === 0 ? (
                        <p className="text-center text-gray-500">No games found. Create your first game!</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {games.map((game) => (
                                    <TableRow key={game.id}>
                                        <TableCell className="font-medium">{game.title}</TableCell>
                                        <TableCell>{game.description || "N/A"}</TableCell>
                                        <TableCell>{new Date(game.created_at).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`games/${game.id}`)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


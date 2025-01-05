"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";

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
    const [title, setTitle] = useState("");

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const gameData = {
            id: uuidv4(),
            title,
            description: "",
            creator_id: user.id,
        };

        const { error } = await supabase.from("games").insert(gameData);

        router.push(`games/${gameData.id}`);
    };

    return (
        <div className="p-4 overflow-y-auto sm:p-6 space-y-6 lg:space-y-0 lg:flex lg:gap-6">
            <Card className="w-full">
                <CardHeader className="pb-4 flex flex-row justify-between">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Games</CardTitle>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                Create Game
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create new game</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Game Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">Submit</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                                {games
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((game) => (
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


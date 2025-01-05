"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function SessionsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from("game_sessions")
                    .select("*, games(*)")
                    .eq("creator_id", user.id);

                if (error) {
                    console.error(error);
                } else {
                    setSessions(data);
                }
            }
            setLoading(false);
        };

        fetchSessions();
    }, []);

    return (
        <div className="p-4 overflow-y-auto sm:p-6 space-y-6 lg:space-y-0 lg:flex lg:gap-6">
            <Card className="w-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-primary">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-gray-500">No games found. Create your first session!</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>{session.games.title}</TableCell>
                                            <TableCell>{session.status}</TableCell>
                                            <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`sessions/${session.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
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


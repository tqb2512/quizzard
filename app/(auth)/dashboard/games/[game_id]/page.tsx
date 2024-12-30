"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AddAnswerDialog } from "./add-answer-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuizEditorPage({ params }: { params: Promise<{ game_id: string }> }) {
    const router = useRouter();
    const toast = useToast();
    const [game, setGame] = useState<any>();
    const [questions, setQuestions] = useState<any[] | null>();

    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("");

    useEffect(() => {
        params.then(({ game_id }) => {
            const supabase = createClient();

            supabase
                .from("games")
                .select("*")
                .eq("id", game_id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        console.error(error);
                        toast.toast({
                            title: "Error",
                            description: "Failed to load game data",
                            variant: "destructive",
                        });
                    }
                    setGame(data);
                });

            supabase
                .from("questions")
                .select("*, answers(*)")
                .eq("game_id", game_id)
                .then(({ data, error }) => {
                    if (error) {
                        console.error(error);
                        toast.toast({
                            title: "Error",
                            description: "Failed to load questions",
                            variant: "destructive",
                        });
                    }
                    setQuestions(data);
                });
        });
    }, []);

    const moveQuestion = async (index: number, direction: number) => {
        const supabase = createClient();

        const currentQuestion = questions?.find(q => q.index === index);
        const adjacentQuestion = questions?.find(q => q.index === index + direction);

        if (!currentQuestion || !adjacentQuestion || !questions) return;

        const updates = [
            {
                id: currentQuestion.id,
                index: index + direction
            },
            {
                id: adjacentQuestion.id,
                index: index
            }
        ];

        const { error } = await supabase
            .from('questions')
            .upsert(updates);

        if (error) {
            console.error(error);
            toast.toast({
                title: "Error",
                description: "Failed to move question",
                variant: "destructive",
            });
            return;
        }

        const updatedQuestions = questions.map(q => {
            if (q.id === currentQuestion.id) {
                return { ...q, index: index + direction };
            }
            if (q.id === adjacentQuestion.id) {
                return { ...q, index: index };
            }
            return q;
        });

        setQuestions(updatedQuestions);
        toast.toast({
            title: "Success",
            description: "Question moved successfully",
        });
    };

    const deleteAnswer = async (questionId: string, answerId: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from("answers")
            .delete()
            .eq("id", answerId);

        if (error) {
            console.error(error);
            toast.toast({
                title: "Error",
                description: "Failed to delete answer",
                variant: "destructive",
            });
        } else {
            setQuestions(questions?.map(q =>
                q.id === questionId
                    ? { ...q, answers: q.answers.filter((a: any) => a.id !== answerId) }
                    : q
            ) || null);
            toast.toast({
                title: "Success",
                description: "Answer deleted successfully",
            });
        }
    };

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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteAnswer(questionId, answer.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteAnswer(questionId, answer.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                );
            default:
                return <div className="text-sm text-muted-foreground">Unsupported question type</div>;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!questionText || !questionType) {
            toast.toast({
                title: "Error",
                description: "Question text and type are required",
                variant: "destructive",
            });
            return;
        }

        const supabase = createClient();

        const questionData = {
            game_id: game.id,
            question_text: questionText,
            question_type: questionType,
            index: questions ? questions.length : 0,
        };

        const { error } = await supabase.from("questions").insert(questionData);

        if (error) {
            console.error(error);
            toast.toast({
                title: "Error",
                description: "Failed to add question",
                variant: "destructive",
            });
        } else {
            setQuestionText("");
            setQuestionType("");
            toast.toast({
                title: "Success",
                description: "Question added successfully",
            });

            supabase
                .from("questions")
                .select("*, answers(*)")
                .eq("game_id", game.id)
                .then(({ data, error }) => {
                    if (error) {
                        console.error(error);
                        toast.toast({
                            title: "Error",
                            description: "Failed to load questions",
                            variant: "destructive",
                        });
                    }
                    setQuestions(data);
                });
        }
    }

    if (!game || !questions)
        return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="container mx-auto p-4 space-y-6 h-max">
            <Card className="w-full">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4">
                    <div>
                        <CardTitle className="text-2xl font-bold text-primary">
                            {game.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                    </div>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Question
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Question</DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="questionText">Question Text</Label>
                                        <Input id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="questionType">Question Type</Label>
                                        <Select value={questionType} onValueChange={setQuestionType} >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select question type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                <SelectItem value="matching">Matching</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit">Add Question</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {questions
                        .sort((a, b) => a.index - b.index)
                        .map((question, index) => (
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
                                    <AddAnswerDialog
                                        questionId={question.id}
                                        questionType={question.question_type}
                                        onAnswerAdded={() => {
                                            createClient()
                                                .from("questions")
                                                .select("*, answers(*)")
                                                .eq("game_id", game.id)
                                                .then(({ data, error }) => {
                                                    if (error) {
                                                        console.error(error);
                                                        toast.toast({
                                                            title: "Error",
                                                            description: "Failed to load questions",
                                                            variant: "destructive",
                                                        });
                                                    }
                                                    setQuestions(data);
                                                });
                                        }}
                                    />
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => moveQuestion(question.index, -1)}
                                            disabled={question.index === 0}
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => moveQuestion(question.index, 1)}
                                            disabled={question.index === questions.length - 1}
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const supabase = createClient();
                                                supabase
                                                    .from("questions")
                                                    .delete()
                                                    .eq("id", question.id)
                                                    .then(({ error }) => {
                                                        if (error) {
                                                            console.error(error);
                                                            toast.toast({
                                                                title: "Error",
                                                                description: "Failed to delete question",
                                                                variant: "destructive",
                                                            });
                                                        } else {
                                                            setQuestions(questions.filter(q => q.id !== question.id));
                                                            toast.toast({
                                                                title: "Success",
                                                                description: "Question deleted successfully",
                                                            });
                                                        }
                                                    });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                </CardContent>
            </Card>
        </div>
    );
}


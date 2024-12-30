"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast"
import { Plus } from 'lucide-react';

interface AddAnswerDialogProps {
    questionId: string;
    questionType: string;
    onAnswerAdded: () => void;
}

export function AddAnswerDialog({ questionId, questionType, onAnswerAdded }: AddAnswerDialogProps) {
    const toast = useToast();
    const [answerText, setAnswerText] = useState("");
    const [matchingText, setMatchingText] = useState("");
    const [isCorrect, setIsCorrect] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();

        const answerData = {
            question_id: questionId,
            answer_text: answerText,
            is_correct: questionType === "multiple_choice" ? isCorrect : false,
            answer_specific_data: questionType === "matching" ? { matching_text: matchingText } : null,
        };

        const { error } = await supabase.from("answers").insert(answerData);

        if (error) {
            console.error(error);
            toast.toast({
                title: "Error",
                description: "Failed to add answer",
                variant: "destructive",
            });
        } else {
            toast.toast({
                title: "Success",
                description: "Answer added successfully",
            });
            setAnswerText("");
            setMatchingText("");
            setIsCorrect(false);
            setIsOpen(false);
            onAnswerAdded();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Answer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Answer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="answerText">Answer Text</Label>
                        <Input
                            id="answerText"
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            required
                        />
                    </div>
                    {questionType === "matching" && (
                        <div className="space-y-2">
                            <Label htmlFor="matchingText">Matching Text</Label>
                            <Input
                                id="matchingText"
                                value={matchingText}
                                onChange={(e) => setMatchingText(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    {questionType === "multiple_choice" && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isCorrect"
                                checked={isCorrect}
                                onCheckedChange={(checked) => setIsCorrect(checked as boolean)}
                            />
                            <Label htmlFor="isCorrect">Correct Answer</Label>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button type="submit">Add Answer</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


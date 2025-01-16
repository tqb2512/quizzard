"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast"
import { Plus, Settings } from 'lucide-react';

interface QuestionSettingsDialogProps {
    questionId: string;
    questionType: string;
    question: any;
    onQuestionSettingsChanged: () => void;
}

export function QuestionSettingsDialog({ questionId, questionType, question, onQuestionSettingsChanged }: QuestionSettingsDialogProps) {
    const toast = useToast();
    const [timeLimit, setTimeLimit] = useState(question.time);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();

        const { error } = await supabase.from("questions").update({time: timeLimit}).match({id: questionId});

        if (error) {
            console.error(error);
            toast.toast({
                title: "Error",
                description: "Failed to update question settings",
                variant: "destructive",
            });
        } else {
            toast.toast({
                title: "Success",
                description: "Question settings updated successfully",
            });
            setIsOpen(false);
            onQuestionSettingsChanged();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Settings className="h-4 w-4"/> 
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Question Settings</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Time Limit</Label>
                        <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


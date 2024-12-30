"use client";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";


export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        
    }, []);

    return (
        <div className="p-4 overflow-y-auto sm:p-6 space-y-6 lg:space-y-0 lg:flex lg:gap-6">
            <Card className="w-full">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-primary"></CardTitle>
                </CardHeader>
                <CardContent>
                    
                </CardContent>
            </Card>
        </div>
    );
}


import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Leaderboard() {
    return (
        <Card className="h-[70vh] w-2/3">
            <CardHeader className="justify-between items-center h-2/5">
                <CardTitle className="text-xl sm:text-4xl font-bold text-primary">
                    Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent className="h-1/2 flex flex-row justify-between space-x-4">
                
            </CardContent>
            <CardFooter className="w-full">
                
            </CardFooter>
        </Card>
    );
}
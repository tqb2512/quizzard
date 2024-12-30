"use client";
export const runtime = 'edge';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard");
    }, [router]);

    return null;
}
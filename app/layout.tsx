import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "Quizzard",
    description: "Quizzard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
                <Toaster />
            </body>
        </html>
    );
}

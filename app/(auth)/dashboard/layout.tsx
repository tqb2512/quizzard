import { Header } from "@/components/header";
import { MenuSidebar } from "@/components/menu-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="w-full h-max">
            <Header />
            <div className="flex h-max overflow-hidden">
                <MenuSidebar />
                <SidebarInset className="flex-grow overflow-hidden bg-gray-100">
                    {children}
                </SidebarInset>
            </div>
        </div>
    );
}

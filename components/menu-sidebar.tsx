"use client";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { GalleryHorizontalEnd, Gamepad2 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Item = {
    name: string;
    url: string;
}

const menuItems: Item[] = [
    {
        name: "Games",
        url: "/dashboard/games",
    },
    {
        name: "Sessions",
        url: "/dashboard/sessions",
    }
]

const iconMap: { [key: string]: React.ElementType } = {
    Games: Gamepad2,
    Sessions: GalleryHorizontalEnd
}

export function MenuSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader>
                <h2 className="text-lg font-semibold">Quizzard Dashboard</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => {
                        const Icon = iconMap[item.name]
                        return (
                            <SidebarMenuItem key={item.name} className="px-2">
                                <SidebarMenuButton asChild isActive={pathname === item.url}>
                                    <Link href={item.url} className="flex items-center">
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}
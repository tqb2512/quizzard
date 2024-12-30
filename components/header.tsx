import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { SignOut } from '@/utils/actions/auth'
import { SidebarTrigger } from '@/components/ui/sidebar'

export async function Header() {
    const session = await createClient().auth.getUser()

    return (
        <header className="bg-white shadow border">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="">
                    <SidebarTrigger />
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700">{session?.data.user?.email}</span>
                    <form action={SignOut}>
                        <Button type="submit" variant="outline">
                            Logout
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
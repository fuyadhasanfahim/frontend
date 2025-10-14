import { AppSidebar } from '@/components/shared/sidebar/app-sidebar';
import { SiteHeader } from '@/components/shared/sidebar/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': 'calc(var(--spacing) * 72)',
                    '--header-height': 'calc(var(--spacing) * 12)',
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="sidebar" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-4 bg-stone-100">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

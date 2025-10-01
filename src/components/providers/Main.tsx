import { Toaster } from 'sonner';
import ReduxProvider from './ReduxProvider';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReduxProvider>
            {children}
            <Toaster position='bottom-right' />
        </ReduxProvider>
    );
}

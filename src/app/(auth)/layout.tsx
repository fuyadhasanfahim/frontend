import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="w-full min-h-dvh bg-stone-100">
            <div className="flex items-center justify-center min-h-dvh w-full p-10">
                {children}
            </div>
        </section>
    );
}

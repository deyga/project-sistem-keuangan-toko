

import { Head } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Dashboard" />

            {/* MAIN CONTENT */}
            <main className="p-4">
                {children}
            </main>
        </div>
    );
}

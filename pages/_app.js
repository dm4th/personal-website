import '../styles/globals.css';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { SupaContextProvider } from '@/lib/SupaContextProvider';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


export default function App({ Component, pageProps }) {
    const [supabase] = useState(() => createBrowserSupabaseClient())

    return (
        <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
            <SupaContextProvider>
                <Component {...pageProps} />
            </SupaContextProvider>
        </SessionContextProvider>
    );
}
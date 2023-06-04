import '../styles/globals.css';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { SupaContextProvider } from '@/lib/SupaContextProvider';


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
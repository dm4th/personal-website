import { useEffect, useState, createContext, useContext } from 'react';
import { useUser, useSessionContext } from '@supabase/auth-helpers-react';

const UserContext = createContext(undefined);

const SupaContextProvider = (props) => {
    const { session, isLoading: isLoadingUser, supabaseClient: supabase } = useSessionContext();
    const user = useUser();
    const accessToken = session?.access_token ?? null;
    const [loggedInRole, setLoggedInRole] = useState(null);
    const [isLoadingData, setIsloadingData] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [chatHistory, setChatHistory] = useState(null);

    const getUserDetails = () => 
        supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', user.id)
            .single();

    const getChatHistory = (role) => 
        supabase
            .from('profiles:chat_roles')
            .select('chats:*')
            .eq('id', user.id)
            .eq('role', role);

    useEffect(() => {
        if (user && !isLoadingData && !userDetails && !chatHistory) {
            setIsloadingData(true);
            setLoggedInRole('intro');
            Promise.allSettled([getUserDetails(), getChatHistory(loggedInRole)]).then(
                (results) => {
                    const userDetailsPromise = results[0];
                    const chatHistoryPromise = results[1];

                    if (userDetailsPromise.status === 'fulfilled')
                        setUserDetails(userDetailsPromise.value.data);

                    if (chatHistoryPromise.status === 'fulfilled' && chatHistoryPromise.value.data)
                        setChatHistory(chatHistoryPromise.value.data);

                    setIsloadingData(false);
                }
            );
        } else if (!user && !isLoadingUser && !isLoadingData) {
            setUserDetails(null);
            setChatHistory(null);
            setLoggedInRole(null);
        }
    }, [user, loggedInRole, isLoadingUser]);

    const value = {
        accessToken,
        user,
        loggedInRole,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
        chatHistory,
        supabaseClient: supabase,
    };

    console.log('value', value)

    return <UserContext.Provider value={value} {...props} />;
};

const useSupaUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error(`useSupaUser must be used within a SupaContextProvider.`);
    }
    return context;
};

export { SupaContextProvider, useSupaUser };

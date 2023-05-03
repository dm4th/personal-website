import { useEffect, useState, createContext, useContext } from 'react';
import { useUser, useSessionContext } from '@supabase/auth-helpers-react';

const UserContext = createContext(undefined);

const SupaContextProvider = (props) => {
    const { session, isLoading: isLoadingUser, supabaseClient: supabase } = useSessionContext();
    const user = useUser();
    const accessToken = session?.access_token ?? null;
    const [isLoadingData, setIsloadingData] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [chatRole, setChatRole] = useState('intro');
    const [availableChatRoles, setAvailableChatRoles] = useState(null);

    const getUserDetails = (user_id) => 
        supabase
            .from('profiles')
            .select('username, full_name, avatar_url, email')
            .eq('id', user_id)
            .single();

    const getChatRoles = (user_id) => 
        supabase
            .from('chat_roles')
            .select()
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

    useEffect(() => {

        const initializeChatRole = async (user_id) => {
            await supabase
                .from('chat_roles')
                .insert([{ user_id: user_id, role: 'intro' }]);
        };

        if (user && !isLoadingData && !userDetails) {
            // Login - get user details and chat history
            setIsloadingData(true);
            Promise.allSettled([getUserDetails(user.id), getChatRoles(user.id)]).then(
                (results) => {
                    const userDetailsPromise = results[0];
                    const chatRolePromise = results[1];

                    if (userDetailsPromise.status === 'fulfilled') 
                        setUserDetails(userDetailsPromise.value.data);

                    if (chatRolePromise.status === 'fulfilled') {
                        if (chatRolePromise.value.data.length > 0) {
                            // chat role(s) exist
                            const roles = chatRolePromise.value.data.map((role) => {
                                return { role: role.role, id: role.id };
                            });
                            setChatRole(roles[0]);
                            setAvailableChatRoles(roles);
                        }
                        else {
                            // no chat roles exist
                            setChatRole('intro');
                            setAvailableChatRoles(['none']);
                            // Write intro role to DB for new user
                            initializeChatRole(user.id)
                                .catch((error) => console.log(error));
                        }
                    }

                    setIsloadingData(false);
                }
            );
        } else if (!user && !isLoadingUser && !isLoadingData) {
            // Logout - reset state
            setUserDetails(null);
            setChatRole('intro');
        }
    }, [user, isLoadingUser]);

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
        chatRole,
        availableChatRoles,
        supabaseClient: supabase,
    };

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

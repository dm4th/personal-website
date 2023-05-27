import { useEffect, useState, createContext, useContext } from 'react';
import { useUser, useSessionContext } from '@supabase/auth-helpers-react';

// Define the Default Role for non-logged in users here
const DEFAULT_ROLE = 'intro';

const UserContext = createContext(undefined);

const SupaContextProvider = (props) => {
    const { session, isLoading: isLoadingUser, supabaseClient: supabase } = useSessionContext();
    const user = useUser();
    const accessToken = session?.access_token ?? null;
    const [isLoadingData, setIsloadingData] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [chatRole, setChatRole] = useState(null);
    const [availableChatRoles, setAvailableChatRoles] = useState(null);

    const getUserDetails = () => 
        supabase
            .from('profiles')
            .select('username, full_name, avatar_url, email')
            .eq('id', user.id)
            .single();

    const getChatRoles = () => 
        supabase
            .from('chat_roles')
            .select()
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

    const getAnonRole = () => 
        supabase
            .from("chat_roles")
            .select("id")
            .eq("role", DEFAULT_ROLE)
            .is("user_id", null)
            .single();

    const updateUserDetails = async () => {
        if (!user) return;
        try {
            const response = await getUserDetails();
            setUserDetails(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const updateAvailableChatRoles = async () => {
        if (!user) return;
        try {
            const response = await getChatRoles();
            if (response.data.length > 0) {
                // chat role(s) exist
                const roles = response.data.map((role) => {
                    return { role: role.role, id: role.id };
                });
                setAvailableChatRoles(roles);
            }
            else {
                // no chat roles exist
                setAvailableChatRoles(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateChatRole = async (role) => {
        if (!user || !role) return;
        let roleToUpdate = availableChatRoles.find((r) => r.role === role);
        if (!roleToUpdate) {
            // refresh available chat roles and try again
            await updateAvailableChatRoles();
            roleToUpdate = availableChatRoles.find((r) => r.role === role);
            // if still not found, return
            if (!roleToUpdate) return;
        }
        setChatRole(roleToUpdate);
    }
              

    useEffect(() => {

        const initializeChatRole = async (user_id) => {
            await supabase
                .from('chat_roles')
                .insert([{ user_id: user_id, role: 'intro' }]);
        };

        if (user && !isLoadingData && !userDetails) {
            // Login - get user details and chat history
            setIsloadingData(true);
            Promise.allSettled([getUserDetails(), getChatRoles()]).then(
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
                            setChatRole(null);
                            setAvailableChatRoles(null);
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
            Promise.allSettled([getAnonRole()]).then((results) => {
                const anonRolePromise = results[0];
                if (anonRolePromise.status === 'fulfilled') {
                    setChatRole({ role: DEFAULT_ROLE, id: anonRolePromise.value.data.id });
                }
            });
        }
    }, [user, isLoadingUser]);

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingUser || isLoadingData,
        chatRole,
        availableChatRoles,
        updateUserDetails,
        updateChatRole,
        updateAvailableChatRoles,
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

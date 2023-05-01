import Layout, { siteTitle } from '@/components/Layout';
import { useSupaUser } from '@/lib/SupaContextProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getSortedPostsData } from '@/lib/promptingBlogs';

export async function getStaticProps() {
    const allPostsData = await getSortedPostsData();
    return {
        props: {
            allPostsData,
        },
    };
}

export default function Account({ allPostsData }) {
    const { user, userDetails, loggedInRole } = useSupaUser();
    const router = useRouter();
    const [username, setUsername] = useState(null);
    const [fullName, setFullName] = useState(null); 
    const [email, setEmail] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [chatHistory, setChatHistory] = useState(null);

    useEffect(() => {
        if (userDetails) {
            setUsername(userDetails.username);
            setFullName(userDetails.full_name);
            setEmail(userDetails.email);
            setAvatarUrl(userDetails.avatar_url);
        }
    }, [userDetails]);

    useEffect(() => {
        if (!user) router.push('/');
    }, [user, router]);

    return (
        <Layout allPostsData={allPostsData}>
            <h1>Account</h1>
            <h2>Username: {username}</h2>
            <h2>Avatar URL: {avatarUrl}</h2>
            <h2>Chat History: {chatHistory}</h2>
        </Layout>
    );
}
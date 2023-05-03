import { useEffect, useState } from 'react';
import { useSupaUser } from '@/lib/SupaContextProvider';

export default function Avatar({ url, avatarClass, noAvatarClass }) {
    const { supabaseClient } = useSupaUser();
    const [avatarUrl, setAvatarUrl] = useState(null);

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url])

    async function downloadImage(path) {
        try {
            const { data, error } = await supabaseClient.storage.from('avatars').download(path)
            if (error) throw error;
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    }

    return (
    <div>
        {avatarUrl ? (
            <img
                src={avatarUrl}
                alt="Avatar"
                className={avatarClass}
            />
        ) : (
            <div className={noAvatarClass} />
        )}
    </div>
    )
}
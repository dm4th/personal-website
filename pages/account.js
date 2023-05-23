import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Avatar from '@/components/Avatar';
import { useSupaUser } from '@/lib/SupaContextProvider';
import { getSortedPostsData } from '@/lib/promptingBlogs';
import { getSortedInfo } from '@/lib/infoDocs';
import loginRoles from '@/lib/loginRoles';
import styles from '@/styles/Account.module.css';
import utilStyles from '@/styles/utils.module.css';

export async function getStaticProps() {
    const allPostsData = await getSortedPostsData();
    const allInfoData = getSortedInfo();
    return {
        props: {
            allPostsData,
            allInfoData,
        },
    };
}

export default function Account({ allPostsData, allInfoData }) {
    const { user, userDetails, chatRole, availableChatRoles, isLoading, updateUserDetails, updateChatRole, updateAvailableChatRoles, supabaseClient } = useSupaUser();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState(''); 
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [addedRoles, setAddedRoles] = useState(null);
    const [updateStatus, setUpdateStatus] = useState(null);

    useEffect(() => {
        if (userDetails) {
            setUsername(userDetails.username);
            setFullName(userDetails.full_name);
            setEmail(userDetails.email);
            setAvatarUrl(userDetails.avatar_url);
        }
    }, [userDetails]);

    useEffect(() => {
        if (chatRole && chatRole.role) {
            setCurrentRole(chatRole.role[0].toUpperCase() + chatRole.role.slice(1));
        }
    }, [chatRole]);

    useEffect(() => {
        if (availableChatRoles) {
            setAddedRoles(availableChatRoles.map((role) => role.role));
        }
    }, [availableChatRoles]);

    useEffect(() => {
        console.log(userDetails);
        if (!user && !isLoading) router.push('/');
    }, [user, router]);

    

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setUpdateStatus('Updating Profile...');
        if (username === '') setUsername(userDetails.username);
        if (fullName === '') setFullName(userDetails.full_name);
        if (email === '') setEmail(userDetails.email);
        const updates = {
            id: user.id,
            updated_at: new Date(),
            username: username,
            full_name: fullName,
            email: email,
            avatar_url: userDetails.avatar_url
        };
        let { error } = await supabaseClient.from('profiles').upsert(updates)
        if (error) {
            setUpdateStatus('Error');
            console.log(error);
        } else {
            updateUserDetails();
            setUpdateStatus('Success');
        }

    };

    const handleAvatarUpload = async (event) => {
        event.preventDefault();
        try {
            setUploadingAvatar(true);
            setUpdateStatus('Uploading Image...');
            // Check if user has selected a file
            if (!avatarFile) throw new Error('You must select a file first!');

            // Check if file is an image
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload image to Supabase Storage bucket
            const { error: uploadError } = await supabaseClient.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            // Check for upload error
            if (uploadError) throw uploadError;

            // Update user avatar in Supabase 'profiles' table
            const updates = {
                id: user.id,
                updated_at: new Date(),
                avatar_url: filePath,
                username: userDetails.username,
                full_name: userDetails.full_name,
                email: userDetails.email
            };
            console.log(updates);
            let { error: profilesError } = await supabaseClient.from('profiles').upsert(updates);
            if (profilesError) throw profilesError;

            setUploadingAvatar(false);
            updateUserDetails();
            setUpdateStatus('Success');
        } catch (error) {
            setUploadingAvatar(false);
            setUpdateStatus('Error');
            console.log(error);
        }
    };

    const changeChatRole = async (role) => {
        setUpdateStatus('Changing Role...');
        try {
            updateChatRole(role);
            setCurrentRole(role[0].toUpperCase() + role.slice(1));
            setUpdateStatus('Success');
        } catch (error) {
            setUpdateStatus('Error');
            console.log(error);
        }
    };

    const addChatRole = async (role) => {
        setUpdateStatus('Adding Role...');

        // Check if role is already added
        if (addedRoles.includes(role)) {
            setUpdateStatus('Error');
            return console.log('Role already added!');
        } else {
            // Add role to DB
            const updates = {
                user_id: user.id,
                role: role,
                created_at: new Date()
            }
            let { error } = await supabaseClient.from('chat_roles').upsert(updates)
            if (error) {
                setUpdateStatus('Error');
                console.log(error);
            } else {
                setUpdateStatus('Success');
                updateAvailableChatRoles();
                updateChatRole(role);
                setCurrentRole(role[0].toUpperCase() + role.slice(1));
            }


        }
    };

    
    const renderChatRoleButtons = () => {
        const available = [];
        const needsApproval = [];

        loginRoles.all_but_admin.forEach((role) => {
            if (addedRoles && !addedRoles.includes(role)) {
                if (loginRoles.needs_approval.includes(role)) needsApproval.push(role);
                else available.push(role);
            }
        });

        return (
            <div className={styles.roleSections}>
                <div className={styles.roleSection}>
                    <h5 className={styles.roleSectionHeader}>Added Roles</h5>
                    {addedRoles && addedRoles.map((role) => (
                        <button key={role} className={`${styles.roleButton} ${styles.addedRoleButton}`} onClick={() => changeChatRole(role)}>
                            {role[0].toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
                <div className={styles.roleSection}>
                    <h5 className={styles.roleSectionHeader}>Available Roles</h5>
                    {available.map((role) => (
                        <button key={role} className={`${styles.roleButton} ${styles.availableRoleButton}`} onClick={() => addChatRole(role)}>
                            {role[0].toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
                <div className={styles.roleSection}>
                    <h5 className={styles.roleSectionHeader}>Needs Approval</h5>
                    {needsApproval.map((role) => (
                        <button key={role} className={`${styles.roleButton} ${styles.needsApprovalButton}`} >
                            {role[0].toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        );
    }


    return (
        <Layout allPostsData={allPostsData} allInfoData={allInfoData}>
            <Head>
                <title>Account</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${styles.formSection}`}>
                <h2 className={utilStyles.headingLg}>Account Info</h2>
                <form onSubmit={handleProfileSubmit}>
                    <div>
                        <label htmlFor="username" className={styles.accountInfoLabel}>Username</label>
                        <input
                            id="username"
                            type='text'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            suggested={userDetails?.username}
                            className={styles.inputBox}
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <label htmlFor="fullName" className={styles.accountInfoLabel}>Full Name</label>
                        <input
                            id="fullName"
                            type='text'
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            suggested={userDetails?.full_name}
                            className={styles.inputBox}
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <label htmlFor="email" className={styles.accountInfoLabel}>Email</label>
                        <input
                            id="email"
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            suggested={userDetails?.email}
                            pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'
                            className={styles.inputBox}
                        />
                    </div>
                    <div className={styles.submitButtonWrapper}>
                        <button type="submit" className={styles.submitButton}>
                            Save
                        </button>
                    </div>
                </form>
            </section>
            <section className={`${utilStyles.headingMd} ${styles.formSection}`}>
                <h2 className={utilStyles.headingLg}>Avatar Image</h2>
                {avatarUrl ? (
                    <div>
                        <Avatar url={avatarUrl} avatarClass={styles.avatar} noAvatarClass={styles.noAvatar} />
                        <p>Would you like to change your avatar?</p>
                    </div>
                ) : (
                    <p className={styles.accountInfoLabel}>Please upload a photo for your avatar.</p>
                )}
                <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    disabled={uploadingAvatar}
                />
                <div className={styles.submitButtonWrapper}>
                    <button onClick={handleAvatarUpload} className={styles.submitButton}>Upload Avatar</button>
                </div>
            </section>
            <section className={`${utilStyles.headingMd} ${styles.formSection}`}>
                <h2 className={utilStyles.headingLg}>Chat Roles</h2>
                <small>Current Role: {currentRole ? currentRole : 'Loading...'}</small>
                {renderChatRoleButtons()}
            </section>
            {updateStatus && (
                <div
                    className={`${styles.toast} ${updateStatus === "Success" ? styles.success : (updateStatus === "Error" ? styles.error : styles.updating)}`}
                    onAnimationEnd={() => setUpdateStatus(null)}
                >
                    {updateStatus}
                </div>
            )}
        </Layout>
    );
}
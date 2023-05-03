import Head from 'next/head';
import Layout, { siteTitle } from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';
import { getSortedPostsData } from '@/lib/promptingBlogs';

export async function getStaticProps() {
    const allPostsData = await getSortedPostsData();
    return {
        props: {
            allPostsData,
        },
    };
}

export default function Home({ allPostsData }) {
    return (
        <Layout home allPostsData={allPostsData}>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={utilStyles.headingMd}>
                <small>Hi! I'm Dan - Welcome to my Personal Website</small>
                <br></br>
                <small>You can chat with me using the below interface.</small>
                <br></br>
                <small>If you'd like a more customized experience, including saving chats and chatting with different roles of myself, please login and edit your account.</small>
            </section>
            <section className={utilStyles.headingMd}>
                <h2 className={utilStyles.headingLg}>Chat with Me</h2>
            </section>
        </Layout>
    );
}
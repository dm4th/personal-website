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
                <p>Hi! I'm Dan - Welcome to my Personal Website</p>
            </section>
            <section className={utilStyles.headingMd}>
                <h2 className={utilStyles.headingLg}>Chat with Me</h2>
                <p>Create an account to save chat history</p>
            </section>
        </Layout>
    );
}
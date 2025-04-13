import Head from 'next/head';
import Layout, { siteTitle } from '@/components/Layout';
import ChatInterface from '@/components/ChatInterface.js';
import utilStyles from '@/styles/utils.module.css';
import { getSortedPostsData } from '@/lib/promptingBlogs';
import { getSortedInfo } from '@/lib/infoDocs';

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

export default function Home({ allPostsData, allInfoData }) {
    return (
        <Layout home allPostsData={allPostsData} allInfoData={allInfoData} >
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={`${utilStyles.headingMd} ${utilStyles.centerText} ${utilStyles.welcomeSection}`}>
                <h3>Hi! I'm Dan - Welcome to my Personal Website</h3>
                <ul className={`${utilStyles.welcomeList} ${utilStyles.italicText}`}>
                    <li>Try the LLM Guessing Game - For each question you ask, guess which Model gave the answer!</li>
                    <li>For a more customized experience, including saving chats and chatting with different roles of the assistant, please login and edit your account.</li>
                </ul>
            </section>
            <section className={utilStyles.headingMd}>
                <ChatInterface />
            </section>
        </Layout>
    );
}
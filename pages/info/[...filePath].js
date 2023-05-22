import Head from 'next/head';
import Layout from '@/components/Layout';
import Date from '@/components/date';
import utilStyles from '@/styles/utils.module.css';
import { getSortedPostsData } from '@/lib/promptingBlogs';
import { getSortedInfo, getInfoFilePaths, getInfoData } from '@/lib/infoDocs';

export async function getStaticProps({ params }) {
    const allPostsData = await getSortedPostsData();
    const allInfoData = getSortedInfo();
    const infoData = getInfoData(params.filePath);
    return {
        props: {
            allPostsData,
            allInfoData,
            infoData,
        },
    };
}

export async function getStaticPaths() {
    const paths = getInfoFilePaths();
    console.log(paths);
    return {
        paths,
        fallback: false,
    };
}

export default function Info({ allPostsData, allInfoData, infoData }) {
    return (
        <Layout allPostsData={allPostsData} allInfoData={allInfoData} >
            <Head>
                <title>{infoData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{infoData.title}</h1>
                <div className={utilStyles.lightText}>
                    {infoData.start}{infoData.end && `- ${infoData.end}`}
                </div>
                <br></br>
            </article>
        </Layout>
    );
}

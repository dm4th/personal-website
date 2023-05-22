import Head from 'next/head';
import Layout from '@/components/Layout';
import Date from '@/components/date';
import utilStyles from '@/styles/utils.module.css';
import { getSortedPostsData, getAllPostIds, getPostData } from '@/lib/promptingBlogs';
import { getSortedInfo } from '@/lib/infoDocs';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import richTextRendererOptions from '@/lib/blogRichTextRenderer';

export async function getStaticProps({ params }) {
    const allPostsData = await getSortedPostsData();
    const postData = await getPostData(params.id);
    const allInfoData = getSortedInfo();
    return {
        props: {
            allPostsData,
            postData,
            allInfoData,
        },
    };
}

export async function getStaticPaths() {
    const paths = await getAllPostIds();
    return {
        paths,
        fallback: false,
    };
}

export default function Post({ allPostsData, postData, allInfoData }) {
    return (
        <Layout allPostsData={allPostsData} allInfoData={allInfoData}>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                    <Date dateString={postData.date} />
                </div>
                <br></br>
                <div>
                    <h1>Intro</h1>
                    <br></br>
                    {documentToReactComponents(postData.intro, richTextRendererOptions)}
                    <br></br>
                    <hr></hr>
                </div>
                <br></br>
                <div>
                    <h1>Takeaways</h1>
                    <br></br>
                    {documentToReactComponents(postData.takeaways, richTextRendererOptions)}
                    <br></br>
                    <hr></hr>
                </div>
                <br></br>
                <div>
                    <h1>Conversations</h1>
                    {documentToReactComponents(postData.conversations, richTextRendererOptions)}
                </div>
            </article>
        </Layout>
    );
}

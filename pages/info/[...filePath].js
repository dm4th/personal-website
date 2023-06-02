import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Document, Page } from 'react-pdf';
import Layout from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';

import { getSortedPostsData } from '@/lib/promptingBlogs';
import { getSortedInfo, getInfoFilePaths, getInfoData } from '@/lib/infoDocs';

export async function getStaticProps({ params }) {
    const allPostsData = await getSortedPostsData();
    const allInfoData = getSortedInfo();
    const infoData = await getInfoData(params.filePath);
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
    return {
        paths,
        fallback: false,
    };
}

export default function Info({ allPostsData, allInfoData, infoData }) {
    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    if (infoData.type === 'md') {
        return (
            <Layout allPostsData={allPostsData} allInfoData={allInfoData} >
                <Head>
                    <title>{infoData.title}</title>
                </Head>
                    <article>
                        <h1 className={utilStyles.headingXl}>{infoData.title}</h1>
                        <div className={utilStyles.lightText}>
                            {infoData.Start} - {infoData.End}
                        </div>
                        <br></br>
                        <div className={utilStyles.contentHtml} dangerouslySetInnerHTML={{ __html: infoData.contentHtml }} />
                    </article>
            </Layout>
        );
    } 
    
    else if (infoData.type === 'pdf') {
        const pageName = infoData.filePath.split('/').pop().replace('-',' ');
        // Capitalize first letter of each word
        const pageTitle = pageName.replace(/\b\w/g, l => l.toUpperCase()).replace('Ai','AI');
        return (
            <Layout none allPostsData={allPostsData} allInfoData={allInfoData} >
                <Head>
                    <title>{pageTitle}</title>
                </Head>
                <Document file={infoData.pdfPath} onLoadSuccess={onDocumentLoadSuccess} renderAnnotationLayer={false}>
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
                </Document>
            </Layout>
        );
    }
}

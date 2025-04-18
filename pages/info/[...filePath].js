import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
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

const projectLink = (infoData) => {
    if (infoData.Link) {
        return (
            <p>Link to Project: <Link href={infoData.Link}>{infoData.Link}</Link></p>
        )
    }
}

const projectGitHub = (infoData) => {
    if (infoData.GitHub) {
        return (
            <p>Link to GitHub: <Link href={infoData.GitHub}>{infoData.GitHub}</Link></p>
        )
    }
}

const projectCredit = (infoData) => {
    if (infoData.Credit) {
        return (
            <p>Credit: <Link href={infoData.Credit}>{infoData.Credit}</Link></p>
        )
    }
}

const projectLinks = (infoData) => {
    if (infoData.Link || infoData.GitHub) {
        return (
            <>
                <div className={utilStyles.lightText}>
                    {projectLink(infoData)}
                    {projectGitHub(infoData)}
                    {projectCredit(infoData)}
                </div>
                <br></br>
            </>
        )
    }
}

const projectDates = (infoData) => {
    if (infoData.Start && infoData.End) {
        return (
            <p>{infoData.Start} - {infoData.End}</p>
        )
    }
    else if (infoData.Date) {
        return (
            <p>{infoData.Date}</p>
        )
    }
    else if (infoData.Start) {
        return (
            <p>{infoData.Start} - Current</p>
        )
    }
    else {
        return null
    }
}

const projectAuthor = (infoData) => {
    if (infoData.Author) {
        return (
            <p>Author: {infoData.Author}</p>
        )
    }
}

export default function Info({ allPostsData, allInfoData, infoData }) {
    if (infoData.type === 'md') {
        return (
            <Layout allPostsData={allPostsData} allInfoData={allInfoData} >
                <Head>
                    <title>{infoData.title}</title>
                </Head>
                    <article>
                        <h1 className={utilStyles.headingXl}>{infoData.title}</h1>
                        <div className={utilStyles.lightText}>
                            {projectDates(infoData)}
                        </div>
                        <br></br>
                        <div className={utilStyles.lightText}>
                            {projectLinks(infoData)}
                            {projectAuthor(infoData)}
                        </div>
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
                {infoData.imgArray.map((img, index) => (
                    <Image 
                        key={`${pageName}-${index+1}`} 
                        src={img.imgPath} 
                        alt={`PDF Preview Page ${index+1} for ${pageTitle}`} 
                        width={img.width} 
                        height={img.height} 
                        priority={index === 0 ? true : false}
                    />    
                ))}
            </Layout>
        );
    }
}

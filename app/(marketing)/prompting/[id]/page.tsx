import { notFound } from 'next/navigation';
import { getSortedInfo } from '@/lib/content/infoDocs';
import { getAllPostIds, getPostData, getSortedPostsData } from '@/lib/content/promptingBlogs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import styles from './page.module.css';

import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export async function generateStaticParams() {
  const paths = await getAllPostIds();
  return paths.map(({ params }) => ({ id: params.id }));
}

type Props = { params: Promise<{ id: string }> };

export default async function PromptingPage({ params }: Props) {
  const { id } = await params;
  const [allInfoData, postData] = await Promise.all([
    Promise.resolve(getSortedInfo()),
    getPostData(id).catch(() => null),
  ]);

  if (!postData) notFound();

  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.wrapper}>
        <article>
          <h1 className={styles.title}>{postData.title as string}</h1>
          {postData.date && (
            <p className={styles.date}>{new Date(postData.date as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          )}
          <section>
            <h2 className={styles.section}>Intro</h2>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {documentToReactComponents(postData.intro as any)}
          </section>
          <section>
            <h2 className={styles.section}>Takeaways</h2>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {documentToReactComponents(postData.takeaways as any)}
          </section>
          <section>
            <h2 className={styles.section}>Conversations</h2>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {documentToReactComponents(postData.conversations as any)}
          </section>
        </article>
      </div>
      <SiteFooter />
    </>
  );
}

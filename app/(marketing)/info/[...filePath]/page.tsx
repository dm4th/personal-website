import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSortedInfo, getInfoFilePaths, getInfoData } from '@/lib/content/infoDocs';
import SiteHeader from '@/components/shell/SiteHeader';
import SiteFooter from '@/components/shell/SiteFooter';
import styles from './page.module.css';

export async function generateStaticParams() {
  const paths = getInfoFilePaths();
  return paths.map(({ params }) => ({ filePath: params.filePath }));
}

type Props = { params: Promise<{ filePath: string[] }> };

export default async function InfoPage({ params }: Props) {
  const { filePath } = await params;
  const allInfoData = getSortedInfo();

  let infoData;
  try {
    infoData = await getInfoData(filePath);
  } catch {
    notFound();
  }

  if (infoData.type === 'md') {
    const d = infoData as typeof infoData & { Title?: string; Start?: string; End?: string; Link?: string; GitHub?: string; Credit?: string };
    return (
      <>
        <SiteHeader allInfoData={allInfoData} />
        <div className={styles.wrapper}>
          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <h1 className={styles.title}>{d.Title ?? filePath.at(-1)}</h1>
              {(d.Start || d.End) && (
                <p className={styles.dates}>
                  {d.Start}{d.End ? ` — ${d.End}` : d.Start ? ' — Present' : ''}
                </p>
              )}
              {(d.Link || d.GitHub || d.Credit) && (
                <div className={styles.links}>
                  {d.Link && <a href={d.Link} target="_blank" rel="noopener noreferrer">Project →</a>}
                  {d.GitHub && <a href={d.GitHub} target="_blank" rel="noopener noreferrer">GitHub →</a>}
                  {d.Credit && <a href={d.Credit} target="_blank" rel="noopener noreferrer">Credit →</a>}
                </div>
              )}
            </header>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: infoData.contentHtml }}
            />
          </article>
          <div className={styles.backLink}>
            <Link href="/">← Back</Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  // PDF rendering
  const pageName = filePath.at(-1)?.replace(/-/g, ' ') ?? '';
  const pageTitle = pageName.replace(/\b\w/g, (l) => l.toUpperCase()).replace('Ai', 'AI');
  return (
    <>
      <SiteHeader allInfoData={allInfoData} />
      <div className={styles.pdfWrapper}>
        <h1 className={styles.title}>{pageTitle}</h1>
        {infoData.imgArray.map((img, index) => (
          <Image
            key={`${pageName}-${index + 1}`}
            src={img.imgPath}
            alt={`PDF Page ${index + 1} — ${pageTitle}`}
            width={img.width ?? 800}
            height={img.height ?? 1035}
            priority={index === 0}
            style={{ display: 'block', width: '100%', height: 'auto', marginBottom: '1rem' }}
          />
        ))}
      </div>
      <SiteFooter />
    </>
  );
}

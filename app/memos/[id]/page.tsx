import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { db } from '@/lib/db/client';
import { memos, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import styles from './page.module.css';

export default async function MemoPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect('/sign-in');

  const { id } = await params;

  const dbUsers = await db.select({ id: users.id }).from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  const userId = dbUsers[0]?.id;
  if (!userId) redirect('/sign-in');

  const rows = await db
    .select()
    .from(memos)
    .where(and(eq(memos.id, id), eq(memos.userId, userId)))
    .limit(1);

  const memo = rows[0];
  if (!memo) notFound();

  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(memo.createdAt));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/account" className={styles.back}>← Back</Link>
        <h1 className={styles.title}>{memo.title}</h1>
        <p className={styles.date}>Saved {formatted}</p>
        <div className={styles.body}>
          {memo.bodyMarkdown.split('\n\n').map((block, i) => (
            <p key={i} className={block.startsWith('**You:**') ? styles.userMsg : styles.agentMsg}>
              {block.replace(/^\*\*(You|Agent):\*\* /, (_, role) => '').trim()}
              {block.startsWith('**You:**') && <span className={styles.roleLabel}>You</span>}
              {block.startsWith('**Agent:**') && <span className={styles.roleLabel}>Agent</span>}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

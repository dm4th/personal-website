import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });
const BUCKET = process.env.DOCWOW_S3_BUCKET ?? '';

/**
 * Generate a pre-signed PUT URL for a user PDF upload.
 * Key is scoped to uploads/ prefix with a timestamp to avoid collisions.
 */
export async function getUploadUrl(filename: string): Promise<{ url: string; key: string }> {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${Date.now()}-${sanitized}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: 'application/pdf',
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  return { url, key };
}

export function getS3Url(key: string): string {
  return `s3://${BUCKET}/${key}`;
}

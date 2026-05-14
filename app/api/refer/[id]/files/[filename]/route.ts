import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getJobApplicationBySlug, getJobApplicationFilePath } from '@/lib/content/jobApplications';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename } = await params;

  const entry = getJobApplicationBySlug(id);
  if (!entry) {
    return new NextResponse('Not found', { status: 404 });
  }

  const allowedFiles = [entry.config.resumeFile, entry.config.coverLetterFile].filter(Boolean);
  if (!allowedFiles.includes(filename)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const filePath = getJobApplicationFilePath(entry.dirName, filename);
  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const download = _req.nextUrl.searchParams.get('download') === '1';
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': download ? `attachment; filename="${filename}"` : 'inline',
    },
  });
}

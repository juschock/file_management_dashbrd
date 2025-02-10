import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request) {
  const prisma = new PrismaClient();
  try {
    const files = await prisma.uploadedFile.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

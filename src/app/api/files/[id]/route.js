import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function DELETE(request, { params }) {
  const { id } = params;
  const prisma = new PrismaClient();
  try {
    const deleted = await prisma.uploadedFile.delete({
      where: { id: parseInt(id, 10) }
    });
    return NextResponse.json({ message: "File deleted successfully", file: deleted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

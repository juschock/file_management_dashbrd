import { NextResponse } from "next/server";
import formidable from "formidable";
import { Readable } from "stream";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

export const config = {
  runtime: "node",
  api: {
    bodyParser: false,
  },
};

async function bufferToStream(request) {
  const buf = Buffer.from(await request.arrayBuffer());
  return Readable.from(buf);
}

function parseForm(reqStream, headers) {
  return new Promise((resolve, reject) => {
    const fakeReq = Object.assign(reqStream, {
      headers: Object.fromEntries(headers),
      method: "POST",
      url: "/api/upload",
    });

    const form = formidable({
      uploadDir: "./uploads",
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        console.log("Filename callback - part object:", part);
        return `${Date.now()}-${part.originalFilename}`;
      },
    });

    form.parse(fakeReq, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export async function POST(request) {
  try {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const reqStream = await bufferToStream(request);

    const { fields, files } = await parseForm(reqStream, request.headers);

    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("Parsed file object:", file);
    console.log("File keys:", Object.keys(file));

    const prisma = new PrismaClient();

    const record = await prisma.uploadedFile.create({
      data: {
        filename: file.newFilename,
        originalName: file.originalFilename,
        path: file.filepath,
      },
    });
    await prisma.$disconnect();

    return NextResponse.json(
      { message: "File uploaded successfully", file: record },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    );
  }
}

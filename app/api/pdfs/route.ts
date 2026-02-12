import { readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { getPDFCategory } from "@/lib/pdfConfig";

interface PDFFile {
  id: number;
  filename: string;
  key: string;
  category: string;
}

export async function GET() {
  try {
    const pdfDir = join(process.cwd(), "public", "pdfs");
    const files = readdirSync(pdfDir);

    // Filter only PDF files and exclude README.md
    const pdfFiles = files
      .filter((file) => file.endsWith(".pdf"))
      .sort()
      .map((filename, index) => ({
        id: index + 1,
        filename,
        // Create a key from filename by removing .pdf extension and converting to camelCase
        key: filename
          .replace(".pdf", "")
          .toLowerCase()
          .replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()),
        // Get category from config, defaults to 'philosophy'
        category: getPDFCategory(filename),
      }));

    return NextResponse.json(pdfFiles);
  } catch (error) {
    console.error("Error reading PDF directory:", error);
    return NextResponse.json(
      { error: "Failed to read PDF directory" },
      { status: 500 },
    );
  }
}

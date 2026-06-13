import { promises as fs } from "fs";
import path from "path";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

export type LegalSection = { heading: string; blocks: LegalBlock[] };

export type ParsedLegal = {
  title: string;
  intro: string;
  /** Paragraphs that appear before the first "## " heading. */
  lead: LegalBlock[];
  sections: LegalSection[];
};

/**
 * Read a legal document from the external .txt files in public/legal and parse
 * its lightweight markup:
 *   "# Title"      -> page title
 *   "> intro"      -> intro paragraph
 *   "## Heading"   -> section heading
 *   "- item"       -> bullet list item
 *   blank line     -> paragraph break
 *   anything else  -> paragraph text
 */
export async function readLegalDoc(slug: string): Promise<ParsedLegal | null> {
  let raw: string;
  try {
    const filePath = path.join(process.cwd(), "public", "legal", `${slug}.txt`);
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  let intro = "";
  const lead: LegalBlock[] = [];
  const sections: LegalSection[] = [];

  let current: LegalSection | null = null;
  let paragraph: string[] = [];
  let list: string[] = [];

  const target = () => (current ? current.blocks : lead);

  const flushParagraph = () => {
    if (paragraph.length) {
      target().push({ type: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      target().push({ type: "ul", items: [...list] });
      list = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      title = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("> ")) {
      intro = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushAll();
      target().push({ type: "h3", text: trimmed.slice(4).trim() });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushAll();
      current = { heading: trimmed.slice(3).trim(), blocks: [] };
      sections.push(current);
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      list.push(trimmed.slice(2).trim());
      continue;
    }
    // Horizontal rule / blank line both just end the current block.
    if (trimmed === "" || trimmed === "---") {
      flushAll();
      continue;
    }
    // plain text line — accumulate into the current paragraph
    flushList();
    paragraph.push(trimmed);
  }
  flushAll();

  return { title, intro, lead, sections };
}

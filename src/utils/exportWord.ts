import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import type { Bundle, FormattingOptions } from '../types';

const EXPORT_FONT_SIZE_PT = 11;
const ptToHalfPt = (pt: number) => pt * 2;
const pxToTwip = (px: number) => Math.round(px * 15);

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
}

// Parse HTML and extract text with styles
const parseHtmlToTextRuns = (
  html: string,
  baseFormatting: FormattingOptions
): TextRun[] => {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  const runs: TextRun[] = [];

  const processNode = (node: Node, inheritedStyle: TextStyle = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        runs.push(
          new TextRun({
            text,
            size: ptToHalfPt(EXPORT_FONT_SIZE_PT),
            bold: inheritedStyle.bold || baseFormatting.bold,
            italics: inheritedStyle.italic || baseFormatting.italic,
            underline: inheritedStyle.underline || baseFormatting.underline ? {} : undefined,
            strike: inheritedStyle.strikethrough,
            font: 'Malgun Gothic',
          })
        );
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      const newStyle: TextStyle = { ...inheritedStyle };

      switch (tagName) {
        case 'b':
        case 'strong':
          newStyle.bold = true;
          break;
        case 'i':
        case 'em':
          newStyle.italic = true;
          break;
        case 'u':
          newStyle.underline = true;
          break;
        case 's':
        case 'strike':
          newStyle.strikethrough = true;
          break;
        case 'font':
          const size = element.getAttribute('size');
          if (size) {
            const sizeMap: Record<string, number> = {
              '1': 10,
              '2': 12,
              '3': 14,
              '4': 16,
              '5': 18,
              '6': 24,
              '7': 32,
            };
            newStyle.fontSize = sizeMap[size] || baseFormatting.fontSize;
          }
          break;
        case 'br':
          runs.push(new TextRun({ break: 1 }));
          return;
      }

      for (const child of element.childNodes) {
        processNode(child, newStyle);
      }
    }
  };

  processNode(temp);

  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text: '',
        size: ptToHalfPt(EXPORT_FONT_SIZE_PT),
        font: 'Malgun Gothic',
      })
    );
  }

  return runs;
};

const createParagraphFromHtml = (
  html: string,
  formatting: FormattingOptions
): Paragraph => {
  const textRuns = parseHtmlToTextRuns(html, formatting);

  return new Paragraph({
    spacing: {
      line: Math.round(formatting.lineHeight * 240),
      after: pxToTwip(formatting.paragraphSpacing),
    },
    indent: {
      firstLine: pxToTwip(formatting.indent),
    },
    children: textRuns,
  });
};

// Split HTML content into paragraphs (by div or double br)
const splitIntoParagraphs = (html: string): string[] => {
  let content = html
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '');

  return content.split('\n').filter((p) => p.trim() !== '');
};

export const generateWordBlob = async (
  bundles: Bundle[]
): Promise<Blob> => {
  const paragraphs: Paragraph[] = [];

  bundles.forEach((bundle, bundleIndex) => {
    if (bundleIndex > 0) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 400 },
        })
      );
    }

    const htmlParagraphs = splitIntoParagraphs(bundle.content);

    if (htmlParagraphs.length === 0) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: pxToTwip(bundle.formatting.paragraphSpacing) },
        })
      );
    } else {
      htmlParagraphs.forEach((htmlPara) => {
        paragraphs.push(createParagraphFromHtml(htmlPara, bundle.formatting));
      });
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const exportToWord = async (
  bundles: Bundle[],
  filename: string
): Promise<void> => {
  const blob = await generateWordBlob(bundles);
  saveAs(blob, `${filename}.docx`);
};

export const countCharacters = (bundles: Bundle[]): number => {
  return bundles.reduce((total, bundle) => {
    const temp = document.createElement('div');
    temp.innerHTML = bundle.content;
    return total + (temp.textContent?.length || 0);
  }, 0);
};

export const htmlToPlainText = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

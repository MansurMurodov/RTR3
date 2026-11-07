import type { Slide } from "./deck";

const INDIGO = "4F46E5";
const NAVY = "0B1220";

async function buildPptx(slides: Slide[], fileName: string) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = fileName.replace(/\.pptx$/i, "");
  pptx.author = "FRONTEND EDU";

  slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    if (s.kind === "title") {
      slide.background = { color: INDIGO };
      slide.addText("FRONTEND EDU", { x: 0.6, y: 0.6, w: 8.8, h: 0.4, fontSize: 14, color: "C7D2FE", bold: true, charSpacing: 4 });
      slide.addText(s.title, { x: 0.6, y: 1.4, w: 8.8, h: 1.9, fontSize: 32, color: "FFFFFF", bold: true, valign: "top", fit: "shrink" });
      slide.addText(s.subtitle, { x: 0.6, y: 3.5, w: 8.8, h: 0.5, fontSize: 18, color: "E0E7FF" });
      slide.addText(s.note, { x: 0.6, y: 4.6, w: 8.8, h: 0.4, fontSize: 14, color: "C7D2FE" });
      return;
    }
    slide.background = { color: "FFFFFF" };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.95, fill: { color: s.kind === "end" ? "0D9488" : INDIGO }, line: { color: s.kind === "end" ? "0D9488" : INDIGO } });
    slide.addText(s.title, { x: 0.5, y: 0.1, w: 9, h: 0.75, fontSize: 24, bold: true, color: "FFFFFF", valign: "middle", fit: "shrink" });

    if (s.kind === "code") {
      slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.2, w: 9, h: s.note ? 3.1 : 3.8, fill: { color: NAVY }, line: { color: NAVY } });
      slide.addText(s.code, { x: 0.65, y: 1.3, w: 8.7, h: s.note ? 2.9 : 3.6, fontFace: "Courier New", fontSize: 13, color: "E2E8F0", valign: "top", fit: "shrink" });
      if (s.note) slide.addText(s.note, { x: 0.5, y: 4.4, w: 9, h: 0.7, fontSize: 14, color: "475569", valign: "top", fit: "shrink" });
    } else {
      const total = s.bullets.reduce((n, b) => n + b.length, 0);
      slide.addText(
        s.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        { x: 0.6, y: 1.2, w: 8.8, h: 3.9, fontSize: total > 380 ? 17 : 20, color: "1E293B", valign: "top", paraSpaceAfter: 10, fit: "shrink" },
      );
    }
    slide.addText(`FRONTEND EDU · ${idx + 1} / ${slides.length}`, { x: 0.5, y: 5.2, w: 9, h: 0.3, fontSize: 10, color: "64748B", align: "right" });
  });

  return pptx;
}

export async function downloadPptx(slides: Slide[], fileName: string): Promise<void> {
  const pptx = await buildPptx(slides, fileName);
  await pptx.writeFile({ fileName });
}

export async function pptxBlob(slides: Slide[], title: string): Promise<Blob> {
  const pptx = await buildPptx(slides, title);
  return (await pptx.write({ outputType: "blob" })) as Blob;
}

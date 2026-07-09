import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { shareOrDownloadPdf } from "@/lib/utils/sharePdf";
import {
  feedbackPdfFileName,
  type FeedbackDocument,
} from "@/lib/utils/feedbackDocument";

function buildFeedbackPdf(
  doc: import("jspdf").jsPDF,
  data: FeedbackDocument,
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(data.businessName, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(13);
  doc.text(data.title, pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`ID: ${data.id.slice(0, 8)}`, margin, y);
  doc.text(formatDateGroup(data.date), pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text(formatTime(data.createdAt), pageWidth - margin, y, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("De", margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(data.senderName, margin, y);
  y += 5;

  if (data.senderEmail) {
    doc.text(data.senderEmail, margin, y);
    y += 5;
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Estado", margin, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(data.statusLabel, margin, y);
  y += 10;

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Mensaje", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const messageLines = doc.splitTextToSize(data.message, contentWidth);
  for (const line of messageLines) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 5;
  }

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Comentario enviado desde la app de inventariado.",
    margin,
    y,
  );
  doc.setTextColor(0, 0, 0);
}

export async function createFeedbackPdfBlob(
  data: FeedbackDocument,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  buildFeedbackPdf(doc, data);
  return doc.output("blob");
}

export async function shareFeedbackPdf(data: FeedbackDocument): Promise<void> {
  const blob = await createFeedbackPdfBlob(data);
  const fileName = feedbackPdfFileName(data.id);
  await shareOrDownloadPdf(
    blob,
    fileName,
    data.title,
    `${data.title} — ${data.senderName}`,
  );
}

export async function downloadFeedbackPdf(data: FeedbackDocument): Promise<void> {
  const blob = await createFeedbackPdfBlob(data);
  const fileName = feedbackPdfFileName(data.id);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

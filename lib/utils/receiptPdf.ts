import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatDateGroup, formatTime } from "@/lib/utils/date";
import { shareOrDownloadPdf } from "@/lib/utils/sharePdf";
import {
  receiptPdfFileName,
  type ReceiptDocument,
} from "@/lib/utils/receiptDocument";

function money(amount: number): string {
  return formatCurrency(amount);
}

function buildReceiptPdf(doc: import("jspdf").jsPDF, data: ReceiptDocument): void {
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
  doc.text(`N.º ${data.number}`, margin, y);
  doc.text(formatDateGroup(data.date), pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text(formatTime(data.createdAt), pageWidth - margin, y, { align: "right" });
  y += 10;

  if (data.partyName) {
    doc.setFont("helvetica", "bold");
    doc.text(data.partyLabel, margin, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    doc.text(data.partyName, margin, y);
    y += 5;
    if (data.partyPhone) {
      doc.text(data.partyPhone, margin, y);
      y += 5;
    }
    y += 4;
  }

  if (data.paymentMethodLabel) {
    doc.text(`Método de pago: ${data.paymentMethodLabel}`, margin, y);
    y += 6;
  }

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Producto", margin, y);
  doc.text("Cant.", margin + contentWidth * 0.55, y, { align: "right" });
  doc.text("P. unit.", margin + contentWidth * 0.72, y, { align: "right" });
  doc.text("Total", pageWidth - margin, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const item of data.items) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    const nameLines = doc.splitTextToSize(item.name, contentWidth * 0.5);
    doc.text(nameLines, margin, y);
    doc.text(String(item.quantity), margin + contentWidth * 0.55, y, {
      align: "right",
    });
    doc.text(money(item.unitPrice), margin + contentWidth * 0.72, y, {
      align: "right",
    });
    doc.text(money(item.totalPrice), pageWidth - margin, y, { align: "right" });
    y += Math.max(nameLines.length * 4.5, 6);
  }

  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.text("Subtotal", margin, y);
  doc.text(money(data.subtotal), pageWidth - margin, y, { align: "right" });
  y += 5;

  if (data.tax > 0) {
    doc.text("IVA", margin, y);
    doc.text(money(data.tax), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  if (data.service > 0) {
    doc.text("Servicio", margin, y);
    doc.text(money(data.service), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  if (data.discount > 0) {
    doc.text("Descuento", margin, y);
    doc.text(`- ${money(data.discount)}`, pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total", margin, y);
  doc.text(money(data.total), pageWidth - margin, y, { align: "right" });
  y += 8;

  if (data.amountPaid != null) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.kind === "sale" ? "Abonado" : "Pagado", margin, y);
    doc.text(money(data.amountPaid), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  if (data.balanceDue != null && data.balanceDue > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Saldo pendiente", margin, y);
    doc.text(money(data.balanceDue), pageWidth - margin, y, { align: "right" });
    y += 5;
    doc.setFont("helvetica", "normal");
  }

  if (data.change != null && data.change > 0) {
    doc.text("Cambio", margin, y);
    doc.text(money(data.change), pageWidth - margin, y, { align: "right" });
    y += 5;
  }

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const note =
    data.title.includes("PRE-ORDEN")
      ? "Documento informativo. No constituye una operación confirmada."
      : "Gracias por su preferencia.";
  doc.text(note, margin, y);
  doc.setTextColor(0, 0, 0);

  if (data.employeeName) {
    y += 8;
    doc.text(`Atendido por: ${data.employeeName}`, margin, y);
  }
}

export async function createReceiptPdfBlob(data: ReceiptDocument): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  buildReceiptPdf(doc, data);
  return doc.output("blob");
}

export async function shareReceiptPdf(data: ReceiptDocument): Promise<void> {
  const blob = await createReceiptPdfBlob(data);
  const fileName = receiptPdfFileName(data.number);
  await shareOrDownloadPdf(
    blob,
    fileName,
    `${data.title} ${data.number}`,
    `${data.title} ${data.number} — ${data.businessName} — Total ${money(data.total)}`,
  );
}

export async function downloadReceiptPdf(data: ReceiptDocument): Promise<void> {
  const blob = await createReceiptPdfBlob(data);
  const fileName = receiptPdfFileName(data.number);
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

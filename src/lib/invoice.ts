import { jsPDF } from 'jspdf';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  businessName: string;
  businessSlug: string;
  businessAddress?: string;
  planName: string; // Starter, Professional, Business Plus
  planPrice: number; // in rupees: 99, 199, 399
  activatedAt: string;
  expiresAt: string;
  paymentMethod?: string;
  utrNumber?: string;
  status?: string;
}

export function generateTaxInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 6, 'F');
  doc.setFillColor(0, 71, 212); // brand blue
  doc.rect(0, 6, pageWidth, 2, 'F');

  let y = 18;

  // 2. Company Brand & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 71, 212);
  doc.text('SmartQR', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('BUSINESS SOLUTIONS', margin + 35, y - 0.5);

  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Dynamic QR Infrastructure and Digital Business Profiles', margin, y);
  y += 4;
  doc.text('Support: support@smartqr.in | WhatsApp: +91 9931782577', margin, y);

  // Top Right: Tax Invoice Badge & Number
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('TAX INVOICE AND RECEIPT', pageWidth - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Invoice Number: ${data.invoiceNumber}`, pageWidth - margin, 24, { align: 'right' });
  doc.text(`Invoice Date: ${data.invoiceDate}`, pageWidth - margin, 29, { align: 'right' });

  // Divider
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. Customer & Business Information Card
  y += 6;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 71, 212);
  doc.text('BILLED TO SUBSCRIBER', margin + 5, y + 6);

  // Left col: Customer & Business Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(data.customerName || 'Valued Business Owner', margin + 5, y + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Business Name: ${data.businessName || 'SmartQR Business'}`, margin + 5, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const locationText = data.businessAddress ? data.businessAddress : 'Registered Merchant Account';
  doc.text(locationText.substring(0, 55), margin + 5, y + 24);
  doc.text(`Public Profile URL: smartqr-business.vercel.app/b/${data.businessSlug}`, margin + 5, y + 29);

  // Right col: Phone & Email
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Contact Details', pageWidth - margin - 60, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Mobile: ${data.customerPhone || 'N/A'}`, pageWidth - margin - 60, y + 19);
  doc.text(`Email: ${data.customerEmail || 'N/A'}`, pageWidth - margin - 60, y + 24);

  // 4. Subscription Validity Highlight Banner
  y += 42;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.text('SUBSCRIPTION VALIDITY DETAILS', margin + 5, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Activation Date: ${data.activatedAt}`, margin + 5, y + 12);
  doc.setTextColor(5, 150, 105);
  doc.text(`Expiry Date: ${data.expiresAt}`, margin + 85, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Subscription Status: Active 30 Days Cloud Access with Unlimited Scans', margin + 5, y + 17);

  // 5. Subscription Plan Table
  y += 26;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION AND PLAN DETAILS', margin + 4, y + 5.5);
  doc.text('BILLING CYCLE', margin + 85, y + 5.5);
  doc.text('RATE', margin + 125, y + 5.5);
  doc.text('AMOUNT IN INR', pageWidth - margin - 4, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentWidth, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 24, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`SmartQR ${data.planName} Subscription`, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dynamic QR code infrastructure, direct phone calls, WhatsApp inquiries,', margin + 4, y + 11);
  doc.text('Google 5-star review integration, cloud catalog, and instant profile sync.', margin + 4, y + 15.5);
  doc.text(`Transaction Reference: ${data.utrNumber || 'Verified Manual UPI Payment'}`, margin + 4, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('1 Month Access', margin + 85, y + 6);
  doc.text(`Rs. ${data.planPrice.toFixed(2)}`, margin + 125, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${data.planPrice.toFixed(2)}`, pageWidth - margin - 4, y + 6, { align: 'right' });

  // 6. Summary Totals Box
  y += 27;
  const totalsX = pageWidth - margin - 80;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, y);
  doc.text(`Rs. ${data.planPrice.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });

  y += 5;
  doc.text('Taxes: Included 0%', totalsX, y);
  doc.text('Rs. 0.00', pageWidth - margin - 4, y, { align: 'right' });

  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, y, pageWidth - margin, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Total Paid:', totalsX, y);
  doc.setTextColor(0, 71, 212);
  doc.text(`Rs. ${data.planPrice.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });

  // 7. Payment Verification Notes (Left side)
  const notesY = y - 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PAYMENT VERIFICATION DETAILS', margin, notesY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment Mode: ${data.paymentMethod || 'Manual UPI Transfer'}`, margin, notesY + 5);
  doc.text(`Bank Transaction UTR: ${data.utrNumber || 'VERIFIED-MANUAL'}`, margin, notesY + 9.5);
  doc.text('Verification: Confirmed and Approved by Badal Sarkar', margin, notesY + 14);

  // 8. Official Company Stamp / Seal
  // Drawn as a realistic circular certified company seal
  const stampCenterX = margin + 32;
  const stampCenterY = y + 36;
  const stampRadius = 20;

  // Outer Circle
  doc.setDrawColor(5, 150, 105); // emerald green stamp
  doc.setLineWidth(1.2);
  doc.circle(stampCenterX, stampCenterY, stampRadius, 'D');

  // Inner Circle
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.4);
  doc.circle(stampCenterX, stampCenterY, stampRadius - 2.5, 'D');

  // Stamp Texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('SMARTQR BUSINESS SOLUTIONS', stampCenterX, stampCenterY - 11, { align: 'center' });

  doc.setFontSize(6.5);
  doc.text('★ VERIFIED AND PAID ★', stampCenterX, stampCenterY - 4, { align: 'center' });

  doc.setFontSize(10);
  doc.text('VERIFIED', stampCenterX, stampCenterY + 1, { align: 'center' });

  doc.setFontSize(6);
  doc.text('BANK UTR VERIFIED', stampCenterX, stampCenterY + 6, { align: 'center' });
  doc.text('OFFICIAL CERTIFIED SEAL', stampCenterX, stampCenterY + 11, { align: 'center' });

  // Stamp Signatory on the right
  const sigX = stampCenterX + 35;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Badal Sarkar', sigX, stampCenterY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Signatory', sigX, stampCenterY + 3);
  doc.setTextColor(100, 116, 139);
  doc.text('SmartQR Business Operations', sigX, stampCenterY + 7.5);

  // 9. Bottom Footer & Disclaimer
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an official computer-generated tax invoice and verified payment receipt.', margin, footerY);
  doc.text('SmartQR Digital Infrastructure • www.smartqr.in • support@smartqr.in', pageWidth - margin, footerY, {
    align: 'right',
  });

  // Save the PDF
  const cleanInvNum = (data.invoiceNumber || 'Paid').replace(/[^a-zA-Z0-9-]/g, '');
  const filename = `SmartQR-Invoice-${cleanInvNum}.pdf`;
  doc.save(filename);
}

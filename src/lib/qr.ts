import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface QRRenderOptions {
  text: string;
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  size?: number;
}

/**
 * Generates a high-resolution base64 PNG data URL of the QR code
 */
export async function generateQRDataUrl(options: QRRenderOptions): Promise<string> {
  const {
    text,
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    size = 1024,
  } = options;

  return new Promise((resolve, reject) => {
    QRCode.toDataURL(
      text,
      {
        errorCorrectionLevel: 'H', // High error correction allows logo embedding
        margin: 2,
        width: size,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
      },
      (err, url) => {
        if (err) reject(err);
        else resolve(url);
      }
    );
  });
}

/**
 * Downloads a high-resolution PNG file directly
 */
export async function downloadQRPNG(
  text: string,
  fileName: string,
  foregroundColor: string = '#000000',
  backgroundColor: string = '#FFFFFF'
) {
  const dataUrl = await generateQRDataUrl({
    text,
    foregroundColor,
    backgroundColor,
    size: 2048,
  });

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${fileName}-smartqr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a print-ready PDF (A4 or Table Tent) from a DOM element
 */
export async function exportElementToPDF(
  elementId: string,
  fileName: string,
  orientation: 'p' | 'l' = 'p',
  format: 'a4' | 'a5' | 'a6' = 'a4'
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found.`);
  }

  const canvas = await html2canvas(element, {
    scale: 3, // High DPI for clean print
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = Math.min(pdfWidth / (canvasWidth / 3.7795), pdfHeight / (canvasHeight / 3.7795));

  const imgWidth = (canvasWidth / 3.7795) * ratio;
  const imgHeight = (canvasHeight / 3.7795) * ratio;

  const xOffset = (pdfWidth - imgWidth) / 2;
  const yOffset = (pdfHeight - imgHeight) / 2;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
  pdf.save(`${fileName}-smartqr-print.pdf`);
}

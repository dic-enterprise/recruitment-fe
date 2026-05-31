import i18n from '@/shared/i18n';

export const CV_UPLOAD_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const CV_UPLOAD_MAX_TOTAL_BYTES = 100 * 1024 * 1024;
export const CV_UPLOAD_ALLOWED_TYPES = ['application/pdf'] as const;

export type CvUploadValidationResult =
  | { ok: true; files: File[] }
  | { ok: false; message: string };

function isPdfFile(file: File): boolean {
  if (CV_UPLOAD_ALLOWED_TYPES.includes(file.type as (typeof CV_UPLOAD_ALLOWED_TYPES)[number])) {
    return true;
  }
  return file.name.toLowerCase().endsWith('.pdf');
}

export function validateCvUploadFiles(fileList: FileList | File[] | null | undefined): CvUploadValidationResult {
  const files = fileList ? Array.from(fileList) : [];
  if (files.length === 0) {
    return { ok: false, message: i18n.t('validation.selectPdf') };
  }

  const nonPdf = files.filter((f) => !isPdfFile(f));
  if (nonPdf.length > 0) {
    return { ok: false, message: i18n.t('validation.pdfOnly') };
  }

  const empty = files.filter((f) => f.size === 0);
  if (empty.length > 0) {
    return { ok: false, message: i18n.t('validation.emptyFile') };
  }

  const tooLarge = files.find((f) => f.size > CV_UPLOAD_MAX_FILE_BYTES);
  if (tooLarge) {
    return { ok: false, message: i18n.t('validation.fileTooLarge', { name: tooLarge.name }) };
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > CV_UPLOAD_MAX_TOTAL_BYTES) {
    return { ok: false, message: i18n.t('validation.totalTooLarge') };
  }

  return { ok: true, files };
}

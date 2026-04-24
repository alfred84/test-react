/**
 * Small promise-based wrapper around FileReader.readAsDataURL so the
 * UI can await base64 encoding without sprinkling event handlers.
 * Rejects if the reader emits an error or returns a non-string result.
 */
export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (): void => {
      reject(reader.error ?? new Error('No se pudo leer el archivo.'));
    };
    reader.onload = (): void => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Archivo inválido.'));
    };
    reader.readAsDataURL(file);
  });

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export interface ImageValidationResult {
  readonly ok: boolean;
  readonly message?: string;
}

export const validateImageFile = (file: File): ImageValidationResult => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, message: 'Formato no soportado. Usa PNG, JPG o WebP.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: 'La imagen debe pesar menos de 2 MB.' };
  }
  return { ok: true };
};

export const MAX_IMAGE_BYTES = 700 * 1024;

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || '';
      resolve(result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file: File, maxBytes = MAX_IMAGE_BYTES): Promise<string> {
  const dataUrl = await fileToDataURL(file);
  if (file.size <= maxBytes) {
    return dataUrl;
  }
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    throw new Error('Arquivo maior que 1MB. Reduza o tamanho antes de enviar.');
  }
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não suportado');
  let width = img.width;
  let height = img.height;
  let quality = 0.9;
  let blob: Blob | null = null;
  do {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob) break;
    if (blob.size > maxBytes) {
      quality -= 0.1;
      width *= 0.9;
      height *= 0.9;
    }
  } while (blob && blob.size > maxBytes && quality > 0.1);
  if (!blob) {
    throw new Error('Falha ao comprimir imagem');
  }
  return fileToDataURL(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

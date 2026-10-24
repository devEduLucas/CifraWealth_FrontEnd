const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function prepareProfileImage(
  file: File,
  kind: 'avatar' | 'cover' = 'avatar',
): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type))
    throw new Error('Escolha uma imagem JPG, PNG ou WebP.');
  if (file.size > 5 * 1024 * 1024)
    throw new Error('Escolha uma imagem de até 5 MB.');
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    try {
      await image.decode();
    } catch {
      throw new Error(
        'Não foi possível abrir esta imagem. Escolha outro arquivo.',
      );
    }
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 24_000_000
    )
      throw new Error('Escolha uma imagem com até 24 megapixels.');
    const ratio = kind === 'cover' ? 4 : 1;
    const sourceWidth = Math.min(
      image.naturalWidth,
      image.naturalHeight * ratio,
    );
    const sourceHeight = sourceWidth / ratio;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(
      1,
      Math.round(Math.min(kind === 'cover' ? 1280 : 512, sourceWidth)),
    );
    canvas.height = Math.max(1, Math.round(canvas.width / ratio));
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error(
        'Seu navegador não conseguiu preparar a imagem. Tente outro arquivo.',
      );
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      (image.naturalWidth - sourceWidth) / 2,
      (image.naturalHeight - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    let result = canvas.toDataURL('image/jpeg', 0.85);
    if (result.length > 273100) result = canvas.toDataURL('image/jpeg', 0.65);
    if (result.length > 273100)
      throw new Error(
        'A imagem ainda é muito grande. Escolha um arquivo menor.',
      );
    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

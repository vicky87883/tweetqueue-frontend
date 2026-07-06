export type TweetAspectRatio = '16:9' | '1:1';

export type PreparedTweetImage = {
  dataUrl: string;
  previewDataUrl: string;
  base64: string;
  previewBase64: string;
  mimeType: string;
  aspectRatio: TweetAspectRatio;
  width: number;
  height: number;
};

export const TWEET_ASPECT_RATIOS: Record<
  TweetAspectRatio,
  { label: string; width: number; height: number; description: string }
> = {
  '16:9': {
    label: '16:9',
    width: 1200,
    height: 675,
    description: 'Best for wide feed images on X',
  },
  '1:1': {
    label: '1:1',
    width: 1200,
    height: 1200,
    description: 'Square image for X posts',
  },
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    image.src = url;
  });
}

function cropToAspectRatio(
  image: HTMLImageElement,
  aspectRatio: TweetAspectRatio,
  outputWidth: number,
  outputHeight: number
) {
  const sourceRatio = image.width / image.height;
  const targetRatio = outputWidth / outputHeight;

  let cropWidth = image.width;
  let cropHeight = image.height;
  let cropX = 0;
  let cropY = 0;

  if (sourceRatio > targetRatio) {
    cropWidth = image.height * targetRatio;
    cropX = (image.width - cropWidth) / 2;
  } else if (sourceRatio < targetRatio) {
    cropHeight = image.width / targetRatio;
    cropY = (image.height - cropHeight) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare image canvas.');

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight);
  return canvas;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.88) {
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1] || '';
  return { dataUrl, base64 };
}

function estimateBase64Bytes(base64: string) {
  return Math.ceil((base64.length * 3) / 4);
}

function downscaleCanvas(source: HTMLCanvasElement, maxWidth: number) {
  if (source.width <= maxWidth) return source;

  const scale = maxWidth / source.width;
  const canvas = document.createElement('canvas');
  canvas.width = maxWidth;
  canvas.height = Math.round(source.height * scale);

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare preview canvas.');
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function prepareTweetImage(
  file: File,
  aspectRatio: TweetAspectRatio
): Promise<PreparedTweetImage> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error('Use a JPEG, PNG, WEBP, or GIF image.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image must be 5 MB or smaller before cropping.');
  }

  const image = await loadImage(file);
  const target = TWEET_ASPECT_RATIOS[aspectRatio];
  const cropped = cropToAspectRatio(image, aspectRatio, target.width, target.height);

  let quality = 0.88;
  let { dataUrl, base64 } = canvasToJpeg(cropped, quality);

  while (estimateBase64Bytes(base64) > MAX_UPLOAD_BYTES && quality > 0.5) {
    quality -= 0.08;
    ({ dataUrl, base64 } = canvasToJpeg(cropped, quality));
  }

  if (estimateBase64Bytes(base64) > MAX_UPLOAD_BYTES) {
    throw new Error('Image is still too large after compression. Try a smaller source image.');
  }

  const previewCanvas = downscaleCanvas(cropped, 480);
  const preview = canvasToJpeg(previewCanvas, 0.82);

  return {
    dataUrl,
    previewDataUrl: preview.dataUrl,
    base64,
    previewBase64: preview.base64,
    mimeType: 'image/jpeg',
    aspectRatio,
    width: target.width,
    height: target.height,
  };
}

export function aspectRatioClass(aspectRatio: TweetAspectRatio) {
  return aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';
}

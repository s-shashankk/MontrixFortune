// Resizes / re-encodes an uploaded image file to a compact JPEG data URL.
const DEFAULT_MAX_DIMENSION = 1400;
const DEFAULT_MAX_DATA_URL_LENGTH = 450000;

export const compressImageFile = async (
  file,
  { maxDimension = DEFAULT_MAX_DIMENSION, maxLength = DEFAULT_MAX_DATA_URL_LENGTH } = {}
) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const image = await loadImage(await readFileAsDataUrl(file));
  const canvas = document.createElement("canvas");
  const longestSide = Math.max(image.width, image.height);
  const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Image processing is not supported in this browser.");
  }
  // JPEG has no alpha; paint white so transparent PNGs don't turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.85;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > maxLength && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > maxLength) {
    throw new Error(`"${file.name}" is still too large after compression. Please choose a smaller image.`);
  }

  return dataUrl;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the selected image."));
    image.src = src;
  });

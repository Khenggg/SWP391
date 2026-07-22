const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_BYTES = 900 * 1024;
const MAX_IMAGE_WIDTH = 1280;
const MAX_IMAGE_HEIGHT = 960;

function formatBytes(bytes) {
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không thể đọc ảnh đã chọn."));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể đọc định dạng ảnh này. Hãy dùng PNG, JPEG hoặc WebP."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Trình duyệt không thể xử lý ảnh này."))),
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Keeps photos small enough for the 5 MB Supabase server limit while retaining
 * enough detail for a plate and the full vehicle to be checked by staff.
 */
export async function prepareParkingImage(file) {
  if (!file?.type || !["image/jpeg", "image/png", "image/webp"].includes(file.type.toLowerCase())) {
    throw new Error("Chỉ hỗ trợ ảnh PNG, JPEG hoặc WebP.");
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(`Ảnh tối đa ${formatBytes(MAX_SOURCE_IMAGE_BYTES)} trước khi tải lên.`);
  }

  const image = await loadImage(file);
  let scale = Math.min(1, MAX_IMAGE_WIDTH / image.naturalWidth, MAX_IMAGE_HEIGHT / image.naturalHeight);
  let width = Math.max(1, Math.round(image.naturalWidth * scale));
  let height = Math.max(1, Math.round(image.naturalHeight * scale));
  let fallbackBlob = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    for (let quality = 0.86; quality >= 0.5; quality -= 0.08) {
      const blob = await canvasToBlob(canvas, quality);
      fallbackBlob = blob;
      if (blob.size <= MAX_UPLOAD_IMAGE_BYTES) {
        return readAsDataUrl(blob);
      }
    }

    scale *= 0.8;
    width = Math.max(1, Math.round(image.naturalWidth * scale));
    height = Math.max(1, Math.round(image.naturalHeight * scale));
  }

  if (!fallbackBlob || fallbackBlob.size > MAX_UPLOAD_IMAGE_BYTES) {
    throw new Error("Không thể nén ảnh đủ nhỏ để tải lên. Hãy chọn ảnh rõ nét có dung lượng nhỏ hơn.");
  }

  return readAsDataUrl(fallbackBlob);
}

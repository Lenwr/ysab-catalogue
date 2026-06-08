import { supabase } from "./supabase";

const PRODUCT_BUCKET = "products";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateProductImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Format image non supporté. Utilise JPG, PNG, WebP ou GIF.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image trop lourde. Taille maximale : 5 Mo.");
  }
}

export async function uploadProductImage(folder: "covers" | "variants", file: File) {
  validateProductImage(file);

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(fileName, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message || "Erreur upload image");
  }

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(fileName);

  return data.publicUrl;
}

function getProductStoragePath(publicUrl: string | null | undefined) {
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    const marker = `/object/public/${PRODUCT_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function removeProductImageByUrl(publicUrl: string | null | undefined) {
  const path = getProductStoragePath(publicUrl);
  if (!path) return;

  await supabase.storage.from(PRODUCT_BUCKET).remove([path]);
}

export async function removeProductImagesByUrls(urls: Array<string | null | undefined>) {
  const paths = urls
    .map((url) => getProductStoragePath(url))
    .filter((path): path is string => Boolean(path));

  if (!paths.length) return;

  await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
}

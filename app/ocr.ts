import * as FileSystem from "expo-file-system/legacy";
import { getOcrKey } from "../utils/ocr";

const OCR_API_URL = "https://api.ocr.space/parse/image";
const OCR_API_KEY = getOcrKey();

type ParsedResult = {
  ParsedText?: string;
  FileParseExitCode?: number;
  ErrorMessage?: string;
  ErrorDetails?: string;
};

type OCRResult = {
  ParsedResults?: ParsedResult[];
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
  ProcessingTimeInMilliseconds?: string;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function getMimeType(uri: string): string {
  const cleanUri = uri.split("?")[0].toLowerCase();
  if (cleanUri.endsWith(".png")) {
    return "image/png";
  }
  if (cleanUri.endsWith(".jpg") || cleanUri.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (cleanUri.endsWith(".webp")) {
    return "image/webp";
  }
  if (cleanUri.endsWith(".gif")) {
    return "image/gif";
  }
  if (cleanUri.endsWith(".tif") || cleanUri.endsWith(".tiff")) {
    return "image/tiff";
  }
  if (cleanUri.endsWith(".bmp")) {
    return "image/bmp";
  }
  return "image/jpeg";
}

async function prepareLocalImage(uri: string): Promise<string> {
  if (!uri || typeof uri !== "string") {
    throw new Error("Invalid image URI.");
  }
  console.log("[OCR] Original URI:", uri);
  if (uri.startsWith("file://")) {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new Error(`Image file does not exist: ${uri}`);
    }
    return uri;
  }
  const extension = getFileExtension(uri);
  const destination = `${FileSystem.cacheDirectory}ocr-${Date.now()}${extension}`;
  console.log("[OCR] Copying image to cache:", destination);
  await FileSystem.copyAsync({
    from: uri,
    to: destination,
  });
  const copiedInfo = await FileSystem.getInfoAsync(destination);
  if (!copiedInfo.exists) {
    throw new Error("Could not create a local copy of the image.");
  }
  return destination;
}

function getFileExtension(uri: string): string {
  const cleanUri = uri.split("?")[0].toLowerCase();
  if (cleanUri.endsWith(".png")) {
    return ".png";
  }
  if (cleanUri.endsWith(".jpg") || cleanUri.endsWith(".jpeg")) {
    return ".jpg";
  }
  if (cleanUri.endsWith(".webp")) {
    return ".webp";
  }
  if (cleanUri.endsWith(".gif")) {
    return ".gif";
  }
  if (cleanUri.endsWith(".tif") || cleanUri.endsWith(".tiff")) {
    return ".tiff";
  }
  if (cleanUri.endsWith(".bmp")) {
    return ".bmp";
  }
  return ".jpg";
}

async function readFileAsBase64(uri: string): Promise<string> {
  console.log("[OCR] Reading image:", uri);
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    throw new Error(`File does not exist: ${uri}`);
  }
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (!base64 || base64.length < 100) {
    throw new Error("Image could not be converted to Base64.");
  }
  console.log("[OCR] Base64 length:", base64.length);
  return base64;
}

function cleanOCRText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function getOCRApiError(data: OCRResult): string | null {
  if (data.IsErroredOnProcessing === true) {
    if (Array.isArray(data.ErrorMessage)) {
      return data.ErrorMessage.join(" ");
    }
    return data.ErrorMessage || data.ErrorDetails || "OCR processing failed.";
  }
  if (typeof data.OCRExitCode === "number" && data.OCRExitCode !== 1) {
    if (Array.isArray(data.ErrorMessage)) {
      return data.ErrorMessage.join(" ");
    }
    return data.ErrorMessage || data.ErrorDetails || `OCR failed with exit code ${data.OCRExitCode}.`;
  }
  return null;
}

export async function scanImage(imageUri: string, attempt = 1): Promise<string> {
  console.log("========================================");
  console.log(`[OCR] SCANNING IMAGE - ATTEMPT ${attempt}/3`);
  console.log("[OCR] URI:", imageUri);
  console.log("========================================");

  if (!OCR_API_KEY) {
    throw new Error("OCR API key is missing. Check utils/ocr.ts.");
  }
  if (!imageUri || typeof imageUri !== "string") {
    throw new Error("Invalid image URI.");
  }

  try {
    const localUri = await prepareLocalImage(imageUri);
    console.log("[OCR] Local URI:", localUri);

    const mimeType = getMimeType(localUri);
    console.log("[OCR] MIME TYPE:", mimeType);

    const base64 = await readFileAsBase64(localUri);
    const base64Image = `data:${mimeType};base64,${base64}`;
    console.log("[OCR] Base64 image prepared");

    const formData = new FormData();
    formData.append("base64Image", base64Image);
    formData.append("OCREngine", "2");
    formData.append("language", "auto");
    formData.append("isOverlayRequired", "false");
    formData.append("scale", "true");
    formData.append("detectOrientation", "true");
    formData.append("isTable", "false");

    console.log("[OCR] Sending request to OCR.space...");

    const response = await fetch(OCR_API_URL, {
      method: "POST",
      headers: {
        apikey: OCR_API_KEY,
      },
      body: formData,
    });

    console.log("[OCR] HTTP STATUS:", response.status);

    const raw = await response.text();
    console.log("[OCR] RESPONSE LENGTH:", raw.length);
    console.log("[OCR] RAW RESPONSE:", raw.substring(0, 1000));

    if (!response.ok) {
      console.log("[OCR] HTTP ERROR:", raw);
      if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
        console.log(`[OCR] RETRYING AFTER HTTP ${response.status}`);
        await sleep(1500 * attempt);
        return scanImage(imageUri, attempt + 1);
      }
      throw new Error(`OCR server returned HTTP ${response.status}.`);
    }

    let data: OCRResult;
    try {
      data = JSON.parse(raw);
    } catch {
      console.log("[OCR] INVALID JSON:", raw);
      throw new Error("OCR returned invalid JSON.");
    }

    console.log("[OCR] OCR EXIT CODE:", data.OCRExitCode);
    console.log("[OCR] PARSED RESULTS:", data.ParsedResults?.length ?? 0);

    const apiError = getOCRApiError(data);
    if (apiError) {
      console.log("[OCR] API ERROR:", apiError);
      if (attempt < 3) {
        await sleep(1200 * attempt);
        return scanImage(imageUri, attempt + 1);
      }
      throw new Error(apiError);
    }

    const extractedParts = data.ParsedResults?.map((result) => result.ParsedText ?? "")
      .map(cleanOCRText)
      .filter((text) => text.length > 0) ?? [];

    const text = extractedParts.join("\n\n");

    console.log("========================================");
    console.log("[OCR] ACTUAL EXTRACTED TEXT:");
    console.log(text || "[NO TEXT DETECTED]");
    console.log("[OCR] TEXT LENGTH:", text.length);
    console.log("========================================");

    return text;
  } catch (error) {
    console.log("[OCR] IMAGE ERROR:", error);
    if (attempt < 3) {
      console.log(`[OCR] RETRYING IMAGE (${attempt + 1}/3)`);
      await sleep(1200 * attempt);
      return scanImage(imageUri, attempt + 1);
    }
    return "";
  }
}

export async function scanMultipleImages(imageUris: string[]): Promise<string> {
  const validUris = imageUris.filter((uri): uri is string => typeof uri === "string" && uri.trim().length > 0);

  console.log("========================================");
  console.log("[OCR] MULTI-IMAGE OCR START");
  console.log("[OCR] PAGES SELECTED:", validUris.length);
  console.log("========================================");

  if (validUris.length === 0) {
    return "";
  }

  const pages: string[] = [];

  for (let index = 0; index < validUris.length; index++) {
    const pageNumber = index + 1;
    const uri = validUris[index];

    console.log("========================================");
    console.log(`[OCR] PROCESSING PAGE ${pageNumber}/${validUris.length}`);
    console.log("========================================");

    try {
      const text = await scanImage(uri);
      const cleaned = cleanOCRText(text);
      if (cleaned.length > 0) {
        pages.push(`PAGE ${pageNumber}\n\n${cleaned}`);
        console.log(`[OCR] PAGE ${pageNumber}: SUCCESS`);
        console.log(`[OCR] PAGE ${pageNumber} TEXT LENGTH:`, cleaned.length);
      } else {
        pages.push(`PAGE ${pageNumber}\n\n[No text detected on this page.]`);
        console.log(`[OCR] PAGE ${pageNumber}: NO TEXT`);
      }
    } catch (error) {
      console.log(`[OCR] PAGE ${pageNumber}: FAILED`, error);
      pages.push(`PAGE ${pageNumber}\n\n[This page could not be scanned.]`);
    }

    if (index < validUris.length - 1) {
      await sleep(1000);
    }
  }

  const combinedText = pages.join("\n\n────────────────────\n\n");

  console.log("========================================");
  console.log("[OCR] MULTI-IMAGE OCR COMPLETE");
  console.log("[OCR] PAGES SELECTED:", validUris.length);
  console.log("[OCR] PAGES PROCESSED:", pages.length);
  console.log("[OCR] TOTAL TEXT LENGTH:", combinedText.length);
  console.log("========================================");

  return combinedText;
}
import * as FileSystem from "expo-file-system/legacy";

const OCR_API_URL = "https://api.ocr.space/parse/image";
const OCR_API_KEY = "helloworld";

type OCRResult = {
  ParsedResults?: {
    ParsedText?: string;
  }[];
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
};

async function scanImage(imageUri: string): Promise<string> {
  try {
    console.log("================================");
    console.log("OCR IMAGE:", imageUri);

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Base64 length:", base64.length);

    if (!base64) {
      throw new Error("Could not read image as Base64.");
    }

    const base64Image = `data:image/jpeg;base64,${base64}`;
    console.log("Sending Base64 image to OCR.space...");

    const formData = new FormData();
    formData.append("base64Image", base64Image);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("OCREngine", "2");
    formData.append("scale", "true");
    formData.append("detectOrientation", "true");

    const response = await fetch(OCR_API_URL, {
      method: "POST",
      headers: {
        apikey: OCR_API_KEY,
      },
      body: formData,
    });

    console.log("OCR HTTP STATUS:", response.status);

    const responseText = await response.text();
    console.log("OCR RAW RESPONSE:", responseText);

    if (!response.ok) {
      throw new Error(`OCR server returned HTTP ${response.status}`);
    }

    let data: OCRResult;
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("OCR returned invalid JSON.");
    }

    if (data.IsErroredOnProcessing) {
      console.log("OCR PROCESSING ERROR:", data.ErrorMessage);
      console.log("OCR ERROR DETAILS:", data.ErrorDetails);
      return "";
    }

    const text = data.ParsedResults?.map((result) => result.ParsedText ?? "").join("\n").trim() ?? "";
    console.log("OCR EXTRACTED TEXT:", text);
    return text;
  } catch (error) {
    console.log("OCR IMAGE ERROR:", error);
    return "";
  }
}

export async function scanMultipleImages(imageUris: string[]): Promise<string> {
  if (!imageUris || imageUris.length === 0) {
    return "";
  }

  const pages: string[] = [];
  for (let i = 0; i < imageUris.length; i++) {
    const text = await scanImage(imageUris[i]);
    if (text.trim()) {
      pages.push(`Page ${i + 1}\n${text.trim()}`);
    }
  }

  return pages.join("\n\n--------------------\n\n");
}
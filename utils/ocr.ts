import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";

const OCR_API_URL = "https://api.ocr.space/parse/image";

/* ============================================================
   OCR API KEY
   ============================================================ */

export function getOcrKey(): string | undefined {
  const key =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_OCR_API_KEY ??
    process.env.EXPO_PUBLIC_OCR_API_KEY;

  console.log(
    "[OCR] API KEY:",
    key ? "FOUND" : "MISSING"
  );

  return key;
}

/* ============================================================
   TYPES
   ============================================================ */

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

/* ============================================================
   HELPERS
   ============================================================ */

const sleep = (ms: number) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, ms)
  );

/* ============================================================
   FILE EXTENSION
   ============================================================ */

function getFileExtension(uri: string): string {
  const cleanUri = uri
    .split("?")[0]
    .toLowerCase();

  if (cleanUri.endsWith(".png")) {
    return ".png";
  }

  if (
    cleanUri.endsWith(".jpg") ||
    cleanUri.endsWith(".jpeg")
  ) {
    return ".jpg";
  }

  if (cleanUri.endsWith(".webp")) {
    return ".webp";
  }

  if (cleanUri.endsWith(".gif")) {
    return ".gif";
  }

  if (
    cleanUri.endsWith(".tif") ||
    cleanUri.endsWith(".tiff")
  ) {
    return ".tiff";
  }

  if (cleanUri.endsWith(".bmp")) {
    return ".bmp";
  }

  return ".jpg";
}

/* ============================================================
   MIME TYPE
   ============================================================ */

function getMimeType(uri: string): string {
  const cleanUri = uri
    .split("?")[0]
    .toLowerCase();

  if (cleanUri.endsWith(".png")) {
    return "image/png";
  }

  if (
    cleanUri.endsWith(".jpg") ||
    cleanUri.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (cleanUri.endsWith(".webp")) {
    return "image/webp";
  }

  if (cleanUri.endsWith(".gif")) {
    return "image/gif";
  }

  if (
    cleanUri.endsWith(".tif") ||
    cleanUri.endsWith(".tiff")
  ) {
    return "image/tiff";
  }

  if (cleanUri.endsWith(".bmp")) {
    return "image/bmp";
  }

  return "image/jpeg";
}

/* ============================================================
   PREPARE LOCAL IMAGE
   ============================================================ */

async function prepareLocalImage(
  uri: string
): Promise<string> {
  if (
    !uri ||
    typeof uri !== "string"
  ) {
    throw new Error(
      "Invalid image URI."
    );
  }

  console.log("========================================");
  console.log("[OCR] PREPARING IMAGE");
  console.log("[OCR] ORIGINAL URI:");
  console.log(uri);
  console.log("========================================");

  /*
   * If this is already a file:// URI, verify that
   * the file actually exists first.
   */

  if (uri.startsWith("file://")) {
    try {
      const info =
        await FileSystem.getInfoAsync(uri);

      console.log(
        "[OCR] ORIGINAL FILE EXISTS:",
        info.exists
      );

      if (info.exists) {
        console.log(
          "[OCR] Using existing file:// URI."
        );

        return uri;
      }
    } catch (error) {
      console.log(
        "[OCR] Could not inspect original file:",
        error
      );
    }
  }

  /*
   * Otherwise copy the image into the cache directory.
   */

  if (!FileSystem.cacheDirectory) {
    throw new Error(
      "FileSystem cache directory is unavailable."
    );
  }

  const extension =
    getFileExtension(uri);

  const destination =
    `${FileSystem.cacheDirectory}ocr-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}${extension}`;

  console.log(
    "[OCR] CACHE DESTINATION:"
  );

  console.log(destination);

  try {
    await FileSystem.copyAsync({
      from: uri,
      to: destination,
    });

    console.log(
      "[OCR] IMAGE COPY SUCCESS"
    );
  } catch (error) {
    console.log(
      "[OCR] IMAGE COPY FAILED:"
    );

    console.log(error);

    throw new Error(
      `Could not copy image for OCR.\nURI: ${uri}`
    );
  }

  const copiedInfo =
    await FileSystem.getInfoAsync(
      destination
    );

  console.log(
    "[OCR] COPIED FILE EXISTS:",
    copiedInfo.exists
  );

  if (!copiedInfo.exists) {
    throw new Error(
      "Image copy was created but could not be found."
    );
  }

  return destination;
}

/* ============================================================
   READ BASE64
   ============================================================ */

async function readFileAsBase64(
  uri: string
): Promise<string> {
  console.log(
    "[OCR] READING IMAGE AS BASE64"
  );

  console.log(
    "[OCR] FILE:",
    uri
  );

  const info =
    await FileSystem.getInfoAsync(uri);

  if (!info.exists) {
    throw new Error(
      `OCR image does not exist: ${uri}`
    );
  }

  const base64 =
    await FileSystem.readAsStringAsync(
      uri,
      {
        encoding:
          FileSystem.EncodingType.Base64,
      }
    );

  console.log(
    "[OCR] BASE64 LENGTH:",
    base64.length
  );

  if (
    !base64 ||
    base64.length < 100
  ) {
    throw new Error(
      "Image was read, but Base64 data is empty or invalid."
    );
  }

  return base64;
}

/* ============================================================
   CLEAN TEXT
   ============================================================ */

function cleanOCRText(
  text: string
): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/* ============================================================
   API ERROR
   ============================================================ */

function getOCRApiError(
  data: OCRResult
): string | null {
  if (
    data.IsErroredOnProcessing === true
  ) {
    if (
      Array.isArray(
        data.ErrorMessage
      )
    ) {
      return data.ErrorMessage.join(
        " "
      );
    }

    return (
      data.ErrorMessage ||
      data.ErrorDetails ||
      "OCR processing failed."
    );
  }

  if (
    typeof data.OCRExitCode ===
      "number" &&
    data.OCRExitCode !== 1
  ) {
    if (
      Array.isArray(
        data.ErrorMessage
      )
    ) {
      return data.ErrorMessage.join(
        " "
      );
    }

    return (
      data.ErrorMessage ||
      data.ErrorDetails ||
      `OCR failed with exit code ${data.OCRExitCode}.`
    );
  }

  return null;
}

/* ============================================================
   SINGLE IMAGE OCR
   ============================================================ */

export async function scanImage(
  imageUri: string,
  attempt = 1
): Promise<string> {
  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    `[OCR] SCAN START - ATTEMPT ${attempt}/3`
  );
  console.log(
    "========================================"
  );

  console.log(
    "[OCR] INPUT URI:"
  );

  console.log(imageUri);

  /* ----------------------------------------------------------
     API KEY
     ---------------------------------------------------------- */

  const apiKey =
    getOcrKey();

  if (!apiKey) {
    throw new Error(
      "OCR API key is missing. Check EXPO_PUBLIC_OCR_API_KEY."
    );
  }

  /* ----------------------------------------------------------
     VALIDATE URI
     ---------------------------------------------------------- */

  if (
    !imageUri ||
    typeof imageUri !== "string"
  ) {
    throw new Error(
      "Invalid image URI."
    );
  }

  try {
    /* --------------------------------------------------------
       STEP 1 — PREPARE IMAGE
       -------------------------------------------------------- */

    console.log(
      "[OCR] STEP 1: PREPARING IMAGE"
    );

    const localUri =
      await prepareLocalImage(
        imageUri
      );

    console.log(
      "[OCR] LOCAL URI:",
      localUri
    );

    /* --------------------------------------------------------
       STEP 2 — MIME TYPE
       -------------------------------------------------------- */

    console.log(
      "[OCR] STEP 2: DETECTING MIME TYPE"
    );

    const mimeType =
      getMimeType(localUri);

    console.log(
      "[OCR] MIME TYPE:",
      mimeType
    );

    /* --------------------------------------------------------
       STEP 3 — BASE64
       -------------------------------------------------------- */

    console.log(
      "[OCR] STEP 3: READING BASE64"
    );

    const base64 =
      await readFileAsBase64(
        localUri
      );

    console.log(
      "[OCR] BASE64 READY"
    );

    /* --------------------------------------------------------
       STEP 4 — DATA URL
       -------------------------------------------------------- */

    const base64Image =
      `data:${mimeType};base64,${base64}`;

    console.log(
      "[OCR] STEP 4: DATA URL CREATED"
    );

    console.log(
      "[OCR] DATA URL PREFIX:",
      base64Image.substring(
        0,
        40
      )
    );

    /* --------------------------------------------------------
       STEP 5 — FORM DATA
       -------------------------------------------------------- */

    console.log(
      "[OCR] STEP 5: BUILDING FORM DATA"
    );

    const formData =
      new FormData();

    formData.append(
      "base64Image",
      base64Image
    );

    formData.append(
      "language",
      "eng"
    );

    formData.append(
      "OCREngine",
      "2"
    );

    formData.append(
      "isOverlayRequired",
      "false"
    );

    formData.append(
      "scale",
      "true"
    );

    formData.append(
      "detectOrientation",
      "true"
    );

    formData.append(
      "isTable",
      "false"
    );

    /*
     * The API key is sent in the header only.
     */

    console.log(
      "[OCR] FORM DATA READY"
    );

    /* --------------------------------------------------------
       STEP 6 — REQUEST
       -------------------------------------------------------- */

    console.log(
      "[OCR] STEP 6: SENDING TO OCR.SPACE"
    );

    const response =
      await fetch(
        OCR_API_URL,
        {
          method: "POST",

          headers: {
            apikey: apiKey,
          },

          body: formData,
        }
      );

    console.log(
      "[OCR] HTTP STATUS:",
      response.status
    );

    /* --------------------------------------------------------
       STEP 7 — RAW RESPONSE
       -------------------------------------------------------- */

    const raw =
      await response.text();

    console.log(
      "[OCR] RESPONSE LENGTH:",
      raw.length
    );

    console.log(
      "[OCR] RAW RESPONSE:"
    );

    console.log(
      raw.substring(
        0,
        2000
      )
    );

    /* --------------------------------------------------------
       STEP 8 — HTTP ERROR
       -------------------------------------------------------- */

    if (!response.ok) {
      console.log(
        "[OCR] HTTP REQUEST FAILED"
      );

      if (
        attempt < 3 &&
        (
          response.status === 429 ||
          response.status >= 500
        )
      ) {
        console.log(
          `[OCR] RETRYING HTTP ERROR ${response.status}`
        );

        await sleep(
          1500 * attempt
        );

        return scanImage(
          imageUri,
          attempt + 1
        );
      }

      throw new Error(
        `OCR server returned HTTP ${response.status}: ${raw}`
      );
    }

    /* --------------------------------------------------------
       STEP 9 — JSON
       -------------------------------------------------------- */

    let data: OCRResult;

    try {
      data =
        JSON.parse(raw);
    } catch {
      throw new Error(
        "OCR returned invalid JSON."
      );
    }

    console.log(
      "[OCR] OCR EXIT CODE:",
      data.OCRExitCode
    );

    console.log(
      "[OCR] PARSED RESULTS:",
      data.ParsedResults?.length ?? 0
    );

    /* --------------------------------------------------------
       STEP 10 — API ERROR
       -------------------------------------------------------- */

    const apiError =
      getOCRApiError(data);

    if (apiError) {
      console.log(
        "[OCR] API ERROR:",
        apiError
      );

      if (attempt < 3) {
        await sleep(
          1200 * attempt
        );

        return scanImage(
          imageUri,
          attempt + 1
        );
      }

      throw new Error(
        apiError
      );
    }

    /* --------------------------------------------------------
       STEP 11 — EXTRACT TEXT
       -------------------------------------------------------- */

    const extractedParts =
      data.ParsedResults
        ?.map(
          (result) =>
            result.ParsedText ??
            ""
        )
        .map(
          cleanOCRText
        )
        .filter(
          (text) =>
            text.length > 0
        ) ?? [];

    const text =
      extractedParts.join(
        "\n\n"
      );

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "[OCR] SUCCESS"
    );
    console.log(
      "[OCR] EXTRACTED TEXT:"
    );
    console.log(
      text ||
        "[NO TEXT DETECTED]"
    );
    console.log(
      "[OCR] TEXT LENGTH:",
      text.length
    );
    console.log(
      "========================================"
    );
    console.log("");

    return text;

  } catch (error) {
    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "[OCR] SCAN FAILED"
    );
    console.log(
      "[OCR] ERROR:"
    );
    console.log(error);
    console.log(
      "========================================"
    );
    console.log("");

    if (
      attempt < 3
    ) {
      console.log(
        `[OCR] RETRYING - ${attempt + 1}/3`
      );

      await sleep(
        1200 * attempt
      );

      return scanImage(
        imageUri,
        attempt + 1
      );
    }

    throw error;
  }
}

/* ============================================================
   MULTI-IMAGE OCR
   ============================================================ */

export async function scanMultipleImages(
  imageUris: string[]
): Promise<string> {
  const validUris =
    imageUris.filter(
      (
        uri
      ): uri is string =>
        typeof uri === "string" &&
        uri.trim().length > 0
    );

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "[OCR] MULTI-IMAGE OCR START"
  );
  console.log(
    "[OCR] PAGES SELECTED:",
    validUris.length
  );
  console.log(
    "========================================"
  );

  if (
    validUris.length === 0
  ) {
    console.log(
      "[OCR] NO VALID IMAGE URIS"
    );

    return "";
  }

  const pages: string[] = [];

  for (
    let index = 0;
    index < validUris.length;
    index++
  ) {
    const pageNumber =
      index + 1;

    const uri =
      validUris[index];

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      `[OCR] PAGE ${pageNumber}/${validUris.length}`
    );
    console.log(
      "[OCR] URI:",
      uri
    );
    console.log(
      "========================================"
    );

    try {
      const text =
        await scanImage(
          uri
        );

      const cleaned =
        cleanOCRText(
          text
        );

      if (
        cleaned.length > 0
      ) {
        pages.push(
          `PAGE ${pageNumber}\n\n${cleaned}`
        );

        console.log(
          `[OCR] PAGE ${pageNumber}: SUCCESS`
        );

        console.log(
          `[OCR] PAGE ${pageNumber} TEXT LENGTH:`,
          cleaned.length
        );
      } else {
        pages.push(
          `PAGE ${pageNumber}\n\n[No text detected on this page.]`
        );

        console.log(
          `[OCR] PAGE ${pageNumber}: NO TEXT`
        );
      }

    } catch (error) {
      console.log(
        `[OCR] PAGE ${pageNumber}: FAILED`
      );

      console.log(error);

      pages.push(
        `PAGE ${pageNumber}\n\n[This page could not be scanned.]`
      );
    }

    if (
      index <
      validUris.length - 1
    ) {
      await sleep(1000);
    }
  }

  const combinedText =
    pages.join(
      "\n\n────────────────────\n\n"
    );

  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    "[OCR] MULTI-IMAGE OCR COMPLETE"
  );
  console.log(
    "[OCR] PAGES SELECTED:",
    validUris.length
  );
  console.log(
    "[OCR] PAGES PROCESSED:",
    pages.length
  );
  console.log(
    "[OCR] TOTAL TEXT LENGTH:",
    combinedText.length
  );
  console.log(
    "========================================"
  );

  return combinedText;
}
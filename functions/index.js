import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineString } from "firebase-functions/params";

const geminiApiKey = defineString("GEMINI_API_KEY");

export const summarize = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { fileContent, fileName, fileType } = req.body;

  if (!fileContent || !fileName || !fileType) {
    res.status(400).json({ error: "fileContent, fileName, fileType are required" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;

    if (fileType.startsWith("image/")) {
      // 이미지 파일
      const base64Data = fileContent.includes(",")
        ? fileContent.split(",")[1]
        : fileContent;

      result = await model.generateContent([
        "이 이미지의 내용을 한국어로 상세하게 설명하고 요약해주세요. 이미지에 텍스트가 있다면 그 내용도 포함해주세요.",
        { inlineData: { data: base64Data, mimeType: fileType } },
      ]);
    } else if (
      fileType === "application/pdf" ||
      fileName.toLowerCase().endsWith(".pdf")
    ) {
      // PDF 파일
      const base64Data = fileContent.includes(",")
        ? fileContent.split(",")[1]
        : fileContent;

      result = await model.generateContent([
        "이 PDF 문서의 내용을 한국어로 상세하게 요약해주세요. 주요 내용을 여러 단락으로 나누어 설명해주세요.",
        { inlineData: { data: base64Data, mimeType: "application/pdf" } },
      ]);
    } else {
      // 텍스트 파일
      result = await model.generateContent(
        `당신은 전문적인 요약 전문가입니다. 다음 텍스트를 한국어로 여러 단락으로 나누어 주요 내용을 자세히 설명해주세요:\n\n${fileContent}`
      );
    }

    const summary = result.response.text();
    res.json({ summary });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "요약 중 오류가 발생했습니다.",
    });
  }
});

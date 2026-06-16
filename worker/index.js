export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const { fileContent, fileName, fileType } = await request.json();

      if (!fileContent || !fileName || !fileType) {
        return Response.json(
          { error: "fileContent, fileName, fileType are required" },
          { status: 400 }
        );
      }

      const contents = buildContents(fileContent, fileName, fileType);

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (!geminiRes.ok) {
        const err = await geminiRes.text();
        console.error("Gemini API error:", err);
        return Response.json(
          { error: "AI 요약 중 오류가 발생했습니다." },
          { status: 502 }
        );
      }

      const data = await geminiRes.json();
      const summary =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "요약을 생성할 수 없습니다.";

      return Response.json(
        { summary },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    } catch (error) {
      console.error("Worker error:", error);
      return Response.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }
  },
};

function buildContents(fileContent, fileName, fileType) {
  if (fileType.startsWith("image/")) {
    const base64Data = fileContent.includes(",")
      ? fileContent.split(",")[1]
      : fileContent;

    return [
      {
        parts: [
          {
            text: "이 이미지의 내용을 한국어로 상세하게 설명하고 요약해주세요. 이미지에 텍스트가 있다면 그 내용도 포함해주세요.",
          },
          {
            inline_data: { mime_type: fileType, data: base64Data },
          },
        ],
      },
    ];
  }

  if (
    fileType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  ) {
    const base64Data = fileContent.includes(",")
      ? fileContent.split(",")[1]
      : fileContent;

    return [
      {
        parts: [
          {
            text: "이 PDF 문서의 내용을 한국어로 상세하게 요약해주세요. 주요 내용을 여러 단락으로 나누어 설명해주세요.",
          },
          {
            inline_data: { mime_type: "application/pdf", data: base64Data },
          },
        ],
      },
    ];
  }

  // 텍스트 파일
  return [
    {
      parts: [
        {
          text: `당신은 전문적인 요약 전문가입니다. 다음 텍스트를 한국어로 여러 단락으로 나누어 주요 내용을 자세히 설명해주세요:\n\n${fileContent}`,
        },
      ],
    },
  ];
}

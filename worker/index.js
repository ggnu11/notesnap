const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
    }

    try {
      const { fileContent, fileName, fileType } = await request.json();

      if (!fileContent || !fileName || !fileType) {
        return Response.json(
          { error: "fileContent, fileName, fileType are required" },
          { status: 400, headers: corsHeaders }
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
        const errText = await geminiRes.text();
        console.error("Gemini API error:", errText);
        return Response.json(
          { error: `Gemini API 오류 (${geminiRes.status}): ${errText}` },
          { status: 502, headers: corsHeaders }
        );
      }

      const data = await geminiRes.json();
      const summary =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "요약을 생성할 수 없습니다.";

      return Response.json({ summary }, { headers: corsHeaders });
    } catch (error) {
      console.error("Worker error:", error);
      return Response.json(
        { error: `서버 오류: ${error.message}` },
        { status: 500, headers: corsHeaders }
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

const API_URL = import.meta.env.VITE_API_URL || "https://notesnap-api.choiyounghun0712.workers.dev";

/**
 * Firebase Functions를 통해 파일 요약 요청
 */
export const summarizeFile = async (
  fileContent: string,
  fileName: string,
  fileType: string
): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileContent, fileName, fileType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `서버 오류 (${response.status})`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`요약 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error("요약 중 알 수 없는 오류가 발생했습니다.");
  }
};

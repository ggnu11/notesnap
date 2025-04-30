import { useState } from "react";

// 절대 경로를 사용하여 모듈 가져오기
import { FileUploader } from "@/features/summary/ui/FileUploader";
import { SummaryResult } from "@/features/summary/ui/SummaryResult";
import { ErrorMessage } from "@/features/summary/ui/ErrorMessage";
import { ResetButton } from "@/features/summary/ui/ResetButton";
import { isTextFile } from "@/features/summary/lib/fileUtils";
import { summarizeText } from "@/features/summary/lib/summaryAlgorithm";

/**
 * NoteSnap 메인 컴포넌트
 * 파일 업로드 및 텍스트 요약 기능을 제공
 */
const NoteSnap = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 파일 처리 함수
   */
  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setError(null);
    setSummary(null);

    try {
      if (isTextFile(file)) {
        const text = await file.text();
        setSummary(summarizeText(text));
      } else {
        setError("지원하지 않는 파일 형식입니다. 텍스트 파일만 요약할 수 있습니다.");
      }
    } catch (err) {
      setError("파일 처리 중 오류가 발생했습니다.");
      console.error("File processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 상태 초기화 함수
   */
  const handleReset = () => {
    setSelectedFile(null);
    setSummary(null);
    setError(null);
    setIsProcessing(false);

    // 파일 입력란 초기화
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 초기화 버튼 표시 여부 (파일이 선택되었거나 요약/에러가 있을 때만 표시)
  const showResetButton = !isProcessing && (selectedFile !== null || summary !== null || error !== null);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-3xl font-bold text-teal-500">NoteSnap</h1>
      <p className="mt-4 text-lg text-teal-600">파일을 업로드하여 내용을 요약해보세요</p>

      <FileUploader 
        onFileSelect={processFile} 
        isProcessing={isProcessing} 
      />

      {selectedFile && !isProcessing && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-medium">
            <span className="font-bold">{selectedFile.name}</span> 파일이 선택되었습니다
          </p>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
      {summary && <SummaryResult summary={summary} />}
      
      {showResetButton && (
        <div className="mt-4 text-center">
          <ResetButton onReset={handleReset} disabled={isProcessing} />
        </div>
      )}
    </div>
  );
};

export default NoteSnap;
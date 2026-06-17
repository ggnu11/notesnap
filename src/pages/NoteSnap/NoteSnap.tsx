import { useState } from "react";

import { FileUploader } from "@/features/summary/ui/FileUploader";
import { SummaryResult } from "@/features/summary/ui/SummaryResult";
import { ErrorMessage } from "@/features/summary/ui/ErrorMessage";
import { ResetButton } from "@/features/summary/ui/ResetButton";
import { isTextFile, isImageFile, isPDFFile, fileToBase64 } from "@/features/summary/lib/fileUtils";
import { summarizeFile } from "@/services/gemini";

const NoteSnap = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setError(null);
    setSummary(null);

    try {
      const isSupported = isTextFile(file) || isImageFile(file) || isPDFFile(file);

      if (!isSupported) {
        setError("지원하지 않는 파일 형식입니다. 텍스트, 이미지, PDF 파일만 요약할 수 있습니다.");
        return;
      }

      let fileContent: string;
      if (isTextFile(file)) {
        fileContent = await file.text();
      } else {
        fileContent = await fileToBase64(file);
      }

      const summaryResult = await summarizeFile(fileContent, file.name, file.type);
      setSummary(summaryResult);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("파일 처리 중 오류가 발생했습니다.");
      }
      console.error("File processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSummary(null);
    setError(null);
    setIsProcessing(false);
  };

  // 요약 성공 시: 결과만 표시
  if (summary) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4">
        <h1 className="text-3xl font-bold text-teal-500">NoteSnap</h1>
        <SummaryResult summary={summary} fileName={selectedFile?.name} />
        <div className="mt-4">
          <ResetButton onReset={handleReset} />
        </div>
      </div>
    );
  }

  // 기본: 파일 업로드 화면
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-3xl font-bold text-teal-500">NoteSnap</h1>
      <p className="mt-4 text-lg text-teal-600">파일을 업로드하여 내용을 요약해보세요</p>

      <FileUploader
        onFileSelect={processFile}
        isProcessing={isProcessing}
      />

      {error && <ErrorMessage message={error} />}

      {error && (
        <div className="mt-4">
          <ResetButton onReset={handleReset} />
        </div>
      )}
    </div>
  );
};

export default NoteSnap;

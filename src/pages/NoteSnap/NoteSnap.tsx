import React, { useState } from "react";

const NoteSnap = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setError(null);
    setSummary(null);

    try {
      // 텍스트 파일만 처리
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

  const isTextFile = (file: File): boolean => {
    // 텍스트 파일 MIME 타입 확인
    const textTypes = [
      'text/plain', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/xml', 'text/markdown', 'text/csv'
    ];
    
    if (textTypes.includes(file.type)) {
      return true;
    }
    
    // 확장자로 확인 (MIME 타입이 없는 경우)
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.csv', '.xml'];
    const fileName = file.name.toLowerCase();
    return textExtensions.some(ext => fileName.endsWith(ext));
  };

  const summarizeText = (text: string): string => {
    // 텍스트가 매우 짧으면 그대로 반환
    if (text.length < 100) {
      return text;
    }

    try {
      // 문장 분리 (한글, 영어 모두 고려)
      const sentences = text.split(/(?<=[.!?])\s+/);
      
      // 텍스트에 문장이 적으면 더 간단한 접근 방식 사용
      if (sentences.length <= 3) {
        return text.length > 300 ? text.substring(0, 297) + "..." : text;
      }
      
      // 단어 빈도 계산
      const wordFrequency: Record<string, number> = {};
      const words = text.toLowerCase().match(/\b[\w\uAC00-\uD7A3]+\b/g) || [];
      words.forEach(word => {
        if (word.length > 1) { // 짧은 단어 제외
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
      
      // 중요 단어 추출 (상위 10개)
      const importantWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
      
      // 문장 점수 계산
      const sentenceScores = sentences.map(sentence => {
        if (sentence.trim().length === 0) return { sentence, score: 0 };
        
        const sentenceWords = sentence.toLowerCase().match(/\b[\w\uAC00-\uD7A3]+\b/g) || [];
        let score = 0;
        
        // 중요 단어 포함 여부 확인
        importantWords.forEach(word => {
          if (sentence.toLowerCase().includes(word)) {
            score += 1;
          }
        });
        
        // 문장 길이에 따른 가중치 (너무 짧거나 긴 문장 패널티)
        const lengthFactor = Math.min(1, sentenceWords.length / 10) * Math.min(1, 30 / sentenceWords.length);
        score = score * lengthFactor;
        
        // 문장 위치에 따른 가중치 (첫 문장과 마지막 문장은 중요도 높음)
        const positionIndex = sentences.indexOf(sentence);
        if (positionIndex === 0 || positionIndex === sentences.length - 1) {
          score *= 1.5;
        }
        
        return { sentence, score };
      });
      
      // 점수 기준으로 정렬
      sentenceScores.sort((a, b) => b.score - a.score);
      
      // 상위 3-5개 문장 선택
      const summaryLength = Math.min(5, Math.max(3, Math.ceil(sentences.length / 6)));
      const topSentences = sentenceScores
        .slice(0, summaryLength)
        .filter(item => item.sentence.trim().length > 0);
      
      // 원래 순서로 정렬
      topSentences.sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));
      
      // 최종 요약 생성
      let summary = topSentences.map(item => item.sentence.trim()).join(" ");
      
      // 결과가 너무 길면 자름
      if (summary.length > 400) {
        const lastPeriodIndex = summary.lastIndexOf(".", 397);
        summary = summary.substring(0, lastPeriodIndex >= 0 ? lastPeriodIndex + 1 : 397) + "...";
      }
      
      return summary || "요약할 수 있는 내용이 없습니다.";
    } catch (err) {
      console.error("Summarization error:", err);
      return text.length > 300 ? text.substring(0, 297) + "..." : text;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-3xl font-bold text-teal-500">NoteSnap</h1>
      <p className="mt-4 text-lg text-teal-600">파일을 업로드하여 내용을 요약해보세요</p>

      <div
        className={`mt-6 p-8 border-2 border-dashed rounded-lg w-full md:w-3/4 lg:w-1/2 text-center transition-all ${
          isProcessing ? "border-yellow-300 bg-yellow-50" : "border-teal-300 hover:border-teal-400 hover:bg-teal-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isProcessing ? (
          <p className="text-yellow-600">처리 중...</p>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mt-2 text-teal-500">파일을 여기에 드래그하세요</p>
            <p className="text-teal-500">또는</p>
            <label
              htmlFor="fileInput"
              className="mt-2 cursor-pointer inline-block px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-all"
            >
              파일 선택하기
            </label>
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      {selectedFile && !isProcessing && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-medium">
            <span className="font-bold">{selectedFile.name}</span> 파일이 선택되었습니다
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border rounded-lg bg-red-50 text-red-600 w-full md:w-3/4 lg:w-1/2">
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="mt-6 p-6 border rounded-lg bg-white shadow-md w-full md:w-3/4 lg:w-1/2">
          <h2 className="text-xl font-semibold mb-3 text-teal-700 border-b pb-2">요약 결과</h2>
          <p className="text-gray-700 whitespace-pre-line">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default NoteSnap;
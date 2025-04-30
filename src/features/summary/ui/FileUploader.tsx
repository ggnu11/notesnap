import React from "react";

type FileUploaderProps = {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
};

/**
 * 파일 업로드 컴포넌트
 */
export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  isProcessing 
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
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
  );
};
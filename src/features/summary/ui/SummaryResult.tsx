import React from "react";

type SummaryResultProps = {
  summary: string;
};

/**
 * 요약 결과 표시 컴포넌트
 */
export const SummaryResult: React.FC<SummaryResultProps> = ({ summary }) => {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-white shadow-md w-full max-w-4xl">
      <h2 className="text-xl font-semibold mb-3 text-teal-700 border-b pb-2">📝 요약 결과</h2>
      <div className="max-h-96 overflow-y-auto">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};
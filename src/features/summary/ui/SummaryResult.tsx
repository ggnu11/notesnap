import React from "react";

type SummaryResultProps = {
  summary: string;
};

/**
 * 요약 결과 표시 컴포넌트
 */
export const SummaryResult: React.FC<SummaryResultProps> = ({ summary }) => {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-white shadow-md w-full md:w-3/4 lg:w-1/2">
      <h2 className="text-xl font-semibold mb-3 text-teal-700 border-b pb-2">요약 결과</h2>
      <p className="text-gray-700 whitespace-pre-line">{summary}</p>
    </div>
  );
};
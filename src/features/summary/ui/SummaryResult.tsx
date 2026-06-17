import React from "react";

type SummaryResultProps = {
  summary: string;
  fileName?: string;
};

export const SummaryResult: React.FC<SummaryResultProps> = ({ summary, fileName }) => {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-white shadow-md w-full max-w-4xl">
      <h2 className="text-xl font-semibold mb-3 text-teal-700 border-b pb-2">
        {fileName ? `${fileName} 요약 결과` : "요약 결과"}
      </h2>
      <div className="max-h-[60vh] overflow-y-auto">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};

import React from "react";

type ResetButtonProps = {
  onReset: () => void;
  disabled?: boolean;
};

/**
 * 초기화 버튼 컴포넌트
 */
export const ResetButton: React.FC<ResetButtonProps> = ({ 
  onReset, 
  disabled = false 
}) => {
  return (
    <button
      onClick={onReset}
      disabled={disabled}
      className={`mt-4 px-4 py-2 rounded-lg text-white transition-all ${
        disabled 
          ? "bg-gray-400 cursor-not-allowed" 
          : "bg-red-500 hover:bg-red-600"
      }`}
    >
      초기화
    </button>
  );
};
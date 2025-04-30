import React from "react";

type ErrorMessageProps = {
  message: string;
};

/**
 * 에러 메시지 표시 컴포넌트
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-red-50 text-red-600 w-full md:w-3/4 lg:w-1/2">
      <p>{message}</p>
    </div>
  );
};
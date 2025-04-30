/**
 * 파일 유형 검사 유틸리티 함수
 * @param file 검사할 파일 객체
 * @returns 텍스트 파일 여부
 */
export const isTextFile = (file: File): boolean => {
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
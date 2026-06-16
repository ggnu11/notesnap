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

/**
 * 이미지 파일 여부 확인
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * PDF 파일 여부 확인
 */
export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
};

/**
 * 파일을 Base64로 인코딩
 * @param file 인코딩할 파일
 * @returns Base64 인코딩된 문자열 (Data URL 형식)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };

    reader.readAsDataURL(file);
  });
};
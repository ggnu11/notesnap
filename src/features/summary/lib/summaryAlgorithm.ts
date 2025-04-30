/**
 * 텍스트 요약 알고리즘
 * @param text 요약할 텍스트
 * @returns 요약된 텍스트
 */
export const summarizeText = (text: string): string => {
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
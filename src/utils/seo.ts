import { BlogPostResponse, SEOAnalysis, DetailedKeywordStatus } from "../types";

/**
 * Analyzes the generated blog content against SEO rules and Naver Blog standards.
 */
export function analyzeSEO(
  output: BlogPostResponse,
  mainKeyword: string,
  detailedKeywordsRaw: string
): SEOAnalysis {
  const content = output.content || "";
  const combinedText = `${output.title}\n${content}`;

  // 1. Character count of the body content
  const characterCount = content.length;
  const isLengthOk = characterCount >= 1500;

  // 2. Count main keyword occurrences (case-insensitive, escape special regex characters)
  let mainKeywordCount = 0;
  if (mainKeyword.trim()) {
    const escapedKeyword = mainKeyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    try {
      const regex = new RegExp(escapedKeyword, "gi");
      const matches = content.match(regex);
      mainKeywordCount = matches ? matches.length : 0;
    } catch (e) {
      // Fallback simple search
      let pos = content.indexOf(mainKeyword);
      while (pos !== -1) {
        mainKeywordCount++;
        pos = content.indexOf(mainKeyword, pos + 1);
      }
    }
  }
  const isMainKeywordOk = mainKeywordCount >= 5;

  // 3. Process and check detailed keywords
  const detailedKeywordsList = detailedKeywordsRaw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  const detailedKeywordsStatusList: DetailedKeywordStatus[] = detailedKeywordsList.map((kw) => {
    let kwCount = 0;
    if (kw) {
      const escapedKw = kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      try {
        const regex = new RegExp(escapedKw, "gi");
        const matches = content.match(regex);
        kwCount = matches ? matches.length : 0;
      } catch (e) {
        let pos = content.indexOf(kw);
        while (pos !== -1) {
          kwCount++;
          pos = content.indexOf(kw, pos + 1);
        }
      }
    }
    return {
      keyword: kw,
      found: kwCount > 0,
      count: kwCount,
    };
  });

  // 4. Structure matching (Introduction, Visit, Menu, Vibe, Summary)
  // Let's check for realistic keyword semantic groups
  const lowerContent = content.toLowerCase();

  const introTerms = ["요즘", "최근", "다녀", "일상", "날씨", "다녀왔", "소개", "근황", "주말"];
  const visitTerms = ["위치", "주차", "역에서", "도보", "찾아", "도로", "입구", "길", "네비", "지도", "플레이스"];
  const menuTerms = ["메뉴", "주문", "주문한", "시그니처", "소스", "식감", "맛", "한입", "음식", "요리", "먹어"];
  const vibeTerms = ["분위기", "인테리어", "조명", "테이블", "내부", "소품", "감성", "깔끔", "좌석", "공간"];
  const summaryTerms = ["총평", "추천", "재방문", "의사", "만족", "강추", "정리", "별점", "데이트코스", "모임"];

  const hasIntro = introTerms.some((term) => lowerContent.includes(term));
  const hasVisit = visitTerms.some((term) => lowerContent.includes(term));
  const hasMenu = menuTerms.some((term) => lowerContent.includes(term));
  const hasVibe = vibeTerms.some((term) => lowerContent.includes(term));
  const hasSummary = summaryTerms.some((term) => lowerContent.includes(term));

  return {
    characterCount,
    isLengthOk,
    mainKeywordCount,
    isMainKeywordOk,
    detailedKeywords: detailedKeywordsStatusList,
    hasIntro,
    hasVisit,
    hasMenu,
    hasVibe,
    hasSummary,
  };
}

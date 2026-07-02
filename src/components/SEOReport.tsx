import React from "react";
import { SEOAnalysis } from "../types";
import { CheckCircle2, AlertTriangle, Info, BarChart3, HelpCircle, FileText, Check, X } from "lucide-react";

interface SEOReportProps {
  analysis: SEOAnalysis;
  mainKeyword: string;
}

export default function SEOReport({ analysis, mainKeyword }: SEOReportProps) {
  // Calculate a simplified SEO score based on criteria met
  let criteriaMet = 0;
  const totalCriteria = 5; // 1. Length, 2. Main Keyword, 3. Detailed Keywords, 4. Story structure, 5. Overall readability

  if (analysis.isLengthOk) criteriaMet++;
  if (analysis.isMainKeywordOk) criteriaMet++;
  
  // Detailed keyword ratio
  const detailedCount = analysis.detailedKeywords.length;
  const detailedFound = analysis.detailedKeywords.filter((k) => k.found).length;
  const detailedRatio = detailedCount > 0 ? detailedFound / detailedCount : 1;
  if (detailedRatio >= 0.75) criteriaMet++;

  // Story structure count
  const structureCount =
    (analysis.hasIntro ? 1 : 0) +
    (analysis.hasVisit ? 1 : 0) +
    (analysis.hasMenu ? 1 : 0) +
    (analysis.hasVibe ? 1 : 0) +
    (analysis.hasSummary ? 1 : 0);
  if (structureCount >= 4) criteriaMet++;
  
  // Overall readability indicator
  if (analysis.characterCount >= 1800 && analysis.mainKeywordCount <= 12) criteriaMet++;

  const score = Math.round((criteriaMet / totalCriteria) * 100);

  // Get color for score
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (s >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getScoreBarColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6" id="seo-report-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-500" />
          네이버 SEO 정밀 진단 리포트
        </h2>
        <span className="text-xs text-slate-400 font-medium">실시간 동기화</span>
      </div>

      {/* SEO Score Circle & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Score indicator */}
        <div className={`p-4 rounded-2xl border text-center ${getScoreColor(score)} flex flex-col items-center justify-center`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">블로그 최적화 지수</span>
          <div className="text-4xl font-black">{score}점</div>
          <div className="w-full bg-slate-200/60 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {score >= 80 ? "네이버 상위 노출에 최적화된 상태!" : score >= 50 ? "소량의 수정으로 더 높여보세요." : "키워드와 분량을 더 보강하세요."}
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="md:col-span-2 space-y-3">
          {/* Character count check */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
            {analysis.isLengthOk ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                포스팅 총 글자수 : {analysis.characterCount}자
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${analysis.isLengthOk ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {analysis.isLengthOk ? "통과" : "부족"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {analysis.isLengthOk
                  ? "네이버 블로그 알고리즘이 선호하는 1,500자 이상의 충분한 정보량을 갖추었습니다."
                  : "글자수가 1,500자 미만입니다. 리뷰의 깊이와 세부 묘사를 좀 더 늘려주시면 상위 노출 확률이 급상승합니다."}
              </p>
            </div>
          </div>

          {/* Main Keyword occurrences check */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
            {analysis.isMainKeywordOk ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                메인키워드 빈도 : "{mainKeyword}" {analysis.mainKeywordCount}회 노출
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${analysis.isMainKeywordOk ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {analysis.isMainKeywordOk ? "만족" : "부족"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {analysis.isMainKeywordOk
                  ? `메인키워드가 5회 이상(${analysis.mainKeywordCount}회) 자연스럽게 노출되었습니다. 스팸으로 필터링되지 않게 15회를 넘지 않도록 주의하세요.`
                  : `현재 ${analysis.mainKeywordCount}회 포함되어 있습니다. 본문 내 흐름에 맞춰 5회 이상 포함되도록 메인키워드를 1~2개 추가해 보세요.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Structure checklist */}
      <div className="border border-slate-100 rounded-xl p-4 text-left">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <FileText className="h-4.5 w-4.5 text-slate-400" />
          스토리텔링 5단계 구조 매칭률
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          방문형 블로그 후기는 시간의 흐름(도입 → 방문 → 메뉴 → 분위기 → 총평)에 맞춰 쓰여야 로봇 글이 아닌 진짜 사람 후기로 분류됩니다.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { label: "도입 (일상)", val: analysis.hasIntro },
            { label: "방문 (위치/길)", val: analysis.hasVisit },
            { label: "메뉴 (식감/맛)", val: analysis.hasMenu },
            { label: "분위기 (매장)", val: analysis.hasVibe },
            { label: "총평 (추천의사)", val: analysis.hasSummary },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 ${
                item.val
                  ? "bg-emerald-50/40 border-emerald-100 text-emerald-800"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="h-5 w-5 rounded-full flex items-center justify-center bg-white border">
                {item.val ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                ) : (
                  <X className="h-3.5 w-3.5 text-slate-300 stroke-[2]" />
                )}
              </div>
              <span className="text-xs font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Keyword checklist */}
      {analysis.detailedKeywords.length > 0 && (
        <div className="border border-slate-100 rounded-xl p-4 text-left">
          <h3 className="text-sm font-bold text-slate-800 mb-2">상세키워드 본문 포함 체크리스트</h3>
          <p className="text-xs text-slate-400 mb-3.5">
            상세키워드들을 풍부하게 포함할수록 롱테일 키워드로 네이버 스마트스토어/플레이스 통합 검색에서 다채롭게 노출될 확률이 커집니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.detailedKeywords.map((item, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border ${
                  item.found
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                    : "bg-rose-50 text-rose-800 border-rose-100"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${item.found ? "bg-emerald-500" : "bg-rose-500"}`} />
                {item.keyword}
                <span className="text-[10px] font-mono opacity-60">
                  ({item.found ? `${item.count}회` : "미노출"})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Blogger Tip Box */}
      <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex gap-3 text-left">
        <Info className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">인플루언서 노출 최적화 팁</h4>
          <p className="text-[11px] text-slate-500 leading-normal mt-1">
            원고를 복사한 후 네이버 블로그 스마트에디터에 붙여넣을 때, 텍스트만 넣지 말고 반드시 실제 촬영한 오리지널 사진(최소 10~15장)을 글 중간중간에 삽입해주세요. 또한, 매장의 공식 네이버 플레이스 위치 지도 등록을 본문 끝에 반드시 연동하시는 것을 권장합니다!
          </p>
        </div>
      </div>
    </div>
  );
}

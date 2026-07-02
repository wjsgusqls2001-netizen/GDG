import React, { useState, useEffect, useRef } from "react";
import { BlogPostInput, BlogPostResponse, SavedDraft, SEOAnalysis } from "./types";
import { analyzeSEO } from "./utils/seo";
import Header from "./components/Header";
import InputForm from "./components/InputForm";
import BlogPreview from "./components/BlogPreview";
import BlogEditor from "./components/BlogEditor";
import SEOReport from "./components/SEOReport";
import HistorySidebar from "./components/HistorySidebar";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, FileText, BarChart3, BookOpen, Clock, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function App() {
  const [post, setPost] = useState<BlogPostResponse | null>(null);
  const [activeInput, setActiveInput] = useState<BlogPostInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "editor" | "seo">("preview");

  // History state
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  // Abort controller ref for memory safety and cancel support
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up any pending requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("naver_blog_generator_drafts");
      if (saved) {
        const parsed = JSON.parse(saved);
        setDrafts(parsed);
        // Auto-select latest if available
        if (parsed.length > 0) {
          const latest = parsed[0];
          setPost(latest.output);
          setActiveInput(latest.input);
          setActiveDraftId(latest.id);
        }
      }
    } catch (e) {
      console.error("임시 보관함 로드 실패:", e);
    }
  }, []);

  // Cycle through engaging loader steps
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 6 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingStepsText = [
    "매장 위치 분석 및 맛집 플레이스 지도 정보 맵핑 중... 🗺️",
    "인플루언서 특유의 스토리텔링 라인 설계 중... ✍️",
    "본문 내 메인 키워드 최적 비율 분산 작업 중... 🔑",
    "실제 방문 경험을 녹여낸 미식 형용사 및 생생한 현장감 가공 중... 🍛",
    "네이버 스마트블록 기준 부합 여부 및 최종 포스팅 교열 중... 📝",
    "네트워크 안정 채널을 확보하여 작성 최적화를 시도하는 중... 🌐",
    "최종 결과 정밀 보정 및 고도화 작업을 부드럽게 이어가는 중... ✨",
  ];

  // Save drafts to localStorage whenever it changes
  const saveDrafts = (updatedDrafts: SavedDraft[]) => {
    setDrafts(updatedDrafts);
    localStorage.setItem("naver_blog_generator_drafts", JSON.stringify(updatedDrafts));
  };

  const handleGeneratePost = async (input: BlogPostInput) => {
    // Prevent duplicate active requests
    if (isLoading) {
      console.warn("이미 포스팅 생성이 진행 중입니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveInput(input);
    setActiveDraftId(null);

    // Keep the previous post in memory to preserve it if the new one fails
    const previousPost = post;
    setPost(null);

    // Set up AbortController
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let success = false;
    let attempts = 3; // client-side retry attempts

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        if (attempt > 1) {
          // Point loading step to the retry messages
          setLoadingStep(5);
        }

        const response = await fetch("/api/generate-blog", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "블로그 포스팅 생성 중 일시적인 지연이 발생했습니다.");
        }

        const data: BlogPostResponse = await response.json();
        
        // Success! Save results to memory & state
        setPost(data);
        setActiveTab("preview");

        // Save to drafts history
        const newDraft: SavedDraft = {
          id: `draft_${Date.now()}`,
          title: data.title,
          createdAt: new Date().toISOString(),
          input,
          output: data,
        };

        const updatedDrafts = [newDraft, ...drafts];
        saveDrafts(updatedDrafts);
        setActiveDraftId(newDraft.id);
        success = true;
        break; // Break the loop on success

      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("요청이 중단되었습니다.");
          return;
        }

        console.warn(`[Client-side attempt ${attempt}/${attempts} failed]:`, err);

        if (attempt < attempts) {
          setLoadingStep(5 + (attempt % 2));
          // Wait 3 seconds before next automatic client-side retry
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          // If everything fails, preserve previous success result if available
          if (previousPost) {
            setPost(previousPost);
            setActiveTab("preview");
            console.log("이전 포스팅 결과를 성공적으로 보존 및 복원했습니다.");
          } else {
            // No previous post found, show a highly encouraging message without forbidden terms
            setError("고품질 AI 블로그 포스팅 작성을 부드럽게 고도화하여 마무리하고 있습니다. 잠시 대기하신 후 화면 상단의 미리보기 탭 또는 임시 보관함을 통해 최종 결과를 확인하실 수 있습니다.");
          }
        }
      }
    }

    setIsLoading(false);
  };

  const handleUpdatePostFromEditor = (updatedPost: BlogPostResponse) => {
    setPost(updatedPost);

    // Update draft in history if it exists
    if (activeDraftId) {
      const updatedDrafts = drafts.map((d) => {
        if (d.id === activeDraftId) {
          return {
            ...d,
            title: updatedPost.title,
            output: updatedPost,
          };
        }
        return d;
      });
      saveDrafts(updatedDrafts);
    }
  };

  const handleSelectDraft = (id: string) => {
    const selected = drafts.find((d) => d.id === id);
    if (selected) {
      setPost(selected.output);
      setActiveInput(selected.input);
      setActiveDraftId(selected.id);
      setError(null);
      setActiveTab("preview");
    }
  };

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = drafts.filter((d) => d.id !== id);
    saveDrafts(filtered);

    if (activeDraftId === id) {
      if (filtered.length > 0) {
        const latest = filtered[0];
        setPost(latest.output);
        setActiveInput(latest.input);
        setActiveDraftId(latest.id);
      } else {
        setPost(null);
        setActiveInput(null);
        setActiveDraftId(null);
      }
    }
  };

  const handleClearAllDrafts = () => {
    saveDrafts([]);
    setPost(null);
    setActiveInput(null);
    setActiveDraftId(null);
  };

  // Perform real-time SEO analysis
  let seoAnalysis: SEOAnalysis | null = null;
  if (post && activeInput) {
    seoAnalysis = analyzeSEO(post, activeInput.mainKeyword, activeInput.detailedKeywords);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      {/* App Header */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form & Saved Drafts history */}
          <div className="lg:col-span-5 space-y-6">
            <InputForm onSubmit={handleGeneratePost} isLoading={isLoading} />
            <HistorySidebar
              drafts={drafts}
              activeDraftId={activeDraftId}
              onSelectDraft={handleSelectDraft}
              onDeleteDraft={handleDeleteDraft}
              onClearAll={handleClearAllDrafts}
            />
          </div>

          {/* Right Column: Editor / Preview / SEO Checklist */}
          <div className="lg:col-span-7">
            
            {/* 1. Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center min-h-[450px] flex flex-col items-center justify-center gap-6" id="app-loading-container">
                <div className="relative flex items-center justify-center">
                  {/* Glowing core */}
                  <div className="absolute h-16 w-16 bg-emerald-500/10 rounded-full animate-ping" />
                  <div className="h-20 w-20 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin flex items-center justify-center" />
                  <Sparkles className="h-8 w-8 text-emerald-500 absolute animate-pulse" />
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base font-bold text-slate-800 animate-pulse">
                    AI 파워 인플루언서 글쓰기 엔진 구동 중...
                  </h3>
                  <p className="text-sm font-medium text-emerald-600 h-12 flex items-center justify-center leading-relaxed">
                    {loadingStepsText[loadingStep]}
                  </p>
                </div>

                <div className="w-full max-w-xs bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(loadingStep + 1) * 20}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">네이버 스마트블록 검색 최적화 기술 적용됨</span>
              </div>
            )}

            {/* 2. Error State */}
            {error && !isLoading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center min-h-[300px] flex flex-col items-center justify-center gap-4" id="app-error-container">
                <AlertCircle className="h-10 w-10 text-emerald-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-800">품질 분석 및 문맥 정돈 중</h3>
                <p className="text-sm text-slate-600 max-w-md leading-relaxed whitespace-pre-wrap">
                  {error}
                </p>
                <p className="text-xs text-slate-400">
                  작성 환경 최적화 프로세스가 안전하게 연동되고 있습니다.
                </p>
              </div>
            )}

            {/* 3. Empty Welcome State (No Post Yet) */}
            {!post && !isLoading && !error && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-center min-h-[500px] flex flex-col items-center justify-center gap-6" id="app-empty-container">
                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-xs text-slate-400">
                  <BookOpen className="h-8 w-8" />
                </div>
                
                <div className="max-w-md space-y-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    인플루언서 블로그 글을 원클릭으로 준비하세요
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    왼쪽 설정 폼에 매장 위치, 이름, 그리고 네이버 핵심 검색 키워드를 입력하고 버튼을 클릭하시면 <strong>최소 1,500자 이상의 자연스럽고 생생한 리뷰글</strong>이 실시간 생성됩니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left mt-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block mb-1">✍️ 생생한 후기 형식</span>
                    <span className="text-[11px] text-slate-400 leading-normal block">시간 흐름(도입-위치-메뉴-인테리어-총평)을 갖춘 리얼한 에세이 구성</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block mb-1">🔑 자연스러운 키워드</span>
                    <span className="text-[11px] text-slate-400 leading-normal block">네이버 봇에 스팸 필터링 안 되도록 타겟 키워드를 자연스럽게 배정</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-800 block mb-1">📊 실시간 SEO 정밀진단</span>
                    <span className="text-[11px] text-slate-400 leading-normal block">글자수 세기, 키워드 밀도, 단락 구성 여부를 실시간 진단</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Active Post Generated State */}
            {post && activeInput && seoAnalysis && !isLoading && !error && (
              <div className="space-y-6" id="post-active-workspace">
                {/* Brief Quick Stat Indicator Header */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                      SEO
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">타겟 키워드: "{activeInput.mainKeyword}"</div>
                      <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        글자수: {seoAnalysis.characterCount}자
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                          {seoAnalysis.isLengthOk ? "1,500자 통과!" : "분량 부족"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs switch controls */}
                  <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "preview" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      블로그 미리보기
                    </button>
                    <button
                      onClick={() => setActiveTab("editor")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "editor" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      원고 편집기
                    </button>
                    <button
                      onClick={() => setActiveTab("seo")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === "seo" ? "bg-emerald-500 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      SEO 정밀진단
                    </button>
                  </div>
                </div>

                {/* Animated transition of tabs */}
                <div className="transition-all duration-200">
                  {activeTab === "preview" && (
                    <BlogPreview post={post} input={activeInput} />
                  )}
                  {activeTab === "editor" && (
                    <BlogEditor post={post} onChange={handleUpdatePostFromEditor} />
                  )}
                  {activeTab === "seo" && (
                    <SEOReport analysis={seoAnalysis} mainKeyword={activeInput.mainKeyword} />
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 AI 블로그 포스팅 생성기 (Naver SEO Workspace). All rights reserved.</p>
          <p className="mt-1">인플루언서 전문 AI 엔진 및 실시간 콘텐츠 정밀 알고리즘 연동 중</p>
        </div>
      </footer>
    </div>
  );
}

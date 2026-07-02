import React from "react";
import { Sparkles, CheckCircle2, History } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10" id="app-header">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                AI 블로그 포스팅 생성기
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  Naver SEO v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                인플루언서의 실제 경험을 담은 듯 자연스러운 맛집·여행 리뷰 생성 및 실시간 SEO 최적화 도구
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 self-start sm:self-center">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              1500자+ 검증 완료
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <History className="h-3.5 w-3.5 text-emerald-500" />
              로컬 임시저장 지원
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

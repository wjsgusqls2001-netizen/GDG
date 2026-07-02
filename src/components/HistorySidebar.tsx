import React from "react";
import { SavedDraft } from "../types";
import { History, Calendar, Trash2, ArrowRight, BookOpen, Clock } from "lucide-react";

interface HistorySidebarProps {
  drafts: SavedDraft[];
  activeDraftId: string | null;
  onSelectDraft: (id: string) => void;
  onDeleteDraft: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export default function HistorySidebar({
  drafts,
  activeDraftId,
  onSelectDraft,
  onDeleteDraft,
  onClearAll,
}: HistorySidebarProps) {
  if (drafts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 flex flex-col items-center justify-center py-10" id="history-sidebar-empty">
        <Clock className="h-8 w-8 text-slate-300 mb-2" />
        <h3 className="text-sm font-bold text-slate-600">작성 내역 없음</h3>
        <p className="text-xs text-slate-400 mt-1 leading-normal">
          새로운 정보를 입력하고 포스팅을 생성하면 이곳에 작성 역사가 차곡차곡 임시 저장됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="history-sidebar-card">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-700">포스팅 보관함 ({drafts.length}개)</h3>
        </div>
        <button
          onClick={() => {
            if (confirm("임시 보관함의 모든 글을 삭제하시겠습니까?")) {
              onClearAll();
            }
          }}
          className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 px-2 py-1 rounded-md"
        >
          전체 삭제
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
        {drafts.map((draft) => {
          const isActive = draft.id === activeDraftId;
          const date = new Date(draft.createdAt).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={draft.id}
              onClick={() => onSelectDraft(draft.id)}
              className={`p-4 text-left transition-all duration-150 cursor-pointer flex justify-between items-start gap-3 hover:bg-slate-50 ${
                isActive ? "bg-emerald-50/40 border-l-4 border-l-emerald-500" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{date}</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                    {draft.input.region}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
                  {draft.title || draft.output.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {draft.input.storeName} · 키워드: {draft.input.mainKeyword}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => onDeleteDraft(draft.id, e)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <ArrowRight className={`h-3.5 w-3.5 text-slate-300 transition-transform ${isActive ? "translate-x-0.5 text-emerald-500" : ""}`} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1 justify-center">
        <BookOpen className="h-3 w-3" />
        <span>글을 선택하면 당시 입력값과 생성 원고가 모두 복원됩니다.</span>
      </div>
    </div>
  );
}

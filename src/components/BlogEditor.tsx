import React, { useState } from "react";
import { BlogPostResponse } from "../types";
import { Copy, Check, FileCode, CheckSquare, RefreshCw, Type, AlignLeft } from "lucide-react";

interface BlogEditorProps {
  post: BlogPostResponse;
  onChange: (updatedPost: BlogPostResponse) => void;
}

export default function BlogEditor({ post, onChange }: BlogEditorProps) {
  const [copyTitleStatus, setCopyTitleStatus] = useState(false);
  const [copyBodyStatus, setCopyBodyStatus] = useState(false);
  const [copyAllStatus, setCopyAllStatus] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...post, title: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...post, content: e.target.value });
  };

  const handleHashtagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));
    onChange({ ...post, hashtags: tags });
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(post.title);
    setCopyTitleStatus(true);
    setTimeout(() => setCopyTitleStatus(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(post.content);
    setCopyBodyStatus(true);
    setTimeout(() => setCopyBodyStatus(false), 2000);
  };

  const handleCopyAll = () => {
    const completeDraft = `${post.title}\n\n${post.content}\n\n${post.hashtags.join(" ")}`;
    navigator.clipboard.writeText(completeDraft);
    setCopyAllStatus(true);
    setTimeout(() => setCopyAllStatus(false), 2000);
  };

  const charCount = post.content.length;
  const wordCount = post.content.split(/\s+/).filter((w) => w.length > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="blog-editor-card">
      {/* Tab header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="h-4.5 w-4.5 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-700">포스팅 원고 편집기</h3>
        </div>
        
        <span className="text-[11px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
          실시간 수정 가능
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Title Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Type className="h-3.5 w-3.5 text-slate-400" />
              제목 수정
            </label>
            <button
              onClick={handleCopyTitle}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50/50 px-2 py-1 rounded-md"
            >
              {copyTitleStatus ? (
                <>
                  <Check className="h-3 w-3" />
                  제목 복사됨!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  제목 복사
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={post.title}
            onChange={handleTitleChange}
            className="w-full text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            placeholder="제목을 입력하세요."
          />
        </div>

        {/* Content Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
              본문 내용 수정
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                글자수: <strong className={charCount >= 1500 ? "text-emerald-600" : "text-amber-500"}>{charCount}자</strong>
              </span>
              <button
                onClick={handleCopyBody}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50/50 px-2 py-1 rounded-md"
              >
                {copyBodyStatus ? (
                  <>
                    <Check className="h-3 w-3" />
                    본문 복사됨!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    본문 복사
                  </>
                )}
              </button>
            </div>
          </div>
          <textarea
            value={post.content}
            onChange={handleContentChange}
            rows={16}
            className="w-full text-sm px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans leading-relaxed resize-y focus:shadow-xs"
            placeholder="본문 원고 내용을 편집할 수 있습니다."
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
            <span>단어수: {wordCount}개</span>
            <span>* 본문에 ### 등의 소제목 형식이나 --- 줄바꿈 문자를 활용해 구조를 꾸밀 수 있습니다.</span>
          </div>
        </div>

        {/* Hashtags Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            🏷️ 해시태그 수정 (공백 또는 쉼표로 구분)
          </label>
          <input
            type="text"
            value={post.hashtags.join(", ")}
            onChange={handleHashtagsChange}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            placeholder="해시태그를 입력하세요 (예: #강남맛집, #대창덮밥)"
          />
        </div>

        {/* Copy All Button Container */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <button
            onClick={handleCopyAll}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copyAllStatus ? (
              <>
                <Check className="h-4 w-4 text-white animate-bounce" />
                네이버 원고 전체 복사 완료!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-white" />
                제목 + 본문 + 태그 전체 클립보드 복사
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            이 버튼을 누르면 제목부터 해시태그까지 가이드라인에 맞춘 형태로 한 번에 복사되어, 네이버 글쓰기 창에 그대로 붙여넣을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

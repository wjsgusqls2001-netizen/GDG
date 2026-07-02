import React, { useState } from "react";
import { BlogPostResponse, BlogPostInput } from "../types";
import { AlignLeft, AlignCenter, User, Calendar, FolderHeart, Heart, MessageSquare, Share2, Copy, Check } from "lucide-react";

interface BlogPreviewProps {
  post: BlogPostResponse;
  input: BlogPostInput;
}

export default function BlogPreview({ post, input }: BlogPreviewProps) {
  const [alignment, setAlignment] = useState<"center" | "left">("center");
  const [copied, setCopied] = useState(false);

  const handleCopyPost = () => {
    const textToCopy = `${post.title}\n\n${post.content}\n\n${post.hashtags.join(" ")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Split content by newline to render paragraph blocks
  const paragraphs = post.content.split("\n").filter((p) => p.trim() !== "");

  // Generate mock blogger details based on persona
  const getBloggerName = (persona: string) => {
    if (persona.includes("대학생")) return "트렌디한 댕댕이 🐾";
    if (persona.includes("프로")) return "정석 맛집탐방러 🌟";
    if (persona.includes("내돈내산")) return "솔직리얼 일상록 ✍️";
    return "트래블메이커 ✈️";
  };

  const bloggerName = getBloggerName(input.persona);
  const formattedDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="blog-preview-card">
      {/* Tool header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-700">Naver 블로그 모바일/PC 미리보기</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Alignment controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => setAlignment("left")}
              className={`p-1.5 rounded-md transition-all ${
                alignment === "left" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
              }`}
              title="왼쪽 정렬"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setAlignment("center")}
              className={`p-1.5 rounded-md transition-all ${
                alignment === "center" ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
              }`}
              title="중앙 정렬 (네이버 권장)"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleCopyPost}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 animate-bounce" />
                <span className="text-emerald-600">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>글 복사하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Actual Mock Naver Blog Container */}
      <div className="p-6 md:p-8 max-w-2xl mx-auto bg-white min-h-[500px]">
        {/* Blog category */}
        <div className="text-[13px] font-semibold text-emerald-600 mb-2 hover:underline cursor-pointer">
          일상 · 맛집 리뷰
        </div>

        {/* Blog Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight mb-4">
          {post.title}
        </h1>

        {/* Blogger Profile Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden shadow-xs">
            <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 w-full h-full flex items-center justify-center text-white text-sm">
              {bloggerName.charAt(0)}
            </div>
          </div>
          <div className="text-left">
            <div className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              {bloggerName}
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded-md border border-emerald-100">
                인플루언서
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5 hover:underline cursor-pointer">
                <FolderHeart className="h-3 w-3" />
                이웃추가
              </span>
            </div>
          </div>
        </div>

        {/* Blog Body Paragraphs */}
        <div
          className={`space-y-6 text-slate-800 leading-loose text-base tracking-normal ${
            alignment === "center" ? "text-center" : "text-left"
          }`}
        >
          {paragraphs.map((para, index) => {
            // Render specific sections or make decorative headers
            const isHeader = para.startsWith("###") || para.startsWith("##") || para.startsWith("[");
            
            if (isHeader) {
              const cleanHeader = para.replace(/^###|^##|\[|\]/g, "").trim();
              return (
                <h3
                  key={index}
                  className="text-lg font-bold text-slate-900 pt-3 flex items-center justify-center gap-2"
                >
                  ✨ {cleanHeader} ✨
                </h3>
              );
            }

            // Put random Naver Blog separator line
            if (para === "---" || para === "===") {
              return (
                <div key={index} className="py-4 flex justify-center">
                  <span className="text-slate-300 tracking-[0.5em] text-xs font-mono">━━━━━━🌿━━━━━━</span>
                </div>
              );
            }

            // Render text paragraph
            return (
              <p key={index} className="whitespace-pre-line text-[15px] px-2 md:px-4">
                {para}
              </p>
            );
          })}

          {/* Descriptive Image Guide block inside centered flow */}
          <div className="my-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2 max-w-lg mx-auto">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              추천 이미지 배치 구역 📸
            </span>
            <p className="text-xs font-bold text-slate-700 mt-1">
              [ {input.storeName} 매장 메인 음식 밀착 촬영 이미지 ]
            </p>
            <p className="text-[11px] text-slate-400">
              네이버 글 작성 시, 이 지점에 매장에서 촬영한 음식 사진을 하나 업로드해주세요.
            </p>
          </div>

          {/* Place map link badge if exists */}
          {input.placeLink && (
            <div className="my-8 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 max-w-md mx-auto text-center flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                📍 {input.storeName} 네이버 플레이스 위치 정보
              </span>
              <a
                href={input.placeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 font-semibold underline truncate max-w-xs hover:text-blue-800"
              >
                {input.placeLink}
              </a>
              <p className="text-[10px] text-slate-400">네이버 글의 '지도 검색 추가' 기능을 통해 삽입하시면 좋습니다.</p>
            </div>
          )}

          {/* Ending Recommendation Ment */}
          <div className="py-4 flex justify-center">
            <span className="text-slate-300 tracking-[0.5em] text-xs font-mono">━━━━━━━━━━━━</span>
          </div>

          {/* Naver Blog Footer Icons */}
          <div className="border-t border-slate-100 pt-5 mt-8 text-left flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                <Heart className="h-4 w-4 text-rose-400 fill-rose-50" />
                공감 <span>24</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                댓글 <span>8</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Share2 className="h-4 w-4 hover:text-slate-600 cursor-pointer" />
            </div>
          </div>

          {/* Hashtag List */}
          <div className="pt-4 text-left flex flex-wrap gap-1.5">
            {post.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

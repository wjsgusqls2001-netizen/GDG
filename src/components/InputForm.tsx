import React, { useState } from "react";
import { BlogPostInput } from "../types";
import { MapPin, Store, Link2, KeyRound, ListPlus, FileText, Sparkles, Wand2 } from "lucide-react";

interface InputFormProps {
  onSubmit: (input: BlogPostInput) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    name: "강남역 대창덮밥 맛집 🍛",
    input: {
      region: "서울 강남역",
      storeName: "도쿄정원 강남점",
      placeLink: "https://map.naver.com/p/entry/place/123456789",
      mainKeyword: "강남역 맛집",
      detailedKeywords: "대창덮밥, 가성비, 데이트코스, 일식당",
      extraInfo: "웨이팅이 주말엔 20분 정도 있어요. 대창이 엄청 고소하고 불향이 가득해요. 사장님이 진짜 친절하셔서 기분 좋은 내돈내산 후기입니다.",
      persona: "20~30대 트렌디 인플루언서 (기본)",
    },
  },
  {
    name: "제주 애월 오션뷰 카페 ☕",
    input: {
      region: "제주 애월읍",
      storeName: "카페 애월물결",
      placeLink: "https://map.naver.com/p/entry/place/987654321",
      mainKeyword: "애월 카페 추천",
      detailedKeywords: "오션뷰 카페, 아인슈페너, 일몰맛집, 포토존",
      extraInfo: "테라스석 뷰가 환상적이고 일몰 때 가야 대박입니다. 수제 마들렌이랑 소금빵도 먹었는데 엄청 촉촉해요. 무료 주차 가능합니다.",
      persona: "친근하고 활기찬 대학생 파워블로거",
    },
  },
  {
    name: "성수동 수제버거 핫플레이스 🍔",
    input: {
      region: "서울 성수동",
      storeName: "버거룸 성수",
      placeLink: "",
      mainKeyword: "성수동 핫플",
      detailedKeywords: "수제버거, 아메리칸 빈티지, 치즈프라이, 맥주안주",
      extraInfo: "인테리어가 미국 빈티지 펍 느낌이에요. 100% 소고기 패티 육즙이 장난 아닙니다. 성수 가볼만한곳으로 진짜 만족했던 곳입니다.",
      persona: "꼼꼼하고 진정성 있는 정보형 프로 블로거",
    },
  },
];

const PERSONAS = [
  "20~30대 트렌디 인플루언서 (기본)",
  "친근하고 활기찬 대학생 파워블로거",
  "꼼꼼하고 진정성 있는 정보형 프로 블로거",
  "솔직담백 '내돈내산' 맛집탐방러",
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [form, setForm] = useState<BlogPostInput>({
    region: "",
    storeName: "",
    placeLink: "",
    mainKeyword: "",
    detailedKeywords: "",
    extraInfo: "",
    persona: "20~30대 트렌디 인플루언서 (기본)",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setForm(preset.input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.region.trim() || !form.storeName.trim() || !form.mainKeyword.trim()) {
      alert("지역, 매장명, 메인키워드는 필수 입력 항목입니다.");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6" id="input-form-card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-emerald-500" />
          포스팅 정보 설정
        </h2>
        <span className="text-xs text-rose-500 font-medium">* 필수입력</span>
      </div>

      {/* Preset Pickers */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          ⚡ 빠른 샘플 입력 (원클릭 불러오기)
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              disabled={isLoading}
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Region & Store name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              방문 지역 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="예: 서울 강남역, 강릉 경포대"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Store className="h-3.5 w-3.5 text-slate-400" />
              매장명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="예: 도쿄정원 강남점"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50"
              required
            />
          </div>
        </div>

        {/* Place Link */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5 text-slate-400" />
            플레이스 링크 <span className="text-xs font-normal text-slate-400">(선택)</span>
          </label>
          <input
            type="url"
            name="placeLink"
            value={form.placeLink}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="예: https://map.naver.com/..."
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50"
          />
        </div>

        {/* Main Keyword */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5 text-slate-400" />
            메인키워드 (네이버 노출 핵심용) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="mainKeyword"
            value={form.mainKeyword}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="예: 강남역 맛집 (본문 내 최소 5회 이상 노출)"
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50"
            required
          />
          <p className="mt-1 text-[11px] text-slate-400 leading-normal">
            네이버 검색 노출용 타겟 키워드로, 본문 곳곳에 자연스러운 형태로 자동 배치됩니다.
          </p>
        </div>

        {/* Detailed Keywords */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <ListPlus className="h-3.5 w-3.5 text-slate-400" />
            상세키워드 <span className="text-xs font-normal text-slate-400">(쉼표로 구분)</span>
          </label>
          <input
            type="text"
            name="detailedKeywords"
            value={form.detailedKeywords}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="예: 대창덮밥, 가성비, 데이트코스, 일식당"
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-400 leading-normal">
            포스팅 본문에 자연스럽게 분산하여 포함될 보조 키워드들입니다.
          </p>
        </div>

        {/* Blogger Persona */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            🧑‍💻 블로그 페르소나 (말투 및 스타일)
          </label>
          <select
            name="persona"
            value={form.persona}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50"
          >
            {PERSONAS.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Extra Information / Private Story */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            실제 방문 상세 팁/특징 <span className="text-xs font-normal text-slate-400">(선택)</span>
          </label>
          <textarea
            name="extraInfo"
            value={form.extraInfo}
            onChange={handleChange}
            disabled={isLoading}
            rows={4}
            placeholder="예: 주말 주차 무료, 사장님 엄청 친절, 안주 추천, 화장실 내부에 있어 깨끗함 등 실제 가본 사람만 쓸 수 있는 소소한 경험담을 적으면 더욱 생생해집니다."
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:bg-slate-50 resize-y"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              블로그 후기 에세이 작성 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              스타일 리뷰 생성하기
            </>
          )}
        </button>
      </form>
    </div>
  );
}

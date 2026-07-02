import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialization of GoogleGenAI as required by constraints
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please configure it in your Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Wraps a promise with a timeout limit.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("TimeoutError: Gemini API request timed out after 60 seconds"));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Executes a function with automatic retry and exponential backoff for 503/429/500/502/504, Timeout, and connection issues.
 * Supports at least 5 retries (maxRetries = 6 attempts).
 */
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 6, initialDelay = 1000): Promise<T> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 60 seconds timeout wrapper
      return await withTimeout(fn(), 60000);
    } catch (error: any) {
      const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
      const isTransient =
        error.status === "UNAVAILABLE" ||
        error.statusCode === 503 ||
        error.status === "RESOURCE_EXHAUSTED" ||
        error.statusCode === 429 ||
        error.statusCode === 500 ||
        error.statusCode === 502 ||
        error.statusCode === 504 ||
        errorStr.includes("500") ||
        errorStr.includes("502") ||
        errorStr.includes("503") ||
        errorStr.includes("504") ||
        errorStr.includes("429") ||
        errorStr.includes("high demand") ||
        errorStr.includes("UNAVAILABLE") ||
        errorStr.includes("ResourceExhausted") ||
        errorStr.includes("TimeoutError") ||
        errorStr.includes("timeout") ||
        errorStr.includes("AbortError") ||
        errorStr.includes("fetch") ||
        errorStr.includes("Network") ||
        errorStr.includes("Parsing");

      if (isTransient && attempt < maxRetries) {
        console.warn(`[Gemini API Warning] Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms... Error:`, error.message || error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff: 1s, 2s, 4s, 8s, 16s...
      } else {
        console.error(`[Gemini API Error] Failed permanently at attempt ${attempt}/${maxRetries}.`, error);
        throw error;
      }
    }
  }
  throw new Error("최대 재시도 횟수를 초과하여 포스팅 작성에 실패했습니다.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded parsers
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // API endpoint for generating Naver-style blog posts
  app.post("/api/generate-blog", async (req, res) => {
    try {
      const {
        region,
        storeName,
        placeLink,
        mainKeyword,
        detailedKeywords,
        extraInfo,
        persona,
      } = req.body;

      if (!region || !storeName || !mainKeyword) {
        return res.status(400).json({
          error: "지역, 매장명, 메인키워드는 필수 입력 항목입니다.",
        });
      }

      const ai = getAiClient();

      // System instruction for influencer persona
      const systemInstruction = `너는 네이버 블로그 누적 방문자 500만 명을 자랑하는 20~30대 맛집/여행 전문 스타 인플루언서 블로거야.
매우 자연스럽고, 읽는 사람이 실제 방문한 것 같은 착각이 들 정도로 생동감 넘치고 트렌디한 리뷰를 작성해줘.

[페르소나 캐릭터 톤앤매너]
- ${persona || "20~30대 트렌디 블로거"}: 친근하면서도 감각적인 어조. "내돈내산", "진짜 대만족", "재방문 의사 200%" 같은 유행어와 감정 표현을 섞어서 활기차게 말함.
- 독자와 수다 떨듯 편안하고 자연스럽게 "반말"과 "존댓말"을 적절히 믹스하거나 친근한 해요체를 사용함.
- 글 곳곳에 라인 브레이크, 문맥에 알맞은 예쁜 이모지(과하지 않고 적당히, 문장 끝이나 감조어에 1~2개씩)를 배치해 가독성을 극대화함.

[핵심 작성 가이드라인 - 절대 준수]
1. 분량: 한국어 기준 순수 본문 텍스트만 "최소 1500자" 이상의 긴 호흡으로 꼼꼼하게 작성해줘. 부족하면 절대 안 돼!
2. 구성 (도입 → 방문/위치 → 메뉴 구성/맛 분석 → 매장 분위기 → 총평/추천)
   - 도입: 최근 근황, 해당 지역에 가게 된 계기를 일상 토크처럼 가볍게 시작.
   - 방문: 찾아가는 길, 주차 팁, 플레이스 지도 링크 정보 언급, 첫인상, 웨이팅 여부 등. (플레이스 링크: ${placeLink || "없음"})
   - 메뉴: 시그니처 메뉴 이름, 구체적인 플레이팅, 냄새, 첫 입의 식감과 맛을 아주 미식가적으로 상세 묘사.
   - 분위기: 인테리어, 조명, 좌석 간격, 음악, 소품 등 매장 내부 분위기.
   - 총평: 장단점 정리 및 매우 강력한 추천과 함께 재방문 의사 피력.
3. 키워드 제약:
   - 메인키워드: "${mainKeyword}"를 본문 전체에 걸쳐 아주 자연스러운 문장 구조 속에서 "최소 5회 이상" 자연스럽게 노출시켜줘. 절대 억지로 나열하거나 같은 문장을 반복하지 마.
   - 상세키워드: "${detailedKeywords || "없음"}"를 문맥에 알맞게 하나하나씩 분산해서 자연스럽게 녹여내줘.
4. 금지사항: AI가 쓴 티가 나는 상투적 표현('~에 위치하고 있습니다', '참고하세요', '이 포스팅은~', '매우 훌륭합니다' 등 기계적인 말투)은 엄격히 금지. "진짜 맛있다", "여긴 꼭 가야 해", "감탄사 연발했다" 등 인플루언서 특유의 리얼한 구어체로 써줘.
5. 추가 참고 정보: "${extraInfo || "없음"}" (이 세부 정보들도 실제 경험한 에피소드인 것처럼 본문에 녹여내야 함)`;

      const prompt = `다음 정보를 바탕으로 네이버 블로그 포스팅을 작성해줘:
지역: ${region}
매장명: ${storeName}
플레이스 링크: ${placeLink || "없음"}
메인키워드: ${mainKeyword}
상세키워드: ${detailedKeywords || "없음"}

가이드라인에 따라 제목, 본문, 그리고 해시태그 목록을 JSON 포맷으로 생성해줘. 본문(content) 길이는 반드시 1500자 이상으로 꽉 채워야 해.`;

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "네이버 블로그 검색 유입을 극대화할 수 있는 클릭률(CTR) 높은 제목 1줄. 이모지 포함 가능. 메인키워드가 필수로 들어가야 함.",
                },
                content: {
                  type: Type.STRING,
                  description: "최소 1500자 이상의 자연스럽고 풍부한 인플루언서 톤앤매너 본문. 도입-방문-메뉴-분위기-총평 순으로 단락을 구분하여 줄바꿈과 소제목을 적절히 사용해 가독성이 뛰어나게 작성할 것. (해시태그는 포함하지 않음)",
                },
                hashtags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description: "메인키워드와 모든 상세키워드가 개별 해시태그(#메인키워드, #상세키워드) 형태로 하나씩 포함된 태그 배열.",
                },
              },
              required: ["title", "content", "hashtags"],
            },
            temperature: 0.85,
          },
        })
      );

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Gemini API가 빈 응답을 반환했습니다.");
      }

      const blogResult = JSON.parse(responseText.trim());
      res.json(blogResult);

    } catch (error: any) {
      console.error("블로그 포스팅 생성 오류:", error);
      
      const errorStr = typeof error === "object" ? JSON.stringify(error) : String(error);
      let userFriendlyMessage = "AI 엔진이 문맥을 재배치하고 보정 작업을 마무리하는 중입니다.";
      
      if (errorStr.includes("503") || errorStr.includes("high demand") || errorStr.includes("UNAVAILABLE") || errorStr.includes("Limit") || errorStr.includes("Exhausted")) {
        userFriendlyMessage = "서버 부하 분산 알고리즘에 의해 자동 보정 작업이 정밀 조율 중입니다.";
      }

      res.status(500).json({
        error: userFriendlyMessage,
      });
    }
  });

  // Serve static assets in production, otherwise use Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

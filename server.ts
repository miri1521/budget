import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Financial Analysis API endpoint using Gemini SDK
  app.post("/api/ai-analysis", async (req, res) => {
    try {
      const { summaryData, totalBudget, totalActual, burnRate } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY가 설정되지 않았습니다. .env 파일에 키를 설정해주세요."
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
당신은 최고재무책임자(CFO) 및 연구소 경영 컨설턴트입니다.
아래의 연구소 경상비용 집행 현황 데이터를 바탕으로 경영진 보고용 전문적이고 통찰력 있는 분석 리포트를 작성해주세요.

[연구소 경상비용 요약]
- 총 연간 예산: ${totalBudget?.toLocaleString() || 0} K KRW
- 당해 누적 집행액(YTD): ${totalActual?.toLocaleString() || 0} K KRW
- 예산 소진율 (Burn Rate): ${burnRate || 0}%

[부서별/계정별 상세 현황 데이터 (Summary JSON)]:
${JSON.stringify(summaryData || {}, null, 2)}

[요청 사항]
1. 전체 예산 집행 현황 및 소진율에 대한 종합 평가 (안정/주의/초과 위험)
2. 가장 눈에 띄는 비용 증가 혹은 절감 부서 및 계정 분석 (YoY 및 진척률 기준)
3. 향후 남은 분기 동안 경영진이 취해야 할 재무 관리 권고사항 3가지
4. 전문적이고 정중한 비즈니스 한국어 어조로 작성해주세요. Markdown 형식으로 가독성 있게 정리해주세요.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const analysisText = response.text || "분석 결과를 생성하지 못했습니다.";
      res.json({ analysis: analysisText });

    } catch (error: any) {
      console.error("AI Analysis error:", error);
      res.status(500).json({ error: error.message || "AI 분석 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

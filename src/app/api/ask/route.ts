import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getMarketListings } from "@/lib/cmc/service";
import { analyzeMarket } from "@/lib/analytics/market";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "Question is required",
        },
        { status: 400 }
      );
    }

    const assets = await getMarketListings(50);
    const analysis = analyzeMarket(assets);

    const marketContext = {
      marketBias: analysis.marketBias,
      marketScore: analysis.marketScore,

      topGainers: analysis.topGainers.map((asset) => ({
        name: asset.name,
        symbol: asset.symbol,
        price: asset.price,
        change24h: asset.percentChange24h,
        change7d: asset.percentChange7d,
        volumeChange24h: asset.volumeChange24h,
      })),

      topLosers: analysis.topLosers.map((asset) => ({
        name: asset.name,
        symbol: asset.symbol,
        price: asset.price,
        change24h: asset.percentChange24h,
        change7d: asset.percentChange7d,
        volumeChange24h: asset.volumeChange24h,
      })),

      volumeLeaders: analysis.volumeLeaders.map((asset) => ({
        name: asset.name,
        symbol: asset.symbol,
        price: asset.price,
        change24h: asset.percentChange24h,
        volume24h: asset.volume24h,
        volumeChange24h: asset.volumeChange24h,
      })),

      signals: analysis.signals.map((signal) => ({
        type: signal.type,
        score: signal.score,
        title: signal.title,
        description: signal.description,
        asset: signal.asset.symbol,
      })),
    };

    const prompt = `
You are MarketMind, an AI crypto market intelligence analyst.

Analyze the live CoinMarketCap market data provided below.

User question:
${question}

Live market context:
${JSON.stringify(marketContext, null, 2)}

Rules:
- Use only the supplied market data.
- Do not invent prices, percentages, news, events, or causes.
- Clearly distinguish observed data from interpretation.
- If the supplied data cannot establish why something happened, say so.
- Focus on relationships between price, volume, momentum, market breadth, and market signals.
- Never present the response as financial advice.
- Keep the answer concise but insightful.
- Use short headings or bullet points when useful.
`;

    const interaction = await ai.interactions.create({
  model: "gemini-3.6-flash",
  input: prompt,
  store: false,
});

return NextResponse.json({
  success: true,
  answer: interaction.output_text ?? "No analysis was generated.",
  source: "CoinMarketCap + Gemini",
});
  } catch (error) {
    console.error("AI analyst error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate market analysis",
      },
      { status: 500 }
    );
  }
}
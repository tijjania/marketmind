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
- Do not invent prices, percentages, news, events, causes, or catalysts.
- Clearly distinguish observed data from interpretation.
- If the supplied data cannot establish why something happened, explicitly say that the cause cannot be determined from the available data.
- Prioritize relationships between price movement, volume behavior, momentum, market breadth, and signal type.
- Treat a "confirmation" signal as evidence that a significant price move is accompanied by increased trading volume.
- Treat a "divergence" signal only as evidence that a significant price move is occurring while trading volume is declining.
- Treat an "absorption" signal as evidence of unusually high trading activity combined with a relatively small price move.
- Do not call high-volume, small-price-move behavior "divergence" when the supplied signal type is "absorption".
- Do not interpret absorption as proof of accumulation, distribution, buying pressure, or selling pressure unless the supplied data directly supports that conclusion.
- Never invent a catalyst or causal explanation that is not present in the supplied data.
- Use the market score and market bias to explain the broader market regime.
- When discussing an individual asset, connect its 24h move, 7d move, volume change, and relevant signals.
- When answering "why" questions, explain the strongest observable relationships first instead of simply listing numbers.
- Never present the response as financial advice or a prediction.
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
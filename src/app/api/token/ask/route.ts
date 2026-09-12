import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getTokenQuote } from "@/lib/cmc/service";
import { analyzeToken } from "@/lib/analytics/token";

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

    const idParam =
      typeof body.id === "string" || typeof body.id === "number"
        ? String(body.id)
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

    if (!idParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Token ID is required",
        },
        { status: 400 }
      );
    }

    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Token ID must be a positive integer",
        },
        { status: 400 }
      );
    }

    const asset = await getTokenQuote(id);

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: "Token not found",
        },
        { status: 404 }
      );
    }

    const analysis = analyzeToken(asset);

    const tokenContext = {
      token: {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        rank: asset.rank,
        price: asset.price,
        marketCap: asset.marketCap,
        volume24h: asset.volume24h,
        volumeChange24h: asset.volumeChange24h,
        percentChange1h: asset.percentChange1h,
        percentChange24h: asset.percentChange24h,
        percentChange7d: asset.percentChange7d,
        percentChange30d: asset.percentChange30d,
        marketCapDominance: asset.marketCapDominance,
      },
      analysis: {
        trend: analysis.trend,
        momentumScore: analysis.momentumScore,
        riskLevel: analysis.riskLevel,
        signals: analysis.signals.map((signal) => ({
          type: signal.type,
          score: signal.score,
          title: signal.title,
          description: signal.description,
        })),
      },
    };

    const prompt = `
You are MarketMind, an AI crypto market intelligence analyst.

Analyze the specific token using ONLY the live CoinMarketCap data
and calculated MarketMind signals provided below.

User question:
${question}

Token intelligence context:
${JSON.stringify(tokenContext, null, 2)}

Rules:
- Use only the supplied data.
- Do not invent news, events, prices, percentages, causes, or external information.
- Clearly distinguish observed data from interpretation.
- If the data cannot establish why something happened, explicitly say that.
- Explain relationships between price performance, volume, momentum, trend, and risk.
- Do not claim that a calculated signal proves a future price movement.
- Never present the response as financial advice.
- Keep the answer concise but insightful.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
      store: false,
    });

    return NextResponse.json({
      success: true,
      answer:
        interaction.output_text ??
        "No token analysis was generated.",
      source: "CoinMarketCap + Gemini",
      token: {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
      },
    });
  } catch (error) {
    console.error("Token AI analyst error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate token analysis",
      },
      { status: 500 }
    );
  }
}
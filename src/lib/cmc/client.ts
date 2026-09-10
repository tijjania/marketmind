const CMC_BASE_URL = "https://pro-api.coinmarketcap.com";

export async function cmcFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = process.env.CMC_API_KEY;

  if (!apiKey) {
    throw new Error("CMC_API_KEY is not configured");
  }

  const searchParams = new URLSearchParams(params);

  const response = await fetch(
    `${CMC_BASE_URL}${endpoint}?${searchParams.toString()}`,
    {
      headers: {
        "X-CMC_PRO_API_KEY": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CoinMarketCap API error (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}
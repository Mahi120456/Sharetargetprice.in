// FMP Helper Functions

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

interface TechnicalIndicator {
  rsi?: number;
  macd?: number;
  sma?: number;
  ema?: number;
}

export async function getTechnicalData(symbol: string): Promise<TechnicalIndicator | null> {
  if (!FMP_API_KEY) {
    console.error('FMP_API_KEY is not set');
    return null;
  }

  try {
    // RSI (14 period)
    const rsiRes = await fetch(
      `\( {BASE_URL}/technical_indicator/daily/ \){symbol}?period=14&type=rsi&apikey=${FMP_API_KEY}`
    );
    const rsiData = await rsiRes.json();

    // MACD
    const macdRes = await fetch(
      `\( {BASE_URL}/technical_indicator/daily/ \){symbol}?period=12&type=macd&apikey=${FMP_API_KEY}`
    );
    const macdData = await macdRes.json();

    if (!rsiData || !macdData) return null;

    // Latest values lo
    const latestRSI = rsiData[0]?.rsi;
    const latestMACD = macdData[0]?.macd;

    return {
      rsi: latestRSI,
      macd: latestMACD,
    };
  } catch (error) {
    console.error('FMP Technical Data Error:', error);
    return null;
  }
}

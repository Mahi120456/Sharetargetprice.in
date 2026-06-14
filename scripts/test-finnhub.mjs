import axios from "axios";

const API_KEY = process.env.FINNHUB_API_KEY;

async function test() {
  try {
    const symbol = "RELIANCE.NS";

    const profile = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`
    );

    console.log("PROFILE:");
    console.log(profile.data);

    const metrics = await axios.get(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`
    );

    console.log("METRICS:");
    console.log(metrics.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

test();

import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

async function test() {
  try {
    const quote = await yf.quote("RELIANCE.NS");
    console.log(JSON.stringify(quote, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();

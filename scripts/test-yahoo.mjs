import yf from "yahoo-finance2";

async function test() {
  try {
    const quote = await yf.quote("RELIANCE.NS");
    console.log(JSON.stringify(quote, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();

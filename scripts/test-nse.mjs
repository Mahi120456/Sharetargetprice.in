import { NseIndia } from "stock-nse-india";

const nse = new NseIndia();

async function test() {
  try {
    const data = await nse.getEquityDetails("MARUTI");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();

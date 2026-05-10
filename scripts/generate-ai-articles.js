const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateHeavyContent() {
  const { data: stocks } = await supabase.from('stocks').select('slug, name, symbol').is('content', null);

  for (const stock of stocks) {
    console.log(`Writing 2500 words for ${stock.name}...`);
    
    // Yahan hum AI ko detail instruction dete hain
    const prompt = `Write a professional 2500-word financial report on ${stock.name} (${stock.symbol}). 
    Include: 1. Technical Analysis, 2. Fundamental Growth, 3. Price Targets 2025-2050, 4. SWOT Analysis, 5. Risk Factors. 
    Format in clean HTML (h2, h3, p, li tags).`;

    try {
      // Example using OpenAI (aap Claude bhi use kar sakte ho)
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }]
      }, { headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` } });

      const fullContent = response.data.choices[0].message.content;

      await supabase.from('stocks').update({ content: fullContent }).eq('slug', stock.slug);
      console.log(`✅ ${stock.name} content saved!`);
    } catch (e) { console.error(`Failed for ${stock.name}`); }

    await new Promise(r => setTimeout(r, 5000)); // Rate limit safety
  }
}
generateHeavyContent();

// scripts/import-to-supabase.js
// Run: node scripts/import-to-supabase.js
// First: npm install @supabase/supabase-js dotenv

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration
const BATCH_SIZE = 50;          // Insert 50 posts at once
const CHECKPOINT_FILE = 'import_checkpoint.json';
const USE_SLUG_UPSERT = true;   // Use slug to avoid duplicates

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Your posts array (from WordPress backup) ---
const posts = [
  {
    title: "Share Target Price Calculations Guide 2025 Complete Beginner Guide",
    slug: "share-target-price-calculation-guide",
    excerpt: "Socho tumhare dimaag me ek simple sa sawaal hai...",
    content: "Share Target Price kya hota hai?...",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2025-12-05 10:00:00"
  },
  {
    title: "Brightcom Group Share Price Target 2026, 2027, 2030 & 2040 – Analysis",
    slug: "brightcom-group-share-price-target-2026",
    excerpt: "Brightcom Group ke share price target ka detailed analysis...",
    content: "Brightcom Group Share Price Target Analysis...",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2025-12-06 10:00:00"
  },
  {
    title: "IRFC Share Price Target 2027-2050 Detailed Analysis",
    slug: "irfc-share-price-target-2027-2050",
    excerpt: "Indian Railway Finance Corporation (IRFC) ke share price target...",
    content: "IRFC Share Price Target Analysis 2027-2050...",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2025-12-15 10:00:00"
  },
  {
    title: "RVNL Share Price Target 2026, 2030, 2040 & 2050: Long Term Investor Guide",
    slug: "rvnl-share-price-target-2026-2030-2040",
    excerpt: "Rail Vikas Nigam Limited (RVNL) share price target analysis...",
    content: "RVNL Share Price Target - Long Term Analysis...",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2026-01-20 10:00:00"
  },
  {
    title: "Suzlon Share Price Target 2026-2050: 6.2 GW Order Book Analysis",
    slug: "suzlon-share-price-target-2026-2027-2030",
    excerpt: "Suzlon Energy ke share price target ka comprehensive analysis...",
    content: "Suzlon Share Price Target 2026-2050...",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2026-02-02 10:00:00"
  },
  {
    title: "Vodafone Idea Share Price Target 2026-2050",
    slug: "vodafone-idea-share-price-target-2026-to",
    excerpt: "Vodafone Idea (Vi) share price target analysis...",
    content: "Vodafone Idea Share Price Target Analysis...",
    featured_image: null,
    category: "Share Price Target",
    post_type: "post",
    published_at: "2026-02-05 10:00:00"
  },
  {
    title: "HDFC Bank vs ICICI Bank: 2026 mein Kaun Banega Multibagger?",
    slug: "hdfc-bank-vs-icici-bank-analysis-2026",
    excerpt: "HDFC Bank aur ICICI Bank ka head-to-head comparison...",
    content: "HDFC Bank vs ICICI Bank - 2026 Analysis...",
    featured_image: null,
    category: "Stock Analysis",
    post_type: "post",
    published_at: "2026-02-10 10:00:00"
  }
];

// ========== Helper Functions ==========
function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
      console.log(`📌 Resuming from checkpoint: last processed slug = ${data.lastSlug || 'none'}`);
      return data.lastProcessedIndex || 0;
    } catch (e) { return 0; }
  }
  return 0;
}

function saveCheckpoint(index, slug) {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ lastProcessedIndex: index, lastSlug: slug }, null, 2));
}

// Insert batch of posts
async function insertBatch(batch) {
  const { data, error } = await supabase
    .from('posts')
    .upsert(batch, { onConflict: 'slug', ignoreDuplicates: true })
    .select();
  if (error) throw error;
  return data;
}

// Main import function
async function importPosts() {
  console.log('🚀 Starting import to Supabase...\n');
  console.log(`📦 Total posts to process: ${posts.length}\n`);

  const startIndex = loadCheckpoint();
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = startIndex; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    console.log(`\n📝 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${i+1} to ${Math.min(i+BATCH_SIZE, posts.length)})`);

    try {
      const inserted = await insertBatch(batch);
      successCount += inserted.length;
      // If any failed due to duplicate, we don't know count; assume all in batch succeeded if no error
      console.log(`✅ Batch successful: ${inserted.length} posts inserted/updated`);
    } catch (err) {
      console.error(`❌ Batch failed: ${err.message}`);
      // Try individual inserts for this batch to identify problematic ones
      for (const post of batch) {
        try {
          const { error } = await supabase
            .from('posts')
            .upsert(post, { onConflict: 'slug', ignoreDuplicates: true });
          if (error) throw error;
          console.log(`   ✅ ${post.title.substring(0, 40)}...`);
          successCount++;
        } catch (e) {
          console.error(`   ❌ Failed: ${post.title.substring(0, 40)}...`);
          console.error(`       Error: ${e.message}`);
          failCount++;
        }
      }
    }
    saveCheckpoint(i + BATCH_SIZE, batch[batch.length-1]?.slug);
    // Optional: delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n========== IMPORT COMPLETE ==========');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️ Skipped (duplicate): ${skipCount}`);
  console.log(`📝 Total processed: ${posts.length}`);
  console.log('=====================================\n');

  // Cleanup checkpoint file after successful run
  if (failCount === 0 && successCount === posts.length) {
    fs.unlinkSync(CHECKPOINT_FILE);
    console.log('✨ Cleaned up checkpoint file. All posts imported successfully!');
  } else {
    console.log('⚠️ Some posts failed. Checkpoint file kept for resume.');
  }
}

importPosts().catch(console.error);

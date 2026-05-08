# 🚀 ShareTargetPrice.in - Next.js + Vercel + Supabase

## WordPress se Vercel + Supabase pe migrate karne ka poora guide

---

## Step 1: Supabase Setup (5 min)

1. **supabase.com** pe jao → "Start your project" click karo
2. GitHub se login karo
3. "New Project" banao:
   - Name: `sharetargetprice`
   - Database Password: koi strong password
   - Region: **Southeast Asia (Singapore)** choose karo
4. Project ban jayega (2-3 min lagenge)

5. **SQL Editor** mein jao aur `scripts/schema.sql` ka content paste karo → Run karo

6. **Settings > API** mein jao aur copy karo:
   - `Project URL` → ye hai `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → ye hai `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → ye hai `SUPABASE_SERVICE_KEY`

---

## Step 2: GitHub Setup (5 min)

1. **github.com** pe jao → New repository banao
   - Name: `sharetargetprice`
   - Public/Private: kuch bhi
   
2. Is folder ke andar yeh commands chalao (computer pe):
   ```bash
   cd sharetargetprice
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/AAPKA_USERNAME/sharetargetprice.git
   git push -u origin main
   ```

---

## Step 3: Vercel Deploy (5 min)

1. **vercel.com** pe jao → GitHub se login karo
2. "New Project" → apna GitHub repo select karo
3. **Environment Variables** add karo:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_KEY = eyJhbGc...
   NEXT_PUBLIC_ADSENSE_CLIENT = ca-pub-XXXXXXXX
   NEXT_PUBLIC_SITE_URL = https://sharetargetprice.in
   ```
4. "Deploy" click karo!

---

## Step 4: Posts Import (2 min)

Vercel pe deploy ho jaane ke baad, apne computer pe:

```bash
# .env.local file banao aur Supabase keys daalo
cp .env.example .env.local
# .env.local edit karo aur apni keys daalo

# Import karo
npm install
node scripts/import-to-supabase.js
```

---

## Step 5: Domain Connect (5 min)

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. `sharetargetprice.in` add karo
3. Apne domain registrar (GoDaddy/Hostinger) pe jao
4. DNS settings mein Vercel ke nameservers ya CNAME add karo
5. 24-48 ghante mein live ho jayega

---

## Step 6: Google AdSense

1. **adsense.google.com** pe jao
2. Site verify karo (verification code milega)
3. `.env.local` mein `NEXT_PUBLIC_ADSENSE_CLIENT` update karo
4. Post page mein `AdSense` component ke `slot` values apne actual ad slots se update karo

---

## File Structure

```
sharetargetprice/
├── app/
│   ├── layout.tsx          # Main layout (AdSense, fonts)
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Styling
│   ├── sitemap.ts          # Auto sitemap
│   ├── robots.ts           # SEO robots
│   ├── not-found.tsx       # 404 page
│   ├── [slug]/
│   │   └── page.tsx        # Single post page
│   └── category/
│       └── [category]/
│           └── page.tsx    # Category listing
├── components/
│   ├── Header.tsx          # Navigation
│   ├── Footer.tsx          # Footer
│   ├── PostCard.tsx        # Post preview card
│   └── AdSense.tsx         # Ad component
├── lib/
│   └── supabase.ts         # Database client
├── scripts/
│   ├── schema.sql          # Database tables
│   └── import-to-supabase.js  # Import script
├── .env.example            # Environment template
├── next.config.js          # Next.js config
├── package.json
└── tailwind.config.ts
```

---

## Agar Koi Problem Aaye

- **Build fail ho:** Vercel logs check karo
- **Posts nahi dikh rahe:** Supabase mein Table Editor se check karo
- **AdSense nahi dikh raha:** `.env.local` mein ADSENSE_CLIENT check karo
- **Domain kaam nahi kar raha:** DNS propagation ke liye 24-48 ghante wait karo

---

## Support

Koi bhi problem aaye toh Claude se poochho! 😊

# FRONTEND EDU — ilova (2-qadam: skelet)

Stek: React 18 + Vite + TypeScript + Tailwind CSS 3 + Framer Motion + Lucide + Supabase.

## Ishga tushirish
```bash
npm install
cp .env.example .env     # VITE_SUPABASE_ANON_KEY ni to'ldiring
npm run dev
```
Kalit: Supabase Dashboard → Project Settings → API → `anon` / `publishable`. `service_role` kalitni ishlatmang.

## Vercel'ga joylash
1. Loyihani GitHub'ga yuklang (`.env` yuklanmaydi, `.gitignore`da).
2. vercel.com → Add New Project → repozitoriyani tanlang (Framework: Vite).
3. Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` SPA marshrutlarini (sahifani yangilash) ta'minlaydi.
5. Supabase → Authentication → URL Configuration: Site URL va Redirect URLs ga Vercel manzilini qo'shing (parolni tiklash uchun shart).

## Hozir ishlaydiganlar
Bosh sahifa, Kurs haqida, O'quv dasturi (35 mavzu, bazadan), Mavzu sahifasi (+ yakunlash tugmasi, server tekshiruvi),
Metodlar, Glossariy (qidiruv va harf filtri), Kirish / Ro'yxatdan o'tish / Parolni tiklash, O'quvchi kabineti (haqiqiy progress),
Admin paneli (statistika, faqat teacher/admin), yorug'/qorong'i rejim, mobil menyu.

## Hali qilinmagan
Kod muharriri, test topshirish interfeysi, admin CRUD sahifalari, media/taqdimot yuklash, sertifikat PDF, hisobotlar, qidiruv, loyihalar bo'limi.

# 💼 Money Mantra — FSP Generator
### By Viral Bhatt | CFP | AMFI Registered Distributor

AI-powered Financial Solution Plan generator. Client fills details in 6 steps, gets a complete FSP, and a branded PDF + Word copy is automatically emailed to both the client and Viral.

---

## 🚀 Deploy on Vercel (FREE) — 10 Minutes

### Step 1: GitHub pe upload karo
1. [github.com](https://github.com) pe account banao (free)
2. "New Repository" click karo — naam do: `fsp-generator`
3. Ye saari files upload karo (drag & drop works!)
4. "Commit changes" click karo

### Step 2: Anthropic API Key lo
1. [console.anthropic.com](https://console.anthropic.com) pe jao
2. Login/Signup karo
3. "API Keys" → "Create Key" → Copy karo

### Step 3: Resend API Key lo (for emailing the FSP)
1. [resend.com](https://resend.com) pe free account banao
2. Dashboard mein **API Keys** → "Create API Key" → Copy karo
3. **Domain verify karo** (recommended) so emails come from your own domain instead of a generic one:
   - Dashboard → **Domains** → "Add Domain" → enter `moneymantra.info`
   - Resend will show 2-3 DNS records (TXT/CNAME) to add
   - Add these in your domain's DNS settings (ask your domain registrar/host — e.g. GoDaddy, Hostinger — where DNS records are managed; it's usually under "DNS" or "Advanced DNS")
   - Wait for Resend to show "Verified" (can take a few minutes to a few hours)
   - Once verified, you can send from `fsp@moneymantra.info`
   - **Skipping this step?** You can test immediately using Resend's shared address `onboarding@resend.dev` as `RESEND_FROM_EMAIL` — but this only works reliably for sending to your own verified email during testing, not for real client use.

### Step 4: Vercel pe deploy karo
1. [vercel.com](https://vercel.com) pe jao
2. "Sign up with GitHub" click karo
3. "Import Project" → apna `fsp-generator` repo select karo
4. **Environment Variables** section mein teen variables add karo:
   - `ANTHROPIC_API_KEY` → apna Anthropic key
   - `RESEND_API_KEY` → apna Resend key
   - `RESEND_FROM_EMAIL` → `fsp@moneymantra.info` (ya `onboarding@resend.dev` for testing)
5. "Deploy" click karo — Done! ✅

> 🔒 **Security note:** The app calls Claude and Resend through a secure
> server-side function (`/api/generate`), never directly from the browser.
> Your API keys are never visible to site visitors via browser DevTools.

> 📧 **Where do emails go?** The advisor copy always goes to
> `viralbhatt@moneymantra.info` — change this in `api/generate.js`
> (`ADVISOR_EMAIL` constant near the top) if needed.

### Tumhara link milega:
`https://fsp-generator-yourname.vercel.app`

---

## 💻 Local mein run karna ho toh

```bash
# 1. .env file banao
cp .env.example .env
# .env file mein apna ANTHROPIC_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL daalo

# 2. Dependencies install karo
npm install

# 3. Run karo (note: /api functions need `vercel dev`, not `npm start`, to work locally)
npx vercel dev
```

Browser mein open hoga: http://localhost:3000

---

## 📋 Features
- ✅ 6-step guided form (now includes client email + mobile)
- ✅ AI-generated 6-section FSP
- ✅ All 4 financial ratios calculated
- ✅ Goal-based SIP calculation
- ✅ Loan repayment (Avalanche method)
- ✅ Tax planning section
- ✅ Auto-emails branded PDF + Word (.docx) to client AND Viral
- ✅ On-screen copy/download still available as backup
- ✅ Money Mantra branded

## 🎨 Brand Colors
- Primary: #FF8C00 (Saffron Orange)
- Dark: #B35900 (Dark Orange)
- Light: #FFF0D6 (Light Orange)

---

*Developed for Money Mantra | Viral Bhatt*

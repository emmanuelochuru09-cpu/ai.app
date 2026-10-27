# SellPilot AI

> "Turn Your Business Into a Sales Machine."

SellPilot AI is an intelligent business growth platform designed to help small businesses, entrepreneurs, fashion boutiques, restaurants, cleaning businesses, freelancers, and online vendors attract buyers, generate marketing content, and automate sales.

---

## Deployment Options

### 1. Deploying to Netlify (Frontend & SPA)

This repository includes pre-configured `netlify.toml` and `public/_redirects` files.

#### Step-by-Step via Git:
1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. Log into [Netlify](https://www.netlify.com) and click **"Add new site"** → **"Import an existing project"**.
3. Select your repository. Netlify will auto-detect the configuration:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. In **Site configuration > Environment variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
5. Click **"Deploy site"**. Netlify will build the app and give you a live `https://your-site-name.netlify.app` link.

#### Step-by-Step via Manual Drag & Drop:
1. Run `npm run build` locally.
2. Go to the [Netlify Drop](https://app.netlify.com/drop) page.
3. Drag and drop the `dist/` folder into the upload box.

---

### 2. Deploying Full-Stack (Render / Railway / Cloud Run)

To run both the React frontend and the Express backend (`server.ts`) together on one domain:

#### On Render.com:
1. Create a **New Web Service** connected to your GitHub repository.
2. Set:
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Add Environment Variable:
   - `GEMINI_API_KEY`: Your Gemini API key.
4. Render will deploy your full-stack app at `https://your-app.onrender.com`.

---

## Environment Variables (`.env`)

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Required for real Gemini AI ad, social, and advisor generations |
| `APP_URL` | Base public URL of your app (e.g. `https://sellpilot.netlify.app`) |
| `PAYSTACK_PUBLIC_KEY` | Public key for Paystack payment processing (optional in sandbox) |
| `PAYSTACK_SECRET_KEY` | Secret key for server-side payment verification (optional in sandbox) |
| `PORT` | Local server port (defaults to `3000`) |

---

## Testing Credentials

- **Business Vendor (Pro Plan):**
  - Email: `demo@sellpilot.ai`
  - Password: `password123`
- **Administrator Account:**
  - Email: `emmanuelochuru09@gmail.com`
  - Password: `AdminPass123!`

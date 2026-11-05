# SmartQR Business SaaS Platform - Production Deployment Guide

This guide details deploying the SmartQR Business Web Application to Vercel and building the Business Owner Android Application (APK).

---

## Part 1: Web Application Deployment (Vercel)

### Step 1: Push Project to GitHub / GitLab
1. Initialize git and commit your files:
```bash
git init
git add .
git commit -m "feat: complete SmartQR Business SaaS platform"
git branch -M main
git remote add origin https://github.com/your-username/smartqr-business.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and select your `smartqr-business` repository.
3. Framework Preset: **Vite**
4. Root Directory: `./`
5. Build Command: `npm run build`
6. Output Directory: `dist`

### Step 3: Add Environment Variables in Vercel
Under the **Environment Variables** section, add:
- `VITE_APP_NAME`: `SmartQR Business`
- `VITE_APP_URL`: `https://your-custom-domain.com`
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
- `VITE_RAZORPAY_KEY_ID`: Your Razorpay Key ID
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
- `RAZORPAY_WEBHOOK_SECRET`: Your Razorpay Webhook Secret

### Step 4: Configure Custom Domain & HTTPS
1. In Vercel Project Settings, navigate to **Domains**.
2. Add your custom domain (e.g. `smartqr.in` or `app.smartqr.in`).
3. Follow the DNS instructions (add A Record or CNAME in your domain registrar such as GoDaddy, Namecheap, or Cloudflare).
4. Vercel provisions free SSL certificates (HTTPS) automatically.

---

## Part 2: Business Owner Android Application (APK)

The Android native application is powered by Capacitor and located inside the `android/` directory.

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed on your system.
- Android SDK Platform 34+ installed via Android Studio SDK Manager.

### Building the Android APK
1. Ensure the web application is built and synced:
```bash
npm run build
npx cap sync android
```

2. Open the project in Android Studio:
```bash
npx cap open android
```

3. **To generate a Debug APK immediately from command line:**
```bash
cd android
./gradlew assembleDebug
```
The output APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

4. **To generate a Signed Production Release APK:**
- In Android Studio, go to **Build** > **Generate Signed Bundle / APK**.
- Select **APK**, choose your Keystore, and select the **Release** build variant.
- The signed APK can be directly distributed to business owners or uploaded to the Google Play Console!

### Key Mobile App Features:
- Business owners log in with their email and password.
- Access their live dashboard, edit profile, update menu, view photos, and review subscription status.
- Changes synchronize instantly with the cloud backend without modifying the permanent QR destination.
- Super Admin dashboard is excluded from the mobile app for maximum security.

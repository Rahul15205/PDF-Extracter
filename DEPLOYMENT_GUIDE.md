# Deploying to Vercel

Since this is a Node.js Express backend, we need to follow specific steps to deploy it to Vercel.

## 1. Preparation (Done for you)
I have already:
- Created a `vercel.json` configuration file.
- Created a `.gitignore` file to exclude `node_modules` and keys.
- Updated `server.js` to be compatible with Vercel Serverless Functions.

## 2. Push to GitHub
1. Create a new repository on GitHub (e.g., `pdf-extractor`).
2. Open your terminal in the project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pdf-extractor.git
   git push -u origin main
   ```

## 3. Import in Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository (`pdf-extractor`) and click **Import**.

## 4. Environment Variables (CRITICAL)
1. On the Vercel import screen, look for **"Environment Variables"**.
2. Add your Groq API Key:
   - **Key**: `GROQ_API_KEY`
   - **Value**: `gsk_...` (Paste your actual key here)
3. Click **Deploy**.

## 5. Verify
Once deployed, Vercel will give you a URL (e.g., `https://pdf-extractor.vercel.app`).
Open it, and your app should work!

> **Note on Logging**: The `logs.json` file logging feature will likely **NOT work** correctly on Vercel because Vercel's file system is read-only (ephemeral). You would need a real database (like MongoDB) for persistent logs, but the extraction checking features will work fine.

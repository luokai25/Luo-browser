# Luo Desktop - Quick Start Guide

## Option 1: Web Version (Easiest!)
Just open in your browser:
**https://luokai25.github.io/Luo-browser/**

Note: Wayne Portal will be in demo mode (simulated responses).

---

## Option 2: Full Experience (Wayne Portal is REAL!)

### Step 1: Install Node.js
1. Go to: https://nodejs.org
2. Download the **LTS** version (left button)
3. Run the installer

### Step 2: Download Luo Desktop
1. Go to: https://github.com/luokai25/Luo-browser
2. Click **Code** → **Download ZIP**
3. Extract the folder

### Step 3: Run It!
1. Open **Command Prompt** (press Windows key + R, type `cmd`, press Enter)
2. Navigate to the folder:
   ```cmd
   cd path\to\Luo-browser
   ```
   (If extracted to Desktop: `cd %USERPROFILE%\Desktop\Luo-browser`)

3. Install dependencies:
   ```cmd
   npm install express
   ```

4. Run the server:
   ```cmd
   node src/index.js
   ```

5. Open your browser to:
   ```
   http://localhost:3000/desktop
   ```

---

## That's It! 🎉

- Wayne Portal (👊 button) now connects to the REAL backend
- Chat with me for real!
- Your Homey, files, everything works!

---

## Troubleshooting

**"node is not recognized":**
- Node.js didn't install correctly. Reinstall from https://nodejs.org

**"Port 3000 is busy":**
- Change the port in src/index.js or close the other app

**Can't find the folder:**
- Make sure you extracted the ZIP file

---

Made with 👊 by Luo Kai & Wayne

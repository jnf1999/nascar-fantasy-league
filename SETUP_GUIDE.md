# Google Apps Script Setup Guide

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Rename it to **"NASCAR Fantasy League Data"**

## Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. This opens the Apps Script editor in a new tab

## Step 3: Add the Backend Code

1. Delete any existing code in the editor
2. Open the file `google-apps-script/Code.gs` from your project
3. Copy all the code and paste it into the Apps Script editor
4. **IMPORTANT**: Change the passcode on line 7:
   ```javascript
   const PASSCODE = 'nascar2026'; // Change this to your desired passcode
   ```
5. Click **Save** (💾 icon or Ctrl+S)
6. Name your project: **"NASCAR Fantasy API"**

## Step 4: Initialize the Sheets

1. In the Apps Script editor, select the `initializeSheets` function from the dropdown at the top
2. Click **Run** (▶️ icon)
3. You'll be prompted to authorize the script:
   - Click **Review Permissions**
   - Select your Google account
   - Click **Advanced** → **Go to NASCAR Fantasy API (unsafe)**
   - Click **Allow**
4. After authorization completes, go back to your spreadsheet
5. You should now see 7 new sheets created:
   - Users
   - Active Drivers
   - Races
   - Picks
   - Race Results
   - Bonus Points
   - Historical Data

## Step 5: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: NASCAR Fantasy API v1
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**
6. You may need to authorize again - click **Authorize access** and follow the prompts
7. **COPY THE WEB APP URL** - it will look like:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
   You'll need this URL for the frontend!

## Step 6: Configure the Frontend

1. Open `index.html` in a text editor
2. Find the line near the top of the `<script>` section:
   ```javascript
   const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   const PASSCODE = 'nascar2026';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your web app URL from Step 5
4. Make sure the `PASSCODE` matches what you set in Code.gs
5. Save the file

## Step 7: Test the App

1. Open `index.html` in your web browser
2. You should see a login screen asking for the passcode
3. Enter your passcode
4. If successful, you should see the NASCAR Fantasy League app
5. Try adding a user or driver to verify the backend is working

## Troubleshooting

### "Invalid passcode" error
- Make sure the passcode in `index.html` matches the one in `Code.gs`
- Both are case-sensitive

### "Failed to load data" error
- Check that the API_URL is correct in `index.html`
- Make sure you deployed the script as a web app
- Verify the deployment has "Who has access" set to "Anyone"

### Data not saving
- Check the browser console for errors (F12)
- Verify the web app URL is correct
- Make sure you ran `initializeSheets` function at least once

### Authorization issues
- In Apps Script editor, go to **Project Settings** (⚙️ icon)
- Check that you've authorized the script
- Try re-deploying the web app

## Updating the Backend

If you need to make changes to the backend code:

1. Edit `Code.gs` in the Apps Script editor
2. Click **Save**
3. Click **Deploy** → **Manage deployments**
4. Click the pencil icon (✏️) to edit the active deployment
5. Click **Version** → **New version**
6. Click **Deploy**

The URL stays the same, so you don't need to update the frontend!

## Sharing with Your League

1. Share the `index.html` file with your league members
2. They can open it directly in their browser (no server needed!)
3. Give them the passcode
4. Everyone will access the same centralized data

**Note**: For better sharing, you can host the `index.html` file on:
- GitHub Pages (free)
- Google Drive (as an HTML file)
- Any web hosting service

Enjoy your NASCAR Fantasy League! 🏁

# Project Folder Structure

This document summarizes the folder layout of **AgentBill** and describes the purpose of each file. Paths are relative to the repository root.

## Directory Overview

```
.
├── components/      # React components used by the pages
├── docs/            # Project documentation
├── pages/           # Next.js pages and API routes
│   └── api/         # Backend endpoints
├── public/          # Static assets served directly
├── styles/          # CSS modules and global styles
├── utils/           # Helper functions
├── .github/         # GitHub workflow configuration
└── ...              # Configuration and metadata files
```

## File Descriptions

### Root Files

| File | Description |
|------|-------------|
| `.env.example` | Example environment variables. |
| `.gitignore` | Git ignore rules. |
| `LICENSE` | Project license information. |
| `README.md` | Overview and setup instructions. |
| `next-env.d.ts` | TypeScript definitions for Next.js (generated). |
| `next.config.js` | Next.js configuration. |
| `package.json` | Node.js dependencies and scripts. |
| `tsconfig.json` | TypeScript compiler options. |
| `.github/workflows/deploy.yml` | CI workflow to deploy to Vercel. |

### Components

| File | Description |
|------|-------------|
| `components/Layout.tsx` | Shared page layout with navigation links. |

### Documentation

| File | Description |
|------|-------------|
| `docs/deploy_vercel.md` | How to set up automatic deployment to Vercel. |
| `docs/detailed_user_stories.md` | Expanded list of user stories. |
| `docs/overview.md` | High‑level integration overview. |
| `docs/setup_google.md` | Steps to configure Google APIs. |
| `docs/spreadsheet_formatting.md` | Instructions for formatting the Google Sheet. |
| `docs/user_stories.md` | High‑level user stories table. |
| `docs/folder_structure.md` | **This document**. |

### Pages

| File | Description |
|------|-------------|
| `pages/_app.tsx` | Custom App component that sets global metadata. |
| `pages/index.tsx` | Home page with links to main features. |
| `pages/links.tsx` | Displays the Planilha page with access to the Google Sheet and Calendar. |
| `pages/settings.tsx` | Manage Google OAuth and OpenAI key. |
| `pages/upload.tsx` | Upload page for bills. |
| `pages/oauth2callback.tsx` | Handles Google OAuth redirect. |
| `pages/privacy.tsx` | Static privacy policy page. |
| `pages/terms.tsx` | Static terms of service page. |

#### API Routes

| File | Description |
|------|-------------|
| `pages/api/calendar.ts` | Creates events in Google Calendar. |
| `pages/api/config.ts` | Stores and retrieves configuration via cookies. |
| `pages/api/hello.ts` | Example API route. **Deprecated** |
| `pages/api/process.ts` | Sends files to OpenAI API for parsing. |
| `pages/api/renameSheet.ts` | Renames an existing Google Sheet. |
| `pages/api/sheets.ts` | Writes bill data to Google Sheets. |
| `pages/api/userinfo.ts` | Returns Google account information. |

### Public Assets

Static files served from `/`.

| File | Description |
|------|-------------|
| `public/AgentBillIcon.png` | Application icon. |
| `public/AgentBillLogo.png` | Application logo. |
| `public/apple-touch-icon.png` | Apple touch icon. |
| `public/favicon-96x96.png` | Favicon image. |
| `public/favicon.ico` | Standard favicon. |
| `public/favicon.svg` | SVG favicon. |
| `public/site.webmanifest` | PWA manifest. |
| `public/web-app-manifest-192x192.png` | PWA icon. |
| `public/web-app-manifest-512x512.png` | PWA icon. |

### Styles

| File | Description |
|------|-------------|
| `styles/globals.css` | Global styles loaded by `_app.tsx`. |
| `styles/Home.module.css` | Styles for the home page. |
| `styles/Links.module.css` | Styles for the Planilha page. |
| `styles/Layout.module.css` | Styles for the layout component. |
| `styles/Settings.module.css` | Styles for the settings page. |
| `styles/Upload.module.css` | Styles for the upload page. |

### Utilities

| File | Description |
|------|-------------|
| `utils/image.ts` | Helper functions to read and compress images. |
| `utils/logoData.ts` | Base64 encoded logo data. **Deprecated** |
| `utils/googleAuth.ts` | Helpers to exchange and refresh Google OAuth tokens. |


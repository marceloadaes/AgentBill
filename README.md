# AgentBill

AI Test Project - A web agent that reads an image of a bill, schedules reminders in Google Calendar and logs to a Google Spreadsheet. The project now runs on **Next.js** and is deployed automatically to **Vercel**.

For more details about how the project integrates with Google services and OpenAI, see [docs/overview.md](docs/overview.md).


## Documentation

High level user stories and requirements are stored in the [docs/user_stories.md](docs/user_stories.md) file. Detailed descriptions can be found in [docs/detailed_user_stories.md](docs/detailed_user_stories.md).
Specific user stories for the WhatsApp ordering flow are documented in [docs/whatsapp_user_stories.md](docs/whatsapp_user_stories.md).
Formatting guidelines are available in [docs/spreadsheet_formatting.md](docs/spreadsheet_formatting.md).
Para uma visão resumida em português do projeto Sequille, consulte [docs/descricao_resumida.md](docs/descricao_resumida.md).

## Google OAuth Setup


During development the server will automatically create a `.env.local` file
from `.env.example` if it does not exist. Fill in `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET` and `GOOGLE_REDIRECT_URI` in this file so the server can
refresh expired tokens automatically. In production (for example when deploying
to Vercel) you must define these variables in the project settings.


The application ships with a built-in Google OAuth client ID so it runs out of
the box. If you prefer to use your own ID, update the `GOOGLE_CLIENT_ID`
constant in `pages/settings.tsx`. The redirect URL should point to
`/oauth2callback` on your deployed site. Once configured, you can connect or
disconnect your Google account from the **Settings** page. When connecting, the application requests access to Calendar, Sheets, Drive metadata and your basic profile so it can detect when a spreadsheet is moved to the trash.

### .env.local (exemplo funcional)

```
GOOGLE_CLIENT_ID=198927534674-0akhqu4ip9hg276ag2mliknkh7pvp4op.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=dummy_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=198927534674-0akhqu4ip9hg276ag2mliknkh7pvp4op.apps.googleusercontent.com
```


## Secure Configuration Storage

The Settings page persists the Google OAuth token and your OpenAI API key using HTTP-only cookies. These cookies are set via the `/api/config` endpoint and cannot be accessed from JavaScript, providing basic protection against XSS. The stored values remain available after a page refresh. You can remove them at any time using the **Disconnect Google** or **Remove Key** buttons.
## Image Upload Limit

The OpenAI Vision API only accepts image files up to **1 MB**. When you select a JPEG or PNG larger than this limit on the **Upload** page, AgentBill automatically reduces the image size in the browser before sending it to the API. PDFs that exceed 1 MB are rejected and must be resized manually.

## Deployment

The repository includes a GitHub Actions workflow that deploys the Next.js application to Vercel whenever changes are pushed to `main`. Setup instructions are available in [docs/deploy_vercel.md](docs/deploy_vercel.md).

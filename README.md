# AgentBill

AI Test Project - A web agent that reads an image of a bill, schedules reminders in Google Calendar and logs to a Google Spreadsheet. The project now runs on **Next.js** and is deployed automatically to **Vercel**.

For more details about how the project integrates with Google services and OpenAI, see [docs/overview.md](docs/overview.md).

## Documentation

High level user stories and requirements are stored in the [docs/user_stories.md](docs/user_stories.md) file. Detailed descriptions can be found in [docs/detailed_user_stories.md](docs/detailed_user_stories.md).

## Google OAuth Setup


Copy `.env.example` to `.env.local` and replace the placeholder values with your
own credentials:

```bash
cp .env.example .env.local
```

Then set the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable with the client
ID of your Google OAuth application. The redirect URL should point to
`/oauth2callback` on your deployed site. A default client ID is bundled with the
code so the application works out of the box, but you can override it by setting
your own value. Once configured, you can connect or disconnect your Google
account from the **Settings** page. If no value is provided, the default ID will
be used.

## Secure Configuration Storage

The Settings page persists the Google OAuth token and your OpenAI API key using HTTP-only cookies. These cookies are set via the `/api/config` endpoint and cannot be accessed from JavaScript, providing basic protection against XSS. The stored values remain available after a page refresh. You can remove them at any time using the **Disconnect Google** or **Remove Key** buttons.

## Deployment

The repository includes a GitHub Actions workflow that deploys the Next.js application to Vercel whenever changes are pushed to `main`. Setup instructions are available in [docs/deploy_vercel.md](docs/deploy_vercel.md).

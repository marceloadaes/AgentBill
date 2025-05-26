# AgentBill

AI Test Project - A web agent that reads an image of a bill, schedules reminders in Google Calendar and logs to a Google Spreadsheet. The project now runs on **Next.js** and is deployed automatically to **Vercel**.

For more details about how the project integrates with Google services and OpenAI, see [docs/overview.md](docs/overview.md).

## Documentation

High level user stories and requirements are stored in the [docs/user_stories.md](docs/user_stories.md) file. Detailed descriptions can be found in [docs/detailed_user_stories.md](docs/detailed_user_stories.md).

## Google OAuth Setup

Set the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable with the client ID of your Google OAuth application. The redirect URL should point to `/oauth2callback` on your deployed site. Once configured, you can connect or disconnect your Google account from the **Settings** page. If the variable is missing, the **Connect** button will display an error and no OAuth request will be made.

## Deployment

The repository includes a GitHub Actions workflow that deploys the Next.js application to Vercel whenever changes are pushed to `main`. Setup instructions are available in [docs/deploy_vercel.md](docs/deploy_vercel.md).

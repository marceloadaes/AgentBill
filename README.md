# AgentBill
AI Test Project - A web agent that reads an image of a bill, schedule on Google Agenda and reports on a Google Spreadsheet

For more details about how the project integrates with Google services and OpenAI, see [docs/overview.md](docs/overview.md).

AI Test Project - A web agent that reads an image of a bill, schedules it on Google Agenda and reports it on a Google Spreadsheet.

## Documentation

High level user stories and requirements are stored in the [docs/user_stories.md](docs/user_stories.md) file. Consult this document for the list of planned features and their acceptance criteria.

Detailed descriptions of the user stories can be found in [docs/detailed_user_stories.md](docs/detailed_user_stories.md).

## Deployment

The repository includes a GitHub Actions workflow that automatically pushes the
contents of the `src` directory to the Google Apps Script project whenever
changes are pushed to `main`. Instructions for setting up the credentials and
customizing this workflow can be found in
[docs/deploy_appscript.md](docs/deploy_appscript.md).

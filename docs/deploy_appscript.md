# Automated Deployment to Google Apps Script

This project uses [CLASP](https://github.com/google/clasp) to manage the Apps Script source located in the `src` folder. The script ID for the Apps Script project is stored in `.clasp.json`.

A GitHub Actions workflow is provided to automatically push the contents of `src` to the associated Apps Script project whenever changes are pushed to the `main` branch.

## Setup Steps

1. **Create a Google Cloud service account** with access to the Apps Script project.
2. Generate a service account JSON key and store the entire contents of the file as a GitHub secret named `CLASP_CREDENTIALS`.
3. Ensure the service account has permission to edit the Apps Script project.
4. Commit your Apps Script code to the `src` directory and push it to GitHub.
5. On every push to `main`, the workflow defined in `.github/workflows/deploy.yml` will authenticate using the credentials and run `clasp push` to upload the code.

If you prefer to deploy manually, run:

```bash
npm install -g @google/clasp
clasp login --creds <path-to-your-service-account.json>
clasp push
```

The `.clasp.json` file already contains the project ID:

```
1J0GVzZFf9wiq1v3PiYBSx5po-q1tFXz9dLM4m0T9TQt-TuGNehEHKgXW
```

so the commands above will update that project.

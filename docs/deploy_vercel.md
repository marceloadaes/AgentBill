# Automated Deployment to Vercel

This project is deployed automatically to [Vercel](https://vercel.com/) whenever changes are pushed to the `main` branch.

## Setup Steps

1. Create a Vercel account and import this repository.
2. Generate a Vercel token and add it as a secret named `VERCEL_TOKEN` in your GitHub repository.
3. Add your Vercel `ORG_ID` and `PROJECT_ID` as secrets `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
4. The workflow in `.github/workflows/deploy.yml` will trigger on each push to `main` and deploy the app automatically.

To deploy manually, run:

```bash
npx vercel --prod
```

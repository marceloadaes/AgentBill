# Spreadsheet Formatting

These guidelines explain how the Google Sheet **Agent Bill -- Controle de Contas** should be formatted.

## Adding the Agent Bill logo
1. Merge the cells `A1:F6` on the `Contas` sheet.
2. Insert the same logo used by the application inside the merged cell. The application logo is available in the repository at `public/AgentBillLogo.png`.
3. Use the formula `=IMAGE("https://<YOUR_APP_URL>/AgentBillLogo.png")` or embed the image directly so it spans rows 1–6.
4. Center the image horizontally and keep its aspect ratio when resizing.

## Formatting the header row
When the first bill is inserted the header row should be styled for readability:

- Set the background color of the header to `#2c3e50`, the same color as the application's menu bar.
- Make the header text white and bold.

These steps ensure the spreadsheet matches the look and feel of Agent Bill.

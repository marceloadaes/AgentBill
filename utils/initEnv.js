const fs = require('fs');
const path = require('path');

// Only run in local development
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    const examplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log('.env.local criado a partir de .env.example');
    } else {
      console.warn('Arquivo .env.example não encontrado.');
    }
  }
}

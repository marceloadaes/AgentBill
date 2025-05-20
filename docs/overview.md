# Project Overview

This document provides a high-level overview of how AgentBill integrates with various services.

| Component | Service | Purpose |
|-----------|---------|---------|
| Armazenamento | Google Sheets | Usado para armazenar as contas processadas, evitando duplicações. |
| Agenda | Google Calendar API | Usado para criar lembretes automáticos para pagamento das contas. |
| Processamento de Imagens | OpenAI Vision API | Usado para extrair informações de contas a partir de imagens e PDFs. **OpenAI API KEY: [REDACTED]** |
| Interface Web | Google Sites | Interface web onde o usuário pode interagir com o agente sem necessidade de backend próprio. |
| Automação | Google Apps Script (JavaScript) | Responsável por processar dados, interagir com APIs do Google e gerenciar a lógica do agente. |
| Autenticação | Google OAuth | Usado para garantir acesso seguro à planilha e ao calendário do usuário. |
| Comunicação entre Serviços | Google Apps Script + URL Fetch | Realiza chamadas HTTP para a API do OpenAI e outras integrações. |
| Upload de Arquivos | Google Drive (opcional) | Se necessário, pode armazenar as imagens e PDFs antes do processamento. |
| Monitoramento e Logs | Google Sheets (Logs) | Registra operações como processamento de arquivos e criação de eventos no calendário. |
| Email | Google Mail (GMail) | Usado para envio de histórias |


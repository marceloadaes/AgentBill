# Google Environment Setup

Esta documentação descreve como configurar o ambiente do Google para usar o AgentBill. Siga cada etapa para gerar o ID de cliente, habilitar as APIs necessárias e atualizar o código.

## 1. Criar o projeto e gerar o Google ID

1. Acesse [Google Cloud Console](https://console.cloud.google.com/) e crie um novo projeto.
2. Abra o menu **APIs e serviços** e selecione **Tela de consentimento OAuth**.
3. Escolha o tipo **Externo** e preencha as informações mínimas exigidas. Salve e continue até finalizar.
4. No menu **Credenciais**, clique em **Criar credenciais -> ID do cliente OAuth**.
5. Selecione **Aplicativo da Web** e defina um nome.
6. Em **URIs de redirecionamento autorizados**, adicione `https://<SEU_DOMINIO>/oauth2callback`.
7. Após criar, será exibido o **ID do cliente**. Copie esse valor, pois ele será usado no código.

## 2. Onde colocar o Google ID

O AgentBill já possui um ID de exemplo, mas você pode substituir pelo seu próprio valor:

1. Abra o arquivo `pages/settings.tsx`.
2. Localize a constante `GOOGLE_CLIENT_ID` perto do início do componente.
3. Substitua o valor existente pelo ID obtido na etapa anterior.
4. Opcionalmente, crie um arquivo `.env.local` a partir de `.env.example` e mantenha o mesmo ID para facilitar a configuração local.

## 3. Ativar a API de Sheets

1. No mesmo projeto do Google Cloud, abra o menu **Biblioteca** dentro de **APIs e serviços**.
2. Pesquise por **Google Sheets API** e clique em **Ativar**.

## 4. Ativar a API de Agenda

1. Ainda na **Biblioteca** de APIs, procure por **Google Calendar API**.
2. Clique em **Ativar** para habilitar o acesso ao calendário.

Depois dessas etapas, o aplicativo já poderá solicitar permissões para acessar suas planilhas e agenda quando conectar a conta Google pela página **Settings**.

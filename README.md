# PDMRevolve Frontend

Vite + React + Tailwind CSS web app for `PDMRevolve` borrower/admin experiences.

## Features in this starter

- Dashboard page (pilot KPI snapshot, API timestamps, CSV export)
- Repayments page (recent verified transactions)
- Education page (module catalog, filters, links to module detail)
- Module detail route: `/education/:code`
- API integration via `VITE_API_BASE_URL`

## Tech stack

- Vite
- React
- React Router
- Tailwind CSS (via `@tailwindcss/vite`)

## Environment variables

Create `.env` from the example:

```bash
cp .env.example .env
```

Required:

- `VITE_API_BASE_URL`  
  - Local: `http://localhost:4000`
  - Production: `https://<your-render-api>.onrender.com`

## Local development

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## Deploy on Vercel

1. Import this repository/folder in Vercel.
2. Ensure framework is detected as **Vite**.
3. Set environment variable:
   - `VITE_API_BASE_URL=https://<your-render-api>.onrender.com`
4. Deploy.

## Common issues

- **CORS errors in browser**  
  Ensure backend `CORS_ORIGIN` matches your Vercel domain exactly.
- **Frontend cannot reach API**  
  Confirm `VITE_API_BASE_URL` is set in Vercel project settings and redeploy.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

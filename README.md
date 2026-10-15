# MontrixFortune

Online furniture store: React (Vite) frontend + Spring Boot 3 / Java 21 backend + MySQL 8, payments by Razorpay.

- Developer guide (architecture, database, flows): [understand.md](understand.md)
- Going live on a Hostinger VPS with GitHub auto-deploy: [DEPLOY.md](DEPLOY.md)
- Pre-launch checklist and progress: [DEPLOYMENT_READINESS.md](DEPLOYMENT_READINESS.md)

## Run locally
1. MySQL 8 running on port 3306 with an empty database `montrix_furniture`.
2. Copy `.env.example` to `.env` and fill it in (never commit `.env`).
3. Backend: `.\mvnw.cmd spring-boot:run` (http://localhost:8080)
4. Frontend: `npm install` then `npm run dev` (http://localhost:5173)

On the first start the app creates the tables and loads 50 starter products (10 per category) and 3 homepage banners.

## Run everything with Docker
```
docker compose up -d --build
```
Needs the variables listed in `.env.example` (see DEPLOY.md).

## Product catalog
`src/main/resources/catalog/products.json` holds the starter catalog (names, descriptions, INR prices, stock).
Images are in `public/products/*.svg`. `tools/catalog/` contains the script that generated them.
Admins add or change products later in the admin panel; those go straight into the database.

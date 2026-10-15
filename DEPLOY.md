# Deploying MontrixFortune to a Hostinger VPS (with GitHub auto-deploy)

Result: every `git push` to `main` rebuilds and restarts the site. Data lives in a MySQL container with a permanent volume, so deploys do not erase it.

```
git push  ->  GitHub Actions  ->  Hostinger deploy action  ->  VPS runs docker-compose.yml
                                                                   |- web      (Caddy: HTTPS + React files + proxy /api)
                                                                   |- backend  (Spring Boot)
                                                                   '- db       (MySQL 8.4, volume mysql_data)
```

## 0. What you need
- A **Hostinger VPS** (KVM) with the **Docker** OS template. Ordinary shared / Business / Cloud web hosting cannot run a Spring Boot + MySQL app (those plans are for PHP / Node.js sites) - check your plan in hPanel.
- A **domain** with an A record pointing to the VPS IP address.
- A **GitHub** account and a **private** repository.
- Razorpay **test** keys first; live keys only after a full test purchase.

## 1. Check it builds on your PC (do this before pushing)
The new code was edited without being compiled, so confirm first:
```
cd "C:\Users\shasrinv\OneDrive - Lenovo\Desktop\MyWorkSpace\UdemySpringBootProjects\MontrixFortuneFrontEnd\MontrixFortune"
.\mvnw.cmd clean package
npm run build
```
Then start it (`.\mvnw.cmd spring-boot:run`, `npm run dev`) and click through: home page shows 50 products with pictures, login, add to cart, COD checkout, admin login, add a product.
If Maven prints errors, send them to me.

## 2. Put the project in Git (repository root = the `MontrixFortune` folder)
```
git init -b main
git add .
git status
git ls-files | findstr /i "\.env"
```
The last command must print only `.env.example`. If it prints `.env`, STOP and fix `.gitignore` first.
```
git commit -m "Initial commit"
```
Create an empty **private** repo on github.com (no README), then:
```
git remote add origin https://github.com/<your-user>/<repo>.git
git push -u origin main
```
(Do not use the parent folder `MontrixFortuneFrontEnd` as the repository.)

## 3. Hostinger
1. hPanel -> VPS -> OS: choose **Docker** template.
2. Note the VM ID: for hostname `srv123456.hstgr.cloud` it is `123456`.
3. hPanel -> Account -> **API** -> create an API key.
4. Domain DNS: A record `@` (and `www` if wanted) -> VPS IP.

## 4. GitHub secrets and variables
Repo -> Settings -> Secrets and variables -> Actions.

Secrets
| Name | Value |
|---|---|
| HOSTINGER_API_KEY | key from step 3 |
| PERSONAL_ACCESS_TOKEN | GitHub token that can read this private repo (fine-grained, "Contents: read") |
| MYSQL_ROOT_PASSWORD | long random |
| DB_PASSWORD | long random (different) |
| JWT_SECRET | long random |
| JWT_REFRESH_SECRET | long random (different) |
| RAZORPAY_KEY / RAZORPAY_SECRET | Razorpay key id / secret (test first) |
| RAZORPAY_WEBHOOK_SECRET | any long random string; you will paste the same into Razorpay |
| ADMIN_EMAIL | your admin login e-mail |
| ADMIN_PASSWORD | strong password, at least 10 characters |

Variables
| Name | Value |
|---|---|
| HOSTINGER_VM_ID | e.g. 123456 |
| DOMAIN | e.g. shop.example.com |
| VITE_RAZORPAY_KEY_ID | Razorpay key id (public) |

Generate a random value: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
Avoid spaces and `#` in passwords.

## 5. Deploy
`git push` to `main` (or Actions -> "Deploy to Hostinger VPS" -> Run workflow). First build takes several minutes. Watch it in the GitHub Actions tab and in hPanel -> VPS -> Docker manager (logs).
On the first start the app creates all tables, the 5 categories, the 50 starter products, 3 banners and your admin account from ADMIN_EMAIL / ADMIN_PASSWORD. Demo logins (admin123 etc.) are NOT created on the server.

## 6. Check it works
1. `https://your-domain` shows the store with pictures.
2. Log in with ADMIN_EMAIL -> open /admin -> add a product -> it appears on the storefront (it is saved in MySQL).
3. Place a COD order, then a Razorpay test-mode order; check both in admin Orders / Payments.
4. Look at the data directly (Hostinger terminal): `docker exec -it $(docker ps -qf name=db) sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" montrix_furniture -e "select count(*) from products"'`

## 7. Razorpay webhook (important)
Razorpay dashboard -> Settings -> Webhooks -> Add:
- URL: `https://your-domain/api/payments/webhook`
- Secret: the same value as RAZORPAY_WEBHOOK_SECRET
- Events: `payment.captured`, `payment.failed`
Without it, a customer who pays and then closes the browser will not get a confirmed order.

## 8. Everyday updates
Change code -> `git add . && git commit -m "message" && git push` -> site updates by itself. Customer data stays (volume `mysql_data`). Never run `docker compose down -v` on the server - it deletes the database.
Rollback: `git revert <commit>` and push.

## 9. About your existing local database
- The old dummy products are replaced by the new 50-product catalog automatically on the **server** (fresh DB). Nothing to copy.
- On your **PC**, the new code replaces the old dummy products when you start the backend once (`APP_SEED_REPLACE_CATALOG=true` is in your local `.env`; products already used by a test order are kept with stock 0). Remove that line afterwards.
- Real customers/orders created only on your PC? Start the live site fresh. If you truly need them, tell me and I will prepare a safe export/import for users and addresses only.
- Products you add through the admin panel are saved in MySQL on whichever server the admin panel is running on. Local admin -> local DB; live admin -> live DB. They are separate.

## 10. Backups
`scripts/backup.sh` writes a compressed dump daily (cron example inside). Also enable Hostinger VPS snapshots/backups, and copy dumps off the server. Test a restore once:
`gunzip -c montrix-DATE.sql.gz | docker exec -i $(docker ps -qf name=db) sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" montrix_furniture'`

## 11. Server hygiene
- Firewall: allow only 22, 80, 443. Use SSH keys; turn off password login.
- Change nothing in the `db` service to publish port 3306.
- Keep the VPS OS updated (`apt update && apt upgrade`).

## If the Hostinger action cannot build the images
Their guide does not say whether `build:` contexts in docker-compose are supported. If the deploy fails with a build/context error, do it by SSH once:
```
git clone https://github.com/<you>/<repo>.git /opt/montrixfortune && cd /opt/montrixfortune
# create .env with the same names as the secrets above, then:
docker compose up -d --build
```
and tell me - I will switch the workflow to build images on GitHub and have the VPS pull them (or deploy over SSH).

## Changes to make when going from local/test to production
| What | Local / test | Production |
|---|---|---|
| Razorpay keys | `rzp_test_...` | **Live** keys: `RAZORPAY_KEY`, `RAZORPAY_SECRET`, `VITE_RAZORPAY_KEY_ID` (GitHub secrets/variables). Account must be activated (KYC) by Razorpay first. |
| Razorpay webhook | none or tunnel | Create the webhook again in **Live mode** (test and live are separate): `https://your-domain/api/payments/webhook`, events `payment.captured`, `payment.failed`, secret = `RAZORPAY_WEBHOOK_SECRET` |
| Domain / HTTPS | `http://localhost:5173` | `DOMAIN` variable; HTTPS is automatic (Caddy). Razorpay live needs https. |
| Database | local MySQL, password in your `.env` | MySQL container from `docker-compose.yml`; new `DB_PASSWORD` + `MYSQL_ROOT_PASSWORD` secrets. Change your old local root password (it was in the old config file). |
| JWT secrets | local `.env` | **Different** new random `JWT_SECRET` / `JWT_REFRESH_SECRET` secrets |
| Admin login | `admin@montrix.com` / `admin123` (demo) | `ADMIN_EMAIL` / `ADMIN_PASSWORD` secrets. Demo users are never created in prod. |
| `APP_SEED_DEMO_USERS`, `APP_SEED_REPLACE_CATALOG` | true in local `.env` | not set (compose forces demo users off) |
| Frontend API address | `http://localhost:8080` (default) | empty `VITE_API_URL` (same domain, already set in `docker-compose.yml`) |
| CORS | localhost origins | automatic: `https://<DOMAIN>` |
| Test data | test orders in local DB | live DB starts empty except the catalog and your admin |

Things Razorpay / Indian law typically expect on a live shop that this project does NOT have yet - add before taking real money: Privacy Policy, Terms & Conditions, Cancellation/Refund and Shipping policy pages, contact details/address in the footer. Also missing: order e-mails/SMS, GST invoices, and automatic refunds (refund a cancelled paid order manually in the Razorpay dashboard).

## Testing payments
1. Backend running locally with Razorpay **test** keys in `.env`, then in another terminal:
   `node scripts/test-payment-flow.mjs`
   It checks: order creation and stock reservation, Razorpay order reuse, rejected bad signatures, confirmation via /verify and via the webhook, stock returned on failed payment, COD, and that normal users cannot reach admin data.
2. By hand once, in the browser: add to cart -> checkout -> Razorpay popup -> test card `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1234`/Success. Also test a failed payment and closing the popup.
3. After deploying, run the same script against the server with test keys: `BASE_URL=https://your-domain TEST_EMAIL=... TEST_PASSWORD=... node scripts/test-payment-flow.mjs` (use a real test customer account, not a demo one), then switch to live keys and do one real small payment yourself.

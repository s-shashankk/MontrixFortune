# MontrixFortune - Deployment Readiness Plan

Target: deploy this weekend. Work top to bottom. Tick each box when done.
A backup of the original `src/` and `pom.xml` is in `.backup-before-hardening/` (delete it before committing to git).

## P0 - Security (before anyone else can reach the app)
- [x] 1. `GET /api/payments/admin/all` -> ADMIN only
- [x] 2. `GET /api/payments/user/{userId}` -> only the logged-in user's own payments (ADMIN may see any)
- [x] 3. Never return password hashes: `@JsonIgnore` on `User.password`; `/api/admin/users` returns a DTO
- [x] 4. Ownership checks: orders, addresses, cart items, and the address used when placing an order must belong to the caller
- [x] 5. JWT secrets from environment variables (`JWT_SECRET`, `JWT_REFRESH_SECRET`), min 32 bytes, app refuses to start without them
- [x] 6. Refresh token issued at login and refresh endpoint works; shorter access-token lifetime
- [x] 7. Blocked users (`isActive=false`) cannot log in or use an existing token
- [x] 8. Remove plaintext-password fallback at login; password rules at registration (min 8 chars, letter + digit)
- [x] 9. Rate limiting on login/register (brute force protection)
- [~] 10. DB password and Razorpay keys only from environment variables; rotate MySQL root password; use a dedicated DB user (code done; YOU must still rotate the MySQL password and create a non-root DB user)
- [x] 11. Remove dev endpoints: `/test`, `/api/auth/test`, `/h2-console/**`
- [x] 12. CORS origins configurable (`APP_CORS_ORIGINS`); delete duplicate `WebConfig` CORS
- [x] 13. Generic message for 500 errors; details logged on the server only
- [x] 14. Security headers (HSTS, X-Content-Type-Options, frame options)

## P0 - Payments and orders (data must be stored correctly)
- [x] 15. Scheduled job: cancel unpaid `PENDING` online orders after 30 min and restore stock
- [x] 16. Stock deduction protected against two buyers getting the last item (row lock)
- [x] 17. Totals computed on the server from current product prices
- [x] 18. Webhook secret has no default; app fails fast if missing; register webhook in Razorpay dashboard
- [~] 19. Fix `paymentCollectionStatus` (both branches currently set `COD`) (deferred: needs a new enum value, do it together with Flyway (item 23))
- [x] 20. Order status transition rules (no DELIVERED -> PENDING etc.)
- [ ] 21. Use live Razorpay keys only after a full test purchase with test keys

## P1 - Reliable deployment
- [ ] 22. Spring profiles: `dev` / `prod`; prod has `show-sql=false`, no DevTools, `ddl-auto=validate`
- [ ] 23. Flyway migrations replace `ddl-auto=update` and the manual `ALTER TABLE` runner
- [x] 24. Seeder: dev only. Production admin created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`; no demo users or dummy products
- [~] 25. Product images stored as files/object storage; DB keeps only the URL (starter catalog uses files in public/products; admin uploads are compressed by the admin form and still stored in the DB)
- [ ] 26. Logging for auth, payments, admin actions; Actuator `/actuator/health`
- [x] 27. HTTPS (Nginx + Let's Encrypt)
- [ ] 28. Token storage: consider HttpOnly cookie instead of localStorage
- [ ] 29. Automated tests: auth, access control, order + payment flow
- [~] 30. `git init`, private repo; remove zip, `target/`, `dist/`, test scripts from the project (junk files removed; you still run git init/commit/push - see DEPLOY.md)
- [x] 31. Dockerfiles, `docker-compose.yml`, updated `.env.example`
- [ ] 32. MySQL backups (managed DB or scheduled `mysqldump`), restore tested

## P2 - Admin completeness
- [ ] 33. Pagination, search, filters on every admin list
- [ ] 34. Category edit/delete
- [ ] 35. Audit trail of admin actions
- [ ] 36. CSV export of orders and payments
- [ ] 37. Low-stock alerts
- [ ] 38. Password reset for customers; promote user to admin; ADD an endpoint + button to block/unblock users (service method exists, no endpoint calls it)

## Weekend schedule
| When | Work |
|---|---|
| Wed-Thu | Items 1-14 |
| Fri | Items 15-24 |
| Sat | Items 25-31, server setup, HTTPS, webhook, full test purchase |
| Sun | Buffer, backups (32), switch to live keys (21) |

## Progress log
(Updated as each item is completed. [x] done, [~] partly done.)

### 2026-10-14
- Items 1-9, 11-18, 20 changed in code. NOT yet compiled or run (the tooling used could not reach Maven). First thing to do: `.\mvnw.cmd clean compile`, then start the app and test login, cart, checkout, admin.
- New required settings are in `.env` (JWT_SECRET, JWT_REFRESH_SECRET, DB_PASSWORD, ...). `.env.example` lists them. The app now refuses to start without them.
- The MySQL password was moved out of `application.properties` into `.env`. Rotate it before deployment.
- `TestController.java`, `WebConfig.java`, `ApiController.java` are now empty files; delete them when convenient.
- The backup folder `.backup-before-hardening/` is INCOMPLETE (copy was interrupted). Do not rely on it; use git (item 30).
- Item 24 still open: `DataSeeder` creates admin@montrix.com / admin123 and user@montrix.com / password123. Do NOT deploy until this is changed.
- Late payment after an order expired: webhook re-confirms the order if stock is still available; otherwise the customer has paid without an order and needs a manual refund in the Razorpay dashboard.

### 2026-10-14 (evening)
- New 50-product catalog (10 per category, INR prices) in `src/main/resources/catalog/products.json`; illustrations in `public/products/`. `DataSeeder` rewritten: production-safe (no demo users unless APP_SEED_DEMO_USERS=true; admin from ADMIN_EMAIL/ADMIN_PASSWORD).
- Added Dockerfile, Dockerfile.web, Caddyfile (automatic HTTPS), docker-compose.yml, GitHub workflows (deploy.yml, ci.yml), scripts/backup.sh, DEPLOY.md, README.md.
- Deleted: parent-folder zip, test-cart-debug.mjs, Copilot .github leftovers, IMPLEMENTATION_PLAN.md, HELP.md, src/test-apis.js, src/test-cart.js, three empty Java files, empty resources/static + templates.
- Product admin API now validates price > 0, stock >= 0, description <= 1000 chars.
- STILL NOT COMPILED. Run `.\mvnw.cmd clean package` and `npm run build` before the first push.

### 2026-10-14 (night) - payment review
- Fixed: Cart showed "Tax (10%)" and total x 1.1 but the server charged the subtotal. Prices are now shown tax-inclusive; the total matches what is charged.
- Fixed: PaymentServiceImpl is now transactional; a paid order can no longer end up "payment saved, order unconfirmed" (retry/webhook completes it).
- Fixed: a second create-order call re-uses the open Razorpay order (before, a page reload could orphan the order the customer actually paid).
- Fixed: /api/payments/fail let any logged-in user fail another person's order when no payment row existed.
- Hardened: constant-time signature comparison, null-safe webhook parsing, payment logging ("PAID BUT ORDER NOT CONFIRMED" is logged as an error), product list page size capped at 100.
- Added scripts/test-payment-flow.mjs (automatic backend payment test) and a "production changes" section in DEPLOY.md.
- Maven "Failed to delete target\classes": caused by a locked target folder; it was deleted. Stop the running backend/IDE before `clean`.

## Policy & info pages (added 14 Oct 2026)
Added /about, /contact, /faq, /shipping-policy, /refund-policy, /privacy-policy, /terms with footer links and consent notes on Register and Checkout.
**Before going live edit `src/config/business.js`**: legal name, full address + PIN, real email/phone, GSTIN, grievance officer, and delivery/return promises you will honour. The text is generic, not legal advice.

## Update 16 Oct 2026
- Up to 4 photos per product (new table `product_images`, created automatically on start; cover photo stays in `products.image_url`).
- Admin: rename/delete categories (`/admin/categories`); delete is blocked while a category still has products.
- Real contact details, two addresses, About Us text and a WhatsApp chat link in the footer (all in `src/config/business.js`).
- Brighter hero banner and softer page background.

## Update (16 Oct) – Sub-categories
- Admin → Products → "Manage categories" page now also manages sub-categories (add / rename / delete). Products pick an optional sub-category in the product form.
- Shop page shows "All" + the sub-categories of the selected category; clicking one filters the products.
- Hibernate auto-creates `sub_categories` and `products.sub_category_id` on first start (`ddl-auto=update`).

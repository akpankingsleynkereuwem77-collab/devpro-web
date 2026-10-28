# DevPro Landing Page

A responsive single-page portfolio built with HTML, Tailwind CSS 3, custom CSS, vanilla JavaScript, Node.js, Express, and Nodemailer.

## Requirements

- Node.js 20 or newer (Node.js 18.18+ may also work)
- npm
- SMTP credentials from an email provider for live enquiry delivery

## Quick start

### Windows PowerShell

```powershell
cd devpro-landing-page
npm install
Copy-Item .env.example .env
npm run build:css
npm run dev
```

### macOS / Linux

```bash
cd devpro-landing-page
npm install
cp .env.example .env
npm run build:css
npm run dev
```

Open <http://localhost:3000>. The `dev` script uses Node's watch mode. For a normal production-style start, run `npm start`.

Tailwind is compiled to `public/styles.css`; run `npm run build:css` after changing Tailwind utility classes or the Tailwind input stylesheet. Custom styling is in `src/css/styles.css`.

## Configure real email delivery

1. Create an SMTP credential or app password with a reputable email provider. Provider settings vary; use that provider's official SMTP host, port, and TLS instructions.
2. Edit `.env` locally and set `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_TO`, and `CONTACT_FROM`.
3. Use a sender address authorized by your provider. Keep `.env` private and never commit it.
4. Restart the server and submit a real test enquiry. Check the destination inbox and spam folder.

For most SMTP providers, port 587 uses `EMAIL_SECURE=false` and upgrades using STARTTLS; port 465 commonly uses `EMAIL_SECURE=true`. Follow the provider's own instructions if they differ. Never paste credentials into source code or share them in chat.

Without complete valid SMTP settings, the API deliberately returns HTTP 503 instead of falsely claiming an email was sent. Email delivery has not been verified until a real message arrives.

## API

- `GET /api/health` — basic server health check.
- `POST /api/contact` — JSON contact submission.

Required JSON fields: `name`, `email`, `projectType`, and `message`. Optional fields: `phone`, `budget`, and `companyWebsite` (honeypot; must remain empty). The API validates fields, limits request size, applies a per-IP rate limit, and uses a hidden honeypot. For a public production deployment, consider a CAPTCHA/Turnstile integration and a shared rate-limit store behind multiple server instances. Configure trusted proxy settings carefully if deploying behind a reverse proxy.

## Tests

```bash
npm test
```

The included Node test suite covers server-side contact validation. It does not send emails or replace a full browser end-to-end test. Verify the live API with `curl`, Postman, or the browser developer tools after starting the server.

Example valid request:

```bash
curl -i http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Person","email":"test@example.com","projectType":"Web Development","message":"I need a responsive website for my business."}'
```

If SMTP is not configured, a 503 response is expected and is intentional.

## Visual assets and placeholders

- `public/images/hero.svg` is the local brand icon.
- `public/images/developer.svg` is a custom illustrative developer image.
- Testimonials and `hello@devpro.example` are placeholders. Replace them with accurate business contact details and genuine, permissioned client testimonials before launch.
- The hero code illustration is HTML/CSS, not a screenshot or an interactive code editor.

## Accessibility and design

The page includes semantic sections, skip navigation, keyboard-operable mobile navigation, visible focus states, form labels and errors, live status announcements, scroll-reveal animations, and reduced-motion support. Lucide icons are loaded from a CDN; an internet connection is needed for those icons. The layout and local SVG illustrations work without remote photography.

## Deployment notes

Deploy to a Node-capable host. Set the environment variables in the host's secret manager, run `npm install`, run `npm run build:css`, and start with `npm start`. Use HTTPS, keep dependencies updated, configure monitoring and backups as appropriate, and test SMTP delivery after deployment. Do not commit `.env` or generated credentials. If you use a proxy/load balancer, configure Express's `trust proxy` setting only for the actual trusted proxy topology.

## Manual verification checklist

- [ ] All five navigation links scroll to the correct section.
- [ ] Mobile menu opens, closes by link click and Escape, and reports its expanded state.
- [ ] Layout works at 320px, tablet, laptop, and desktop widths without horizontal overflow.
- [ ] Reveal animations work and reduced-motion preference is respected.
- [ ] Empty/invalid fields show errors and valid form data reaches `POST /api/contact`.
- [ ] API returns 400 for invalid input and 429 after repeated submissions.
- [ ] Without SMTP configuration, API returns 503 rather than a false success.
- [ ] With SMTP configured, a real message arrives and failure paths are checked.
- [ ] Replace sample testimonials, placeholder email, and other brand details before production.

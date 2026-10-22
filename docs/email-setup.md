# Email delivery activation

Implemented but disabled pending a verified provider and a real delivery test.

1. Connect an operator-controlled Resend account. Verify a sending subdomain, suggested `updates.legalaitracker.com`. Add the exact provider-issued SPF/DKIM records to existing DNS without replacing website records. Configure DMARC with the operator. Choose the sender `AI Practice Tracker <alerts@updates.legalaitracker.com>` and an operator-monitored reply address before launch.
2. Set runtime secrets `RESEND_API_KEY` (restricted sending key) and `RESEND_WEBHOOK_SECRET`. Set `EMAIL_FROM`. Keep `EMAIL_ENABLED` absent/false until testing. Do not commit keys. Turn off provider open/click tracking.
3. Configure signed Resend webhooks for email.bounced and email.complained at https://legalaitracker.com/api/mail/webhook. Confirmation and unsubscribe URLs must remain public.
4. Complete operator support contact and provider/privacy disclosures. Set EMAIL_ENABLED=true for a controlled owner opt-in. Test actual receipt, confirmation, matching digest, unsubscribe, bounce/complaint suppression, and SPF/DKIM/DMARC results. Local tests use a mocked provider, not live delivery.
5. Amend the existing morning update workflow to POST /api/mail/run after successful ingestion, using existing Site service authentication. Do not create a duplicate scheduler. Weekly dispatch is Monday Europe/London; daily uses a 20-hour minimum interval. No mail when there are no changes. Never let an agent construct recipient lists or email content itself: the service enforces confirmed subscriptions and stored filters.
6. Check mail_deliveries pending/review rows after each run. Unknown outcomes older than 23 hours require manual reconciliation with the provider; do not blindly resend beyond its 24-hour idempotency window. A provider acceptance is not proof of inbox delivery.

Current scope: one subscription per site identity, using its verified sign-in email; max 20 saved searches; one combined digest per frequency. Up to 30 source summaries per digest; more matches remain in the app. Updates concern records added/changed after confirmation, not the historical import. Paused/deleted searches are excluded from newly prepared digests. A digest already accepted by the provider cannot be recalled.

Beta dispatcher processes up to 500 subscriptions and 50 pending deliveries per invocation; move to a durable paginated queue with provider-aware pacing before larger mailing lists. Delivery payloads may contain recipient addresses and are deleted after 90 days during dispatch; pending/review items require operator resolution. Subscription deletion removes local delivery records. Provider retention is managed separately in the provider account. No marketing or tracking pixels.

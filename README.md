# Island Ledger

A React bookkeeping dashboard for Jamaican small businesses. The interface supports recording income and expenses, creating invoices, reviewing monthly summaries, filtering transactions, and exporting transactions as CSV.

## Features

- Overview dashboard and monthly cash-flow summaries
- Transaction and invoice tracking
- Accounts receivable and accounts payable views
- Editable chart of accounts and balanced multi-line journal posting
- General ledger, income statement, trial balance, balance sheet and cash flow statement
- AR/AP aging with age-based follow-up recommendations
- CSV exports for transactions, journals, ledger and financial statements
- Appwrite email/password sign-up, sign-in, session restore and sign-out

## Development

```sh
npm install
npm run dev
```

Set the Appwrite project configuration in `.env.local` before starting Vite:

```dotenv
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-appwrite-project-id
```

Add the local development and deployed app origins to the Appwrite project's allowed web platforms. Vite client variables are public configuration; never put an Appwrite API key or database password in a `VITE_` variable.

## Production build

```sh
npm run build
npm run preview
```

The production bundle is written to `dist/` and can be deployed to a static web host.

## Data and deployment notes

Appwrite handles authentication and its session cookie; transactions, invoices, accounts and journal entries remain in the current browser's `localStorage`. Bookkeeping records are not synced, backed up remotely, or isolated by Appwrite user. Treat this as a prototype and do not use it as the system of record for financial or tax filings. A production bookkeeping service needs per-business authorization on every data operation, a durable database, backups, access controls, and appropriate privacy and tax review.

CSV exports are generated in the browser. Trial balance and financial statements reflect posted ledger entries; accounts receivable invoices are posted to the ledger unless an income transaction already references that invoice. AP aging is an estimate from expense dates because supplier bills and payment statuses are not yet maintained as separate records.
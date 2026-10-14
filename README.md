# Island Ledger

A React bookkeeping dashboard for Jamaican small businesses. The interface supports recording income and expenses, creating invoices, reviewing monthly summaries, filtering transactions, and exporting transactions as CSV.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The production bundle is written to `dist/` and can be deployed to a static web host.

## Data and deployment notes

This version stores transactions and invoices in the current browser's `localStorage`. Data is not synced between devices, backed up remotely, or protected by user authentication. Treat it as a local demo/prototype; do not use it as the system of record for financial or tax filings. A production bookkeeping service needs an authenticated backend, durable database, backups, access controls, and appropriate privacy and tax review.

CSV exports are generated in the browser from the visible filtered transaction list or the current month's transactions in Reports.
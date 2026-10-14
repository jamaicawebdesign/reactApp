import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpenCheck, CalendarDays, Check, ChevronDown, CircleHelp, ClipboardList, Download, FileCheck2, FileText, Filter, HandCoins, LayoutDashboard, Menu, Plus, Search, Settings2, ShoppingBag, UsersRound, Wallet, X } from 'lucide-react';

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
const relativeDate = (daysAgo) => toDateInputValue(addDays(new Date(), -daysAgo));

const seedTransactions = [
  { id: 1, name: 'Harbour View Café', detail: 'Invoice #INV-024 · GCT included', category: 'Sales', date: relativeDate(0), amount: 48600, type: 'income', method: 'Bank transfer' },
  { id: 2, name: 'Islandwide Wholesale', detail: 'Coffee & pantry stock', category: 'Inventory', date: relativeDate(1), amount: 18350, type: 'expense', method: 'Debit card' },
  { id: 3, name: 'JPS Co.', detail: 'September electricity bill', category: 'Utilities', date: relativeDate(2), amount: 12480, type: 'expense', method: 'Online payment' },
  { id: 4, name: 'Studio North', detail: 'Invoice #INV-023 · Web design', category: 'Sales', date: relativeDate(3), amount: 72500, type: 'income', method: 'Bank transfer' },
  { id: 5, name: 'Caribsource Ltd.', detail: 'Packaging supplies', category: 'Supplies', date: relativeDate(4), amount: 8750, type: 'expense', method: 'Debit card' },
  { id: 6, name: 'Marley & Co.', detail: 'Invoice #INV-022 · Catering', category: 'Sales', date: relativeDate(6), amount: 35900, type: 'income', method: 'Cash' },
];
const seedInvoices = [
  { id: 'INV-024', client: 'Harbour View Café', description: 'Monthly coffee supply', issued: relativeDate(0), due: relativeDate(-14), amount: 48600, status: 'Paid' },
  { id: 'INV-023', client: 'Studio North', description: 'Website design, phase 2', issued: relativeDate(3), due: relativeDate(-11), amount: 72500, status: 'Paid' },
  { id: 'INV-022', client: 'Marley & Co.', description: 'Office catering', issued: relativeDate(6), due: relativeDate(-8), amount: 35900, status: 'Paid' },
  { id: 'INV-021', client: 'Kingston Creative', description: 'Brand identity package', issued: relativeDate(12), due: relativeDate(2), amount: 95000, status: 'Overdue' },
  { id: 'INV-020', client: 'Portland Bay Resort', description: 'Guest welcome hampers', issued: relativeDate(16), due: relativeDate(-4), amount: 64200, status: 'Sent' },
];
const nav = [
  ['Overview', LayoutDashboard], ['Transactions', ArrowDownLeft], ['Invoices', FileText],
  ['Reports', ClipboardList], ['Tax & compliance', FileCheck2], ['Customers', UsersRound],
];
const money = (value) => `J$${Number(value || 0).toLocaleString('en-JM', { maximumFractionDigits: 0 })}`;
const dateLabel = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('en-JM', { day: 'numeric', month: 'short', year: 'numeric' });
const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const readStoredList = (key, fallback, isValidItem) => {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return { value: fallback, error: '' };
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every(isValidItem)) return { value: parsed, error: '' };
    const error = `Saved ${key.replace('island-ledger-', '')} data is invalid and has not been overwritten.`;
    console.error(error);
    return { value: fallback, error };
  } catch (error) {
    console.error(`Unable to read saved data for "${key}".`, error);
    return { value: fallback, error: 'Saved browser data could not be read and has not been overwritten.' };
  }
};
function useStoredList(key, fallback, isValidItem) {
  const [stored, setStored] = useState(() => readStoredList(key, fallback, isValidItem));
  const setValue = (updater) => setStored((current) => ({
    value: typeof updater === 'function' ? updater(current.value) : updater,
    error: '',
  }));
  useEffect(() => {
    if (stored.error) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(stored.value));
    } catch (error) {
      console.error(`Unable to save "${key}" in this browser.`, error);
      const message = 'Changes could not be saved on this device. Check browser storage settings before continuing.';
      setStored((current) => current.error ? current : { ...current, error: message });
    }
  }, [key, stored]);
  return [stored.value, setValue, stored.error];
}
const isTransaction = (item) => item && ((typeof item.id === 'string' && item.id.length > 0)
  || (typeof item.id === 'number' && Number.isSafeInteger(item.id)))
  && typeof item.name === 'string' && typeof item.detail === 'string'
  && item.name.trim().length > 0 && typeof item.category === 'string' && item.category.length > 0 && isValidDate(item.date)
  && typeof item.amount === 'number' && Number.isSafeInteger(item.amount) && item.amount >= 0
  && ['income', 'expense'].includes(item.type) && typeof item.method === 'string' && item.method.length > 0;
const isInvoice = (item) => item && typeof item.id === 'string' && /^INV-\d+$/.test(item.id)
  && typeof item.client === 'string' && item.client.trim().length > 0
  && typeof item.description === 'string' && item.description.trim().length > 0
  && isValidDate(item.issued) && isValidDate(item.due) && item.due >= item.issued
  && typeof item.amount === 'number' && Number.isSafeInteger(item.amount) && item.amount >= 0
  && ['Paid', 'Overdue', 'Sent'].includes(item.status);
const invoiceStatus = (item, today) => item.status === 'Paid' ? 'Paid' : item.status === 'Overdue' || item.due < today ? 'Overdue' : 'Sent';
const descriptions = { Transactions: 'Every dollar in and out, in one clear place.', Invoices: 'Create, send and track what you’re owed.', Reports: 'A clear read on how your business is doing.', 'Tax & compliance': 'Keep an eye on GCT and your business records.', Customers: 'Your clients and their invoicing history.', Settings: 'Your business profile and bookkeeping preferences.' };

export default function App() {
  const [page, setPage] = useState('Overview');
  const [transactions, setTransactions, transactionStorageError] = useStoredList('island-ledger-transactions', seedTransactions, isTransaction);
  const [invoices, setInvoices, invoiceStorageError] = useStoredList('island-ledger-invoices', seedInvoices, isInvoice);
  const [modal, setModal] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const storageError = [transactionStorageError, invoiceStorageError].filter(Boolean).join(' ');
  const today = new Date();
  const todayValue = toDateInputValue(today);
  const monthKey = todayValue.slice(0, 7);
  const periodLabel = today.toLocaleDateString('en-JM', { month: 'long', year: 'numeric' });
  const fullDateLabel = today.toLocaleDateString('en-JM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const month = transactions.filter((item) => item.date.startsWith(monthKey));
  const income = month.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = month.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const outstanding = invoices.filter((item) => invoiceStatus(item, todayValue) !== 'Paid').reduce((sum, item) => sum + Number(item.amount), 0);
  const filtered = transactions.filter((item) => `${item.name} ${item.detail} ${item.category} ${item.method} ${item.date}`.toLowerCase().includes(search.trim().toLowerCase()) && (filter === 'All' || item.type === filter.toLowerCase()));

  function submitTransaction(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const amount = Number(form.get('amount'));
    const date = String(form.get('date'));
    if (!name || !isValidDate(date) || !Number.isSafeInteger(amount) || amount <= 0) return;
    setTransactions((items) => [{
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      detail: String(form.get('detail')).trim() || 'Manual entry',
      category: String(form.get('category')),
      date,
      amount,
      type: String(form.get('type')),
      method: String(form.get('method')),
    }, ...items]);
    setModal('');
  }
  function submitInvoice(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const client = String(form.get('client')).trim();
    const description = String(form.get('description')).trim();
    const issued = String(form.get('issued'));
    const due = String(form.get('due'));
    const amount = Number(form.get('amount'));
    if (!client || !description || !isValidDate(issued) || !isValidDate(due) || due < issued || !Number.isSafeInteger(amount) || amount <= 0) return;
    setInvoices((items) => {
      const highestNumber = items.reduce((highest, item) => {
        const match = /^INV-(\d+)$/.exec(item.id);
        return match ? Math.max(highest, Number(match[1])) : highest;
      }, 0);
      return [{ id: `INV-${String(highestNumber + 1).padStart(3, '0')}`, client, description, issued, due, amount, status: 'Sent' }, ...items];
    });
    setModal('');
  }
  function updateInvoiceStatus(id, status) {
    if (!['Paid', 'Sent', 'Overdue'].includes(status)) return;
    setInvoices((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }
  function exportCsv(items = filtered) {
    const rows = [['Date', 'Name', 'Category', 'Type', 'Payment method', 'Amount (JMD)'], ...items.map((item) => [item.date, item.name, item.category, item.type, item.method, item.amount])];
    const csv = rows.map((row) => row.map((cell) => {
      const value = String(cell);
      const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `island-ledger-transactions-${todayValue}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function changePage(value) { setPage(value); setMenuOpen(false); }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <aside id="app-sidebar" className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
      <a className="brand" href="#overview" onClick={() => changePage('Overview')}><span className="brand-mark"><BookOpenCheck size={21} /></span><span className="brand-name">island<span>ledger</span><small>BOOKKEEPING, MADE CLEAR</small></span></a>
      <div className="business-switch"><span className="business-avatar">M</span><span><strong>Marsha’s Kitchen</strong><small>Kingston, Jamaica</small></span><ChevronDown size={15} /></div>
      <span className="nav-caption">WORKSPACE</span>
      <nav aria-label="Workspace">{nav.map(([label, Icon]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} aria-current={page === label ? 'page' : undefined} onClick={() => changePage(label)}><Icon size={18} /><span>{label}</span>{label === 'Invoices' && <i className="nav-count">{invoices.filter((item) => invoiceStatus(item, todayValue) !== 'Paid').length}</i>}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-note"><span className="note-icon"><HandCoins size={17} /></span><strong>Keep your books tidy</strong><p>Records are stored in this browser. Review your monthly activity regularly.</p><button onClick={() => changePage('Reports')}>View reports <ArrowRight size={14} /></button></div>
      <button className="nav-item settings-link" onClick={() => changePage('Settings')}><Settings2 size={18} /><span>Settings</span></button>
      <div className="profile-row"><span className="profile-avatar">MW</span><span className="profile-text"><strong>Marsha Williams</strong><small>Owner</small></span></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

    <main id="main-content" className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" aria-controls="app-sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Marsha’s Kitchen</span><i>/</i><strong>{page}</strong></div><div className="topbar-actions"><span className="date-chip"><CalendarDays size={15} /> {fullDateLabel}</span><span className="top-avatar" aria-label="Marsha Williams">MW</span></div></header>
      {storageError && <p className="storage-alert" role="alert">{storageError}</p>}
      <div className="page-content">
        <section className="page-heading"><div><p className="eyebrow">{fullDateLabel.toUpperCase()} <i /> KINGSTON, JM</p><h1>{page === 'Overview' ? 'Good morning, Marsha' : page}</h1><p className="heading-copy">{page === 'Overview' ? 'Here’s what’s happening with your business.' : descriptions[page]}</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => setModal('transaction')}><Plus size={16} /> Record transaction</button><button className="button button-primary" onClick={() => setModal('invoice')}><Plus size={16} /> Create invoice</button></div></section>
        {page === 'Overview' && <Overview income={income} expenses={expenses} outstanding={outstanding} transactions={transactions} invoices={invoices} todayValue={todayValue} periodLabel={periodLabel} go={changePage} open={setModal} />}
        {page === 'Transactions' && <Transactions transactions={filtered} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} exportCsv={exportCsv} />}
        {page === 'Invoices' && <Invoices invoices={invoices} todayValue={todayValue} open={() => setModal('invoice')} updateStatus={updateInvoiceStatus} />}
        {page === 'Reports' && <Reports income={income} expenses={expenses} transactions={month} periodLabel={periodLabel} exportCsv={() => exportCsv(month)} />}
        {page === 'Tax & compliance' && <TaxView income={income} expenses={expenses} periodLabel={periodLabel} />}
        {page === 'Customers' && <Customers invoices={invoices} todayValue={todayValue} />}
        {page === 'Settings' && <SettingsView />}
      </div>
      <footer className="page-footer"><span><i /> {storageError ? 'Saving unavailable' : 'Saved on this device'}</span><span>Jamaica · JMD <b>·</b> <button onClick={() => changePage('Tax & compliance')}>Tax settings</button></span></footer>
    </main>
    {modal && <EntryModal type={modal} close={() => setModal('')} submit={modal === 'invoice' ? submitInvoice : submitTransaction} />}
  </div>;
}

function SummaryCard({ label, amount, delta, note, icon: Icon, tone, spark }) {
  return <article className={`summary-card summary-${tone}`}><div className="summary-top"><span>{label}</span><i><Icon size={17} /></i></div><strong className="summary-amount">{amount}</strong><div className="summary-bottom"><b>{delta}</b><span>{note}</span><div className="sparkline">{spark.map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></div></article>;
}

function Overview({ income, expenses, outstanding, transactions, invoices, todayValue, periodLabel, go, open }) {
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const overdue = invoices.filter((item) => invoiceStatus(item, todayValue) === 'Overdue').length;
  const openInvoices = invoices.filter((item) => invoiceStatus(item, todayValue) !== 'Paid').length;
  const now = new Date();
  const currentMonth = toDateInputValue(now).slice(0, 7);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const chartRanges = [[1, 6], [7, 12], [13, 18], [19, 24], [25, 31]];
  const chartData = chartRanges.map(([start, end]) => {
    const bucketEnd = Math.min(end, daysInMonth);
    const entries = transactions.filter((item) => {
      const day = Number(item.date.slice(-2));
      return item.date.startsWith(currentMonth) && day >= start && day <= bucketEnd;
    });
    return {
      label: `${start}–${bucketEnd}`,
      income: entries.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0),
      expenses: entries.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0),
    };
  });
  const chartMax = Math.max(25000, Math.ceil(Math.max(...chartData.flatMap((item) => [item.income, item.expenses])) / 25000) * 25000);
  const chartTicks = [chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, 0];
  const sparkline = (type) => {
    const buckets = Array.from({ length: 8 }, (_, index) => transactions
      .filter((item) => item.date.startsWith(currentMonth)
        && Math.floor((Number(item.date.slice(-2)) - 1) / 4) === index
        && item.type === type)
      .reduce((sum, item) => sum + Number(item.amount), 0));
    const maximum = Math.max(1, ...buckets);
    return buckets.map((value) => Math.max(4, Math.round(value / maximum * 100)));
  };
  return <>
    <section className="summary-grid">
      <SummaryCard label={`Money in · ${periodLabel}`} amount={money(income)} delta="This month" note="recorded income" icon={ArrowDownLeft} tone="green" spark={sparkline('income')} />
      <SummaryCard label={`Money out · ${periodLabel}`} amount={money(expenses)} delta="This month" note="recorded expenses" icon={ArrowUpRight} tone="coral" spark={sparkline('expense')} />
      <SummaryCard label="Still to collect" amount={money(outstanding)} delta={`${overdue} overdue`} note={`from ${openInvoices} open invoices`} icon={Wallet} tone="blue" spark={sparkline('income')} />
      <SummaryCard label={`Net cash flow · ${periodLabel}`} amount={money(income - expenses)} delta={income >= expenses ? 'Positive' : 'Negative'} note="income minus expenses" icon={HandCoins} tone="yellow" spark={sparkline(income >= expenses ? 'income' : 'expense')} />
    </section>
    <section className="content-grid">
      <div className="panel cashflow-panel"><div className="panel-heading"><div><h2>Cash flow</h2><p>Income and expenses over time</p></div><button className="select-button" onClick={() => go('Reports')}>This month <ChevronDown size={14} /></button></div><div className="chart-legend"><span><i className="legend-dot income-dot" /> Money in</span><span><i className="legend-dot expense-dot" /> Money out</span><span className="chart-total">Net <strong>{money(income - expenses)}</strong></span></div><div className="bar-chart"><div className="chart-y-labels">{chartTicks.map((tick) => <span key={tick}>{tick >= 1000 ? `${Math.round(tick / 1000)}k` : tick}</span>)}</div><div className="chart-plot">{[1, 2, 3, 4].map((line) => <i className={`grid-line line-${['one', 'two', 'three', 'four'][line - 1]}`} key={line} />)}{chartData.map(({ label, income: incoming, expenses: outgoing }) => <div className="bar-group" key={label}><div className="bar-pair"><i className={`bar bar-income ${incoming ? '' : 'bar-empty'}`} style={{ height: `${Math.max(incoming / chartMax * 100, 2)}%` }} title={`Income: ${money(incoming)}`} /><i className={`bar bar-expense ${outgoing ? '' : 'bar-empty'}`} style={{ height: `${Math.max(outgoing / chartMax * 100, 2)}%` }} title={`Expenses: ${money(outgoing)}`} /></div><span>{label}</span></div>)}</div></div><div className="chart-footnote"><span>{periodLabel}</span><span>Amounts in JMD</span></div></div>
      <div className="panel quick-panel"><div className="panel-heading"><div><h2>Quick actions</h2><p>Keep your books moving</p></div></div><button className="quick-action" onClick={() => open('invoice')}><i className="quick-icon quick-lime"><FileText size={18} /></i><span><strong>Create an invoice</strong><small>Bill a customer for your work</small></span><ArrowRight size={16} /></button><button className="quick-action" onClick={() => open('transaction')}><i className="quick-icon quick-peach"><Plus size={18} /></i><span><strong>Record a transaction</strong><small>Add income or an expense</small></span><ArrowRight size={16} /></button><button className="quick-action" onClick={() => go('Reports')}><i className="quick-icon quick-blue"><Download size={18} /></i><span><strong>View your reports</strong><small>See a monthly breakdown</small></span><ArrowRight size={16} /></button><div className="gct-reminder"><i><FileCheck2 size={16} /></i><span><strong>GCT tracking</strong><small>15% standard rate · review your status</small></span><button onClick={() => go('Tax & compliance')} aria-label="View tax details"><ArrowRight size={15} /></button></div></div>
    </section>
    <section className="panel transactions-panel"><div className="panel-heading table-heading"><div><h2>Recent transactions</h2><p>Your latest business activity</p></div><button className="text-link" onClick={() => go('Transactions')}>View all <ArrowRight size={15} /></button></div><TransactionTable transactions={recent} /></section>
  </>;
}

function TransactionTable({ transactions }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>PAYMENT METHOD</th><th className="amount-cell">AMOUNT</th></tr></thead><tbody>{transactions.length ? transactions.map((item) => <tr key={item.id}><td><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? <ArrowDownLeft size={15} /> : <ShoppingBag size={14} />}</span><span className="transaction-name"><strong>{item.name}</strong><small>{item.detail}</small></span></td><td><span className="category-pill">{item.category}</span></td><td className="date-cell">{dateLabel(item.date)}</td><td className="method-cell">{item.method}</td><td className={`amount-cell amount-${item.type}`}>{item.type === 'income' ? '+' : '−'}{money(item.amount)}</td></tr>) : <tr><td colSpan="5" className="empty-state">No transactions match that search.</td></tr>}</tbody></table></div>;
}

function Transactions({ transactions, search, setSearch, filter, setFilter, exportCsv }) {
  return <section className="panel full-panel ledger-panel"><div className="ledger-toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" aria-label="Search transactions" /></div><div className="toolbar-right"><label className="filter-select"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter transaction type"><option>All</option><option>Income</option><option>Expense</option></select><ChevronDown size={14} /></label><button className="button button-secondary button-small" onClick={exportCsv}><Download size={15} /> Export CSV</button></div></div><TransactionTable transactions={transactions} /></section>;
}

function Invoices({ invoices, todayValue, open, updateStatus }) {
  const paid = invoices.filter((item) => invoiceStatus(item, todayValue) === 'Paid').length;
  const outstandingInvoices = invoices.filter((item) => invoiceStatus(item, todayValue) !== 'Paid');
  return <><section className="invoice-stats"><div><span>Total invoices</span><strong>{invoices.length}</strong></div><div><span>Paid</span><strong className="stat-green">{paid}</strong></div><div><span>Awaiting payment</span><strong>{invoices.length - paid}</strong></div><div><span>Outstanding</span><strong>{money(outstandingInvoices.reduce((sum, item) => sum + item.amount, 0))}</strong></div></section><section className="panel full-panel invoices-panel"><div className="panel-heading table-heading"><div><h2>All invoices</h2><p>Track what’s been sent and paid</p></div><button className="button button-primary button-small" onClick={open}><Plus size={15} /> New invoice</button></div><div className="table-scroll"><table className="data-table invoice-table"><thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>ISSUED</th><th>DUE DATE</th><th>STATUS</th><th className="amount-cell">AMOUNT</th></tr></thead><tbody>{invoices.length ? invoices.map((item) => { const status = invoiceStatus(item, todayValue); return <tr key={item.id}><td><strong className="invoice-id">{item.id}</strong><small className="invoice-desc">{item.description}</small></td><td>{item.client}</td><td className="date-cell">{dateLabel(item.issued)}</td><td className="date-cell">{dateLabel(item.due)}</td><td><select className={`status-select status-${status.toLowerCase()}`} aria-label={`Status for invoice ${item.id}`} value={status} onChange={(event) => updateStatus(item.id, event.target.value)}><option value="Sent">Sent</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option></select></td><td className="amount-cell">{money(item.amount)}</td></tr>; }) : <tr><td colSpan="6" className="empty-state">No invoices yet. Create an invoice to get started.</td></tr>}</tbody></table></div></section></>;
}

function Reports({ income, expenses, transactions, periodLabel, exportCsv }) {
  const categories = transactions.filter((item) => item.type === 'expense').reduce((totals, item) => ({ ...totals, [item.category]: (totals[item.category] || 0) + item.amount }), {});
  const colors = ['#c9e66b', '#f49c7a', '#81b6d0', '#efcf61', '#b7a4d7'];
  return <><section className="report-overview"><div className="report-intro"><span className="report-icon"><ClipboardList size={20} /></span><div><h2>{periodLabel} at a glance</h2><p>Month-to-date summary · JMD</p></div><button className="button button-secondary button-small" onClick={exportCsv}><Download size={15} /> Export CSV</button></div><div className="report-total-grid"><div><span>Total income</span><strong className="stat-green">{money(income)}</strong></div><div><span>Total expenses</span><strong>{money(expenses)}</strong></div><div><span>Net profit</span><strong>{money(income - expenses)}</strong></div><div><span>Profit margin</span><strong>{income ? `${Math.round(((income - expenses) / income) * 100)}%` : '0%'}</strong></div></div></section><section className="report-lower"><div className="panel category-panel"><div className="panel-heading"><div><h2>Expenses by category</h2><p>{periodLabel} · JMD</p></div></div><div className="category-list">{Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([category, amount], i) => <div className="category-row" key={category}><div className="category-row-label"><i style={{ background: colors[i % colors.length] }} /><strong>{category}</strong><span>{money(amount)}</span></div><div className="category-track"><i style={{ width: `${expenses ? Math.round(amount / expenses * 100) : 0}%`, background: colors[i % colors.length] }} /></div></div>)}{!Object.keys(categories).length && <p className="empty-state">No expenses recorded this month.</p>}</div></div><div className="panel report-note"><span className="note-icon"><BookOpenCheck size={18} /></span><h2>A note on your numbers</h2><p>Reports use the transactions recorded in Island Ledger. Check that your bank activity and receipts have all been entered before using these figures for business decisions or filing.</p><button className="text-link" onClick={() => window.print()}>Print this report <ArrowRight size={15} /></button></div></section></>;
}

function TaxView({ income, expenses, periodLabel }) {
  const estimate = Math.round(income * 0.15 / 1.15);
  return <><section className="tax-banner"><i><FileCheck2 size={23} /></i><div><span>JAMAICA · TAX TRACKING</span><h2>Stay ready for tax time.</h2><p>Keep records organised and check your obligations with Tax Administration Jamaica or a qualified tax professional.</p></div></section><section className="tax-grid"><div className="panel tax-card"><span className="tax-kicker">GENERAL CONSUMPTION TAX</span><h2>GCT overview</h2><p className="tax-description">The standard GCT rate is 15%. Whether you need to register or charge GCT depends on your business and taxable activity.</p><div className="tax-metric"><span>Standard rate</span><strong>15%</strong></div><div className="tax-metric"><span>{periodLabel} sales recorded</span><strong>{money(income)}</strong></div><div className="tax-metric"><span>Illustrative GCT portion*</span><strong>{money(estimate)}</strong></div><p className="fine-print">*Illustration only, assuming all recorded sales include standard-rate GCT. Not a tax calculation or filing figure.</p></div><div className="panel tax-card"><span className="tax-kicker">RECORD KEEPING</span><h2>Your books this month</h2><p className="tax-description">A few good habits make year-end reporting much easier.</p><div className="checklist-row"><i><Check size={14} /></i><span><strong>Income recorded</strong><small>Sales and other receipts entered</small></span></div><div className="checklist-row"><i><Check size={14} /></i><span><strong>Expenses recorded</strong><small>{money(expenses)} entered this month</small></span></div><div className="checklist-row"><i className="check-pending"><CalendarDays size={14} /></i><span><strong>Reconcile your bank account</strong><small>Compare entries against your statement</small></span></div><a className="tax-external" href="https://www.jamaicatax.gov.jm/" target="_blank" rel="noreferrer">Visit Tax Administration Jamaica <ArrowRight size={15} /></a></div></section></>;
}

function Customers({ invoices, todayValue }) {
  const names = [...new Set(invoices.map((item) => item.client))];
  return <section className="panel full-panel customer-panel"><div className="panel-heading table-heading"><div><h2>Your customers</h2><p>Customer activity from your invoices</p></div><span className="customer-total"><UsersRound size={16} /> {names.length} customers</span></div><div className="customer-list">{names.map((name) => { const records = invoices.filter((item) => item.client === name); const latest = records[0]; const status = invoiceStatus(latest, todayValue); return <article className="customer-row" key={name}><span className="customer-avatar">{name.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><span className="customer-info"><strong>{name}</strong><small>{records.length} invoice{records.length === 1 ? '' : 's'} · Last activity {dateLabel(latest.issued)}</small></span><span className="customer-spend">{money(records.reduce((sum, item) => sum + item.amount, 0))}<small>invoiced</small></span><span className={`status-pill status-${status.toLowerCase()}`}><i />{status}</span></article>; })}</div></section>;
}

function SettingsView() {
  return <section className="panel settings-panel"><span className="settings-icon"><Settings2 size={20} /></span><h2>Business profile</h2><p>These details help keep your books organised for your business in Jamaica.</p><div className="settings-fields"><label>Business name<input value="Marsha’s Kitchen" readOnly /></label><label>Business location<input value="Kingston, Jamaica" readOnly /></label><label>Currency<input value="Jamaican Dollar (JMD)" readOnly /></label><label>Tax reference number (TRN)<input value="Add your TRN in business settings" readOnly /></label></div><div className="settings-callout"><CircleHelp size={17} /><span>For account and business profile changes, contact your workspace administrator.</span></div></section>;
}

function EntryModal({ type, close, submit }) {
  const invoice = type === 'invoice';
  const [issuedDate, setIssuedDate] = useState(() => toDateInputValue(new Date()));
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="modal-kicker">{invoice ? 'CUSTOMER BILLING' : 'BOOKKEEPING'}</span><h2 id="modal-title">{invoice ? 'Create an invoice' : 'Record a transaction'}</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={19} /></button></div><form className="entry-form" onSubmit={submit}>
    {invoice ? <><label>Customer name<input name="client" placeholder="e.g. Kingston Creative" required autoFocus /></label><label>Invoice description<input name="description" placeholder="What are you billing for?" required /></label><div className="form-grid"><label>Amount (JMD)<input name="amount" type="number" min="1" step="1" placeholder="0" required /></label><label>Issue date<input name="issued" type="date" value={issuedDate} onChange={(event) => setIssuedDate(event.target.value)} required /></label></div><label>Due date<input name="due" type="date" min={issuedDate} defaultValue={toDateInputValue(addDays(new Date(), 14))} required /></label></> : <><label>Description<input name="name" placeholder="e.g. Client payment or supplier" required autoFocus /></label><label>Notes<input name="detail" placeholder="Add a short note (optional)" /></label><div className="form-grid"><label>Type<select name="type"><option value="income">Money in · income</option><option value="expense">Money out · expense</option></select></label><label>Category<select name="category">{['Sales', 'Inventory', 'Supplies', 'Utilities', 'Transport', 'Rent', 'Payroll', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="form-grid"><label>Amount (JMD)<input name="amount" type="number" min="1" step="1" placeholder="0" required /></label><label>Date<input name="date" type="date" defaultValue={toDateInputValue(new Date())} required /></label></div><label>Payment method<select name="method">{['Bank transfer', 'Debit card', 'Cash', 'Online payment', 'Cheque', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label></>}
    <div className="modal-actions"><button type="button" className="button button-secondary" onClick={close}>Cancel</button><button type="submit" className="button button-primary">{invoice ? <><FileText size={15} /> Save invoice</> : <><Check size={15} /> Save transaction</>}</button></div>
  </form></section></div>;
}
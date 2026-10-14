import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, BookOpenCheck, CalendarDays, Check, ChevronDown, CircleHelp, ClipboardList, Download, FileCheck2, FileText, Filter, HandCoins, LayoutDashboard, LogIn, LogOut, Menu, Plus, Search, Settings2, ShoppingBag, UserPlus, UsersRound, Wallet, X } from 'lucide-react';
import { ID } from 'appwrite';
import { account, appwriteConfigurationError } from './appwrite.js';

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
const seedAccounts = [
  { id: '1000', name: 'Cash & bank', type: 'Asset' },
  { id: '1100', name: 'Accounts receivable', type: 'Asset' },
  { id: '2000', name: 'Accounts payable', type: 'Liability' },
  { id: '3000', name: "Owner's equity", type: 'Equity' },
  { id: '4000', name: 'Sales revenue', type: 'Revenue' },
  { id: '5000', name: 'Cost of goods sold', type: 'Expense', category: 'Inventory' },
  { id: '5100', name: 'Utilities expense', type: 'Expense', category: 'Utilities' },
  { id: '5200', name: 'Supplies expense', type: 'Expense', category: 'Supplies' },
  { id: '5900', name: 'Other operating expenses', type: 'Expense' },
];
const nav = [
  ['Overview', LayoutDashboard], ['Transactions', ArrowDownLeft], ['Invoices', FileText],
  ['Accounts receivable', Wallet], ['Accounts payable', ShoppingBag], ['General ledger', BookOpenCheck], ['General journal', BookOpenCheck], ['Chart of accounts', BookOpenCheck],
  ['Income statement', ClipboardList], ['Trial balance', FileCheck2], ['Balance sheet', Wallet], ['Cash flow statement', ArrowDownLeft],
  ['AR aging', Wallet], ['AP aging', ShoppingBag], ['Reports', ClipboardList], ['Tax & compliance', FileCheck2], ['Customers', UsersRound],
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
  && ['Paid', 'Overdue', 'Sent'].includes(item.status)
  && (item.paidDate === undefined || isValidDate(item.paidDate));
const isAccount = (item) => item && typeof item.id === 'string' && /^\d{4,6}$/.test(item.id)
  && typeof item.name === 'string' && item.name.trim().length > 0
  && ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].includes(item.type)
  && (item.category === undefined || typeof item.category === 'string');
const isJournalEntry = (item) => item && typeof item.id === 'string' && item.id.length > 0
  && typeof item.reference === 'string' && typeof item.description === 'string' && item.description.trim().length > 0
  && isValidDate(item.date) && Array.isArray(item.lines) && item.lines.length >= 2
  && item.lines.every((line) => line && typeof line.accountId === 'string'
    && Number.isSafeInteger(line.debit) && line.debit >= 0
    && Number.isSafeInteger(line.credit) && line.credit >= 0
    && (line.debit > 0 || line.credit > 0) && !(line.debit > 0 && line.credit > 0))
  && item.lines.reduce((sum, line) => sum + line.debit, 0) === item.lines.reduce((sum, line) => sum + line.credit, 0);
const invoiceStatus = (item, today) => item.status === 'Paid' ? 'Paid' : item.status === 'Overdue' || item.due < today ? 'Overdue' : 'Sent';
const accountForExpense = (category) => ({
  Inventory: '5000',
  Utilities: '5100',
  Supplies: '5200',
})[category] || '5900';
function getJournalLines(transactions, journalEntries, invoices, todayValue) {
  const lines = transactions.flatMap((item) => {
    const reference = `TX-${item.id}`;
    if (item.type === 'income') {
      return [
        { date: item.date, reference, description: item.name, accountId: '1000', debit: item.amount, credit: 0 },
        { date: item.date, reference, description: item.name, accountId: '4000', debit: 0, credit: item.amount },
      ];
    }
    return [
      { date: item.date, reference, description: item.name, accountId: accountForExpense(item.category), debit: item.amount, credit: 0 },
      { date: item.date, reference, description: item.name, accountId: '1000', debit: 0, credit: item.amount },
    ];
  });
  journalEntries.forEach((entry) => {
    entry.lines.forEach((line) => lines.push({
      date: entry.date,
      reference: entry.reference,
      description: entry.description,
      accountId: line.accountId,
      debit: line.debit,
      credit: line.credit,
    }));
  });
  invoices.forEach((invoice) => {
    const alreadyRecordedAsCashSale = transactions.some((transaction) => transaction.detail.includes(invoice.id));
    if (alreadyRecordedAsCashSale) return;
    const invoiceReference = `INV-${invoice.id}`;
    lines.push(
      { date: invoice.issued, reference: invoiceReference, description: `${invoice.client} invoice ${invoice.id}`, accountId: '1100', debit: invoice.amount, credit: 0 },
      { date: invoice.issued, reference: invoiceReference, description: `${invoice.client} invoice ${invoice.id}`, accountId: '4000', debit: 0, credit: invoice.amount },
    );
    if (invoice.status === 'Paid') {
      const paidDate = invoice.paidDate || todayValue;
      lines.push(
        { date: paidDate, reference: `PAY-${invoice.id}`, description: `Payment received for ${invoice.id}`, accountId: '1000', debit: invoice.amount, credit: 0 },
        { date: paidDate, reference: `PAY-${invoice.id}`, description: `Payment received for ${invoice.id}`, accountId: '1100', debit: 0, credit: invoice.amount },
      );
    }
  });
  return lines.sort((a, b) => a.date.localeCompare(b.date) || a.reference.localeCompare(b.reference));
}
function getAccountBalances(accounts, journalLines) {
  return accounts.map((account) => {
    const lines = journalLines.filter((line) => line.accountId === account.id);
    const debit = lines.reduce((sum, line) => sum + line.debit, 0);
    const credit = lines.reduce((sum, line) => sum + line.credit, 0);
    const debitNormal = ['Asset', 'Expense'].includes(account.type);
    return { ...account, debit, credit, balance: debitNormal ? debit - credit : credit - debit };
  });
}
const descriptions = {
  Transactions: 'Every dollar in and out, in one clear place.',
  Invoices: 'Create, send and track what you’re owed.',
  'Accounts receivable': 'Review customer balances and due dates in one place.',
  'Accounts payable': 'Track supplier balances and payment obligations.',
  'General ledger': 'Follow account activity and ending balances across the books.',
  'General journal': 'Review the double-entry journal postings behind each balance.',
  'Chart of accounts': 'Manage the accounts used to classify journal entries.',
  'Income statement': 'Measure revenue, expenses and net profit for the period.',
  'Trial balance': 'Check whether debits and credits are in agreement before final reporting.',
  'Balance sheet': 'Review assets, liabilities and equity at a point in time.',
  'Cash flow statement': 'See how cash moved through operations, investing and financing.',
  'AR aging': 'Break receivables into current and overdue buckets by age.',
  'AP aging': 'Review supplier liabilities by age and urgency.',
  Reports: 'A clear read on how your business is doing.',
  'Tax & compliance': 'Keep an eye on GCT and your business records.',
  Customers: 'Your clients and their invoicing history.',
  Settings: 'Your business profile and bookkeeping preferences.',
};

export default function App() {
  const [authState, setAuthState] = useState({ user: null, loading: true });
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('sign-in');
  const [signOutError, setSignOutError] = useState('');
  const [page, setPage] = useState('Overview');
  const [transactions, setTransactions, transactionStorageError] = useStoredList('island-ledger-transactions', seedTransactions, isTransaction);
  const [invoices, setInvoices, invoiceStorageError] = useStoredList('island-ledger-invoices', seedInvoices, isInvoice);
  const [accounts, setAccounts, accountStorageError] = useStoredList('island-ledger-accounts', seedAccounts, isAccount);
  const [journalEntries, setJournalEntries, journalStorageError] = useStoredList('island-ledger-journal', [], isJournalEntry);
  const [modal, setModal] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const storageError = [transactionStorageError, invoiceStorageError, accountStorageError, journalStorageError].filter(Boolean).join(' ');
  const today = new Date();
  const todayValue = toDateInputValue(today);
  const monthKey = todayValue.slice(0, 7);
  const periodLabel = today.toLocaleDateString('en-JM', { month: 'long', year: 'numeric' });
  const fullDateLabel = today.toLocaleDateString('en-JM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const currentUser = authState.user;

  useEffect(() => {
    let active = true;
    if (!account) {
      setAuthState({ user: null, loading: false });
      return () => { active = false; };
    }
    account.get()
      .then((user) => {
        if (active) setAuthState({ user, loading: false });
      })
      .catch((error) => {
        console.error('Unable to restore the Appwrite session.', error);
        const noActiveSession = error && typeof error === 'object' && 'code' in error && error.code === 401;
        if (active) setAuthState({
          user: null,
          loading: false,
          error: noActiveSession ? '' : 'Could not verify your Appwrite session. Check your connection and sign in again.',
        });
      });
    return () => { active = false; };
  }, []);
  const month = transactions.filter((item) => item.date.startsWith(monthKey));
  const income = month.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
  const expenses = month.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
  const outstanding = invoices.filter((item) => invoiceStatus(item, todayValue) !== 'Paid').reduce((sum, item) => sum + Number(item.amount), 0);
  const filtered = transactions.filter((item) => `${item.name} ${item.detail} ${item.category} ${item.method} ${item.date}`.toLowerCase().includes(search.trim().toLowerCase()) && (filter === 'All' || item.type === filter.toLowerCase()));
  const journalLines = getJournalLines(transactions, journalEntries, invoices, todayValue);
  const accountBalances = getAccountBalances(accounts, journalLines);

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
    setInvoices((items) => items.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, status };
      if (status === 'Paid') updated.paidDate = todayValue;
      else delete updated.paidDate;
      return updated;
    }));
  }
  function submitJournalEntry(entry) {
    if (!isJournalEntry(entry) || entry.lines.some((line) => !accounts.some((account) => account.id === line.accountId))) {
      console.error('Journal entry rejected: valid accounts and balanced debit and credit lines are required.');
      return false;
    }
    setJournalEntries((items) => [entry, ...items]);
    return true;
  }
  function addAccount(account) {
    if (!isAccount(account) || accounts.some((item) => item.id === account.id || item.name.toLowerCase() === account.name.toLowerCase())) {
      console.error('Account rejected: code and name must be unique and valid.');
      return false;
    }
    setAccounts((items) => [...items, account].sort((a, b) => a.id.localeCompare(b.id)));
    return true;
  }
  function downloadCsv(filename, rows) {
    const csv = rows.map((row) => row.map((cell) => {
      const value = String(cell ?? '');
      const safeValue = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function exportCsv(items = filtered) {
    const rows = [['Date', 'Name', 'Category', 'Type', 'Payment method', 'Amount (JMD)'], ...items.map((item) => [item.date, item.name, item.category, item.type, item.method, item.amount])];
    downloadCsv(`island-ledger-transactions-${todayValue}.csv`, rows);
  }
  function changePage(value) { setPage(value); setMenuOpen(false); }

  async function handleAuthentication(event) {
    event.preventDefault();
    setAuthError('');
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const confirmation = String(form.get('confirm-password') || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setAuthError('Use a password with at least 8 characters.');
      return;
    }
    if (!account) {
      setAuthError(appwriteConfigurationError);
      return;
    }
    try {
      let user;
      if (authMode === 'sign-up') {
        if (name.length < 2) {
          setAuthError('Enter your name to create an account.');
          return;
        }
        if (password !== confirmation) {
          setAuthError('The passwords do not match.');
          return;
        }
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        user = await account.get();
      } else {
        await account.createEmailPasswordSession(email, password);
        user = await account.get();
      }
      setAuthState({ user, loading: false });
      setPage('Overview');
      setAuthError('');
      setSignOutError('');
    } catch (error) {
      console.error('Authentication could not be completed.', error);
      setAuthError(error instanceof Error ? error.message : 'Appwrite could not complete the authentication request.');
    }
  }

  async function signOut() {
    if (!account) return;
    try {
      await account.deleteSession('current');
      setAuthState({ user: null, loading: false });
      setAuthMode('sign-in');
      setPage('Overview');
      setSignOutError('');
    } catch (error) {
      console.error('Unable to end the Appwrite session.', error);
      setSignOutError(error instanceof Error ? error.message : 'Appwrite could not sign you out.');
    }
  }

  if (authState.loading) {
    return <main className="auth-screen"><p className="auth-loading">Checking your Appwrite session…</p></main>;
  }

  if (!currentUser) {
    return <AuthScreen mode={authMode} setMode={(mode) => { setAuthMode(mode); setAuthError(''); }} error={authError || authState.error} configurationError={appwriteConfigurationError} onSubmit={handleAuthentication} />;
  }

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
      <div className="profile-row"><span className="profile-avatar">{userInitials(currentUser.name)}</span><span className="profile-text"><strong>{currentUser.name}</strong><small>{currentUser.email}</small></span></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

    <main id="main-content" className="main-area">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" aria-controls="app-sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Marsha’s Kitchen</span><i>/</i><strong>{page}</strong></div><div className="topbar-actions"><span className="date-chip"><CalendarDays size={15} /> {fullDateLabel}</span><span className="top-avatar" aria-label={currentUser.name}>{userInitials(currentUser.name)}</span><button className="button button-secondary button-small sign-out-button" onClick={signOut}><LogOut size={15} /> Sign out</button></div></header>
      {storageError && <p className="storage-alert" role="alert">{storageError}</p>}
      {signOutError && <p className="storage-alert" role="alert">{signOutError}</p>}
      <p className="auth-prototype-notice">Authentication is handled by Appwrite. Bookkeeping records still live in this browser and are not separated by Appwrite account.</p>
      <div className="page-content">
        <section className="page-heading"><div><p className="eyebrow">{fullDateLabel.toUpperCase()} <i /> KINGSTON, JM</p><h1>{page === 'Overview' ? `Good morning, ${currentUser.name.split(' ')[0]}` : page}</h1><p className="heading-copy">{page === 'Overview' ? 'Here’s what’s happening with your business.' : descriptions[page]}</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => setModal('transaction')}><Plus size={16} /> Record transaction</button><button className="button button-primary" onClick={() => setModal('invoice')}><Plus size={16} /> Create invoice</button></div></section>
        {page === 'Overview' && <Overview income={income} expenses={expenses} outstanding={outstanding} transactions={transactions} invoices={invoices} todayValue={todayValue} periodLabel={periodLabel} go={changePage} open={setModal} />}
        {page === 'Transactions' && <Transactions transactions={filtered} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} exportCsv={exportCsv} />}
        {page === 'Invoices' && <Invoices invoices={invoices} todayValue={todayValue} open={() => setModal('invoice')} updateStatus={updateInvoiceStatus} />}
        {page === 'Accounts receivable' && <AccountsReceivableView invoices={invoices} todayValue={todayValue} />}
        {page === 'Accounts payable' && <AccountsPayableView transactions={transactions} />}
        {page === 'General ledger' && <GeneralLedgerView accounts={accounts} journalLines={journalLines} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'General journal' && <GeneralJournalView accounts={accounts} journalEntries={journalEntries} onPost={submitJournalEntry} journalLines={journalLines} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'Chart of accounts' && <ChartOfAccountsView accounts={accounts} accountBalances={accountBalances} onAdd={addAccount} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'Income statement' && <IncomeStatementView accountBalances={accountBalances} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'Trial balance' && <TrialBalanceView accountBalances={accountBalances} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'Balance sheet' && <BalanceSheetView accountBalances={accountBalances} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'Cash flow statement' && <CashFlowStatementView journalLines={journalLines} exportCsv={downloadCsv} todayValue={todayValue} />}
        {page === 'AR aging' && <AgingAnalysisView invoices={invoices} transactions={transactions} type="AR" todayValue={todayValue} />}
        {page === 'AP aging' && <AgingAnalysisView transactions={transactions} type="AP" todayValue={todayValue} />}
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

function userInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}

function AuthScreen({ mode, setMode, error, configurationError, onSubmit }) {
  const isSignUp = mode === 'sign-up';
  return <main className="auth-screen">
    <section className="auth-card">
      <a className="brand auth-brand" href="#signin"><span className="brand-mark"><BookOpenCheck size={21} /></span><span className="brand-name">island<span>ledger</span><small>BOOKKEEPING, MADE CLEAR</small></span></a>
      <div className="auth-heading">
        <span className="auth-icon">{isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}</span>
        <h1>{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p>{isSignUp ? 'Set up your local Island Ledger demo account.' : 'Sign in to continue to your bookkeeping workspace.'}</p>
      </div>
      {configurationError && <p className="form-error" role="alert">{configurationError}</p>}
      <form className="entry-form auth-form" onSubmit={onSubmit}>
        {isSignUp && <label>Your name<input name="name" type="text" autoComplete="name" minLength="2" required placeholder="e.g. Marsha Williams" /></label>}
        <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        <label>Password<input name="password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength="8" required placeholder="At least 8 characters" /></label>
        {isSignUp && <label>Confirm password<input name="confirm-password" type="password" autoComplete="new-password" minLength="8" required placeholder="Enter your password again" /></label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary auth-submit" type="submit" disabled={Boolean(configurationError)}>{isSignUp ? <><UserPlus size={16} /> Create account</> : <><LogIn size={16} /> Sign in</>}</button>
      </form>
      <p className="auth-switch">{isSignUp ? 'Already have an account?' : 'New to Island Ledger?'} <button type="button" onClick={() => setMode(isSignUp ? 'sign-in' : 'sign-up')}>{isSignUp ? 'Sign in' : 'Create an account'}</button></p>
      <p className="auth-disclaimer">Appwrite secures authentication. Bookkeeping data in this prototype remains local to this browser and is not isolated by account.</p>
    </section>
  </main>;
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

function AccountsReceivableView({ invoices, todayValue }) {
  const receivables = [...invoices]
    .filter((item) => invoiceStatus(item, todayValue) !== 'Paid')
    .sort((a, b) => a.due.localeCompare(b.due));
  const total = receivables.reduce((sum, item) => sum + Number(item.amount), 0);
  const overdue = receivables.filter((item) => invoiceStatus(item, todayValue) === 'Overdue').length;

  return <><section className="invoice-stats"><div><span>Total receivables</span><strong>{money(total)}</strong></div><div><span>Open invoices</span><strong>{receivables.length}</strong></div><div><span>Overdue</span><strong>{overdue}</strong></div><div><span>Average balance</span><strong>{receivables.length ? money(total / receivables.length) : money(0)}</strong></div></section><section className="panel full-panel invoices-panel"><div className="panel-heading table-heading"><div><h2>Accounts receivable</h2><p>Customer balances due from sales</p></div></div><div className="table-scroll"><table className="data-table invoice-table"><thead><tr><th>CUSTOMER</th><th>INVOICE</th><th>DUE DATE</th><th>STATUS</th><th className="amount-cell">AMOUNT</th></tr></thead><tbody>{receivables.length ? receivables.map((item) => { const status = invoiceStatus(item, todayValue); return <tr key={item.id}><td>{item.client}</td><td><strong className="invoice-id">{item.id}</strong><small className="invoice-desc">{item.description}</small></td><td className="date-cell">{dateLabel(item.due)}</td><td><span className={`status-pill status-${status.toLowerCase()}`}><i />{status}</span></td><td className="amount-cell">{money(item.amount)}</td></tr>; }) : <tr><td colSpan="5" className="empty-state">No receivables right now.</td></tr>}</tbody></table></div></section></>;
}

function AccountsPayableView({ transactions }) {
  const payables = [...transactions]
    .filter((item) => item.type === 'expense')
    .map((item, index) => ({
      id: `AP-${String(index + 1).padStart(3, '0')}`,
      vendor: item.name,
      category: item.category,
      due: toDateInputValue(addDays(new Date(item.date), 14)),
      amount: item.amount,
      status: 'Due',
    }))
    .sort((a, b) => a.due.localeCompare(b.due));
  const total = payables.reduce((sum, item) => sum + Number(item.amount), 0);

  return <><section className="invoice-stats"><div><span>Total payables</span><strong>{money(total)}</strong></div><div><span>Suppliers</span><strong>{payables.length}</strong></div><div><span>Due soon</span><strong>{payables.filter((item) => new Date(`${item.due}T12:00:00`) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}</strong></div><div><span>Average balance</span><strong>{payables.length ? money(total / payables.length) : money(0)}</strong></div></section><section className="panel full-panel invoices-panel"><div className="panel-heading table-heading"><div><h2>Accounts payable</h2><p>Supplier balances due in the next cycle</p></div></div><div className="table-scroll"><table className="data-table invoice-table"><thead><tr><th>SUPPLIER</th><th>CATEGORY</th><th>DUE DATE</th><th>STATUS</th><th className="amount-cell">AMOUNT</th></tr></thead><tbody>{payables.length ? payables.map((item) => <tr key={item.id}><td>{item.vendor}</td><td><span className="category-pill">{item.category}</span></td><td className="date-cell">{dateLabel(item.due)}</td><td><span className="status-pill status-sent"><i />{item.status}</span></td><td className="amount-cell">{money(item.amount)}</td></tr>) : <tr><td colSpan="5" className="empty-state">No supplier obligations recorded.</td></tr>}</tbody></table></div></section></>;
}

function GeneralLedgerView({ accounts, journalLines, exportCsv, todayValue }) {
  const accountNames = new Map(accounts.map((account) => [account.id, `${account.id} · ${account.name}`]));
  const normalDebit = new Set(accounts.filter((account) => ['Asset', 'Expense'].includes(account.type)).map((account) => account.id));
  const running = new Map();
  const rows = journalLines.map((line, index) => {
    const signed = normalDebit.has(line.accountId) ? line.debit - line.credit : line.credit - line.debit;
    const balance = (running.get(line.accountId) || 0) + signed;
    running.set(line.accountId, balance);
    return { ...line, balance, rowId: `${line.reference}-${line.accountId}-${index}` };
  });
  const exportRows = [
    ['Date', 'Reference', 'Account', 'Description', 'Debit (JMD)', 'Credit (JMD)', 'Running balance (JMD)'],
    ...rows.map((row) => [row.date, row.reference, accountNames.get(row.accountId) || row.accountId, row.description, row.debit, row.credit, row.balance]),
  ];

  return <section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>General ledger</h2><p>Account activity with running balances · JMD</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-general-ledger-${todayValue}.csv`, exportRows)}><Download size={15} /> Export CSV</button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>DATE</th><th>REFERENCE</th><th>ACCOUNT</th><th>DESCRIPTION</th><th>DEBIT</th><th>CREDIT</th><th>BALANCE</th></tr></thead><tbody>{rows.length ? rows.map((entry) => <tr key={entry.rowId}><td className="date-cell">{dateLabel(entry.date)}</td><td>{entry.reference}</td><td>{accountNames.get(entry.accountId) || entry.accountId}</td><td>{entry.description}</td><td className="amount-cell">{entry.debit ? money(entry.debit) : '—'}</td><td className="amount-cell">{entry.credit ? money(entry.credit) : '—'}</td><td className="amount-cell">{money(entry.balance)}</td></tr>) : <tr><td colSpan="7" className="empty-state">No ledger entries available.</td></tr>}</tbody></table></div></section>;
}

function IncomeStatementView({ accountBalances, exportCsv, todayValue }) {
  const rows = accountBalances.filter((account) => ['Revenue', 'Expense'].includes(account.type) && account.balance !== 0);
  const revenue = rows.filter((account) => account.type === 'Revenue').reduce((sum, account) => sum + account.balance, 0);
  const expenses = rows.filter((account) => account.type === 'Expense').reduce((sum, account) => sum + account.balance, 0);
  const netIncome = revenue - expenses;
  const csv = [['Code', 'Account', 'Type', 'Balance (JMD)'], ...rows.map((account) => [account.id, account.name, account.type, account.balance]), ['TOTAL REVENUE', '', '', revenue], ['TOTAL EXPENSES', '', '', expenses], ['NET INCOME', '', '', netIncome]];

  return <><section className="report-overview"><div className="report-intro"><span className="report-icon"><ClipboardList size={20} /></span><div><h2>Income statement</h2><p>Revenue, expenses and net result · JMD</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-income-statement-${todayValue}.csv`, csv)}><Download size={15} /> Export CSV</button></div><div className="report-total-grid"><div><span>Total revenue</span><strong className="stat-green">{money(revenue)}</strong></div><div><span>Operating expenses</span><strong>{money(expenses)}</strong></div><div><span>Net income</span><strong>{money(netIncome)}</strong></div><div><span>Profit margin</span><strong>{revenue ? `${Math.round(netIncome / revenue * 100)}%` : '0%'}</strong></div></div></section><section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>Income and expenses by account</h2><p>Balances from recorded transactions and journal entries</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>CODE</th><th>ACCOUNT</th><th>TYPE</th><th>AMOUNT</th></tr></thead><tbody>{rows.length ? rows.map((account) => <tr key={account.id}><td>{account.id}</td><td>{account.name}</td><td>{account.type}</td><td className="amount-cell">{money(account.balance)}</td></tr>) : <tr><td colSpan="4" className="empty-state">No income or expense balances recorded.</td></tr>}</tbody></table></div></section></>;
}

function TrialBalanceView({ accountBalances, exportCsv, todayValue }) {
  const rows = accountBalances.map((account) => {
    const debitNormal = ['Asset', 'Expense'].includes(account.type);
    const debit = debitNormal ? Math.max(0, account.balance) : Math.max(0, -account.balance);
    const credit = debitNormal ? Math.max(0, -account.balance) : Math.max(0, account.balance);
    return { ...account, debit, credit };
  });
  const totalDebit = rows.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = rows.reduce((sum, row) => sum + row.credit, 0);
  const balanced = totalDebit === totalCredit;
  const csv = [['Code', 'Account', 'Type', 'Debit (JMD)', 'Credit (JMD)'], ...rows.map((row) => [row.id, row.name, row.type, row.debit, row.credit]), ['TOTAL', '', '', totalDebit, totalCredit]];

  return <section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>Trial balance</h2><p>Account balances from posted entries · {balanced ? 'Debits and credits agree' : 'Out of balance'}</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-trial-balance-${todayValue}.csv`, csv)}><Download size={15} /> Export CSV</button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>CODE</th><th>ACCOUNT</th><th>TYPE</th><th>DEBIT</th><th>CREDIT</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.name}</td><td>{row.type}</td><td className="amount-cell">{row.debit ? money(row.debit) : '—'}</td><td className="amount-cell">{row.credit ? money(row.credit) : '—'}</td></tr>)}<tr className="summary-row"><td colSpan="3"><strong>Total</strong></td><td className="amount-cell"><strong>{money(totalDebit)}</strong></td><td className="amount-cell"><strong>{money(totalCredit)}</strong></td></tr></tbody></table></div></section>;
}

function BalanceSheetView({ accountBalances, exportCsv, todayValue }) {
  const rows = accountBalances.filter((account) => ['Asset', 'Liability', 'Equity'].includes(account.type) && account.balance !== 0);
  const revenue = accountBalances.filter((account) => account.type === 'Revenue').reduce((sum, account) => sum + account.balance, 0);
  const expenses = accountBalances.filter((account) => account.type === 'Expense').reduce((sum, account) => sum + account.balance, 0);
  const currentEarnings = revenue - expenses;
  const assets = rows.filter((account) => account.type === 'Asset').reduce((sum, account) => sum + account.balance, 0);
  const liabilities = rows.filter((account) => account.type === 'Liability').reduce((sum, account) => sum + account.balance, 0);
  const equity = rows.filter((account) => account.type === 'Equity').reduce((sum, account) => sum + account.balance, 0) + currentEarnings;
  const statementRows = [
    ['SECTION', 'CODE', 'ACCOUNT', 'AMOUNT (JMD)'],
    ...rows.map((account) => [account.type, account.id, account.name, account.balance]),
    ...(currentEarnings ? [['Equity', '', 'Current-period earnings', currentEarnings]] : []),
    ['TOTAL ASSETS', '', '', assets],
    ['TOTAL LIABILITIES AND EQUITY', '', '', liabilities + equity],
  ];

  return <><section className="report-overview"><div className="report-intro"><span className="report-icon"><Wallet size={20} /></span><div><h2>Balance sheet</h2><p>Assets, liabilities and equity snapshot</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-balance-sheet-${todayValue}.csv`, statementRows)}><Download size={15} /> Export CSV</button></div><div className="report-total-grid"><div><span>Assets</span><strong>{money(assets)}</strong></div><div><span>Liabilities</span><strong>{money(liabilities)}</strong></div><div><span>Equity incl. current earnings</span><strong>{money(equity)}</strong></div><div><span>Liabilities + equity</span><strong>{money(liabilities + equity)}</strong></div></div></section><section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>Statement of financial position</h2><p>Based on recorded ledger balances</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>SECTION</th><th>CODE</th><th>ACCOUNT</th><th>AMOUNT</th></tr></thead><tbody>{statementRows.slice(1, -2).map((row, index) => <tr key={`${row[1]}-${index}`}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td className="amount-cell">{money(row[3])}</td></tr>)}</tbody></table></div></section></>;
}

function CashFlowStatementView({ journalLines, exportCsv, todayValue }) {
  const cashLines = journalLines.filter((line) => line.accountId === '1000');
  const cashReceived = cashLines.reduce((sum, line) => sum + line.debit, 0);
  const cashPaid = cashLines.reduce((sum, line) => sum + line.credit, 0);
  const netOperatingCash = cashReceived - cashPaid;
  const rows = [['Activity', 'Amount (JMD)'], ['Cash inflows recorded', cashReceived], ['Cash outflows recorded', cashPaid], ['Net change in cash', netOperatingCash]];

  return <><section className="report-overview"><div className="report-intro"><span className="report-icon"><ArrowDownLeft size={20} /></span><div><h2>Cash flow statement</h2><p>Cash account movements from posted entries · JMD</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-cash-flow-${todayValue}.csv`, rows)}><Download size={15} /> Export CSV</button></div><div className="report-total-grid"><div><span>Cash inflows</span><strong className="stat-green">{money(cashReceived)}</strong></div><div><span>Cash outflows</span><strong>{money(cashPaid)}</strong></div><div><span>Net change in cash</span><strong>{money(netOperatingCash)}</strong></div><div><span>Ending cash balance</span><strong>{money(netOperatingCash)}</strong></div></div></section><section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>Cash movements</h2><p>Period summary</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>ACTIVITY</th><th>AMOUNT</th></tr></thead><tbody>{rows.slice(1).map(([label, amount]) => <tr key={label}><td>{label}</td><td className="amount-cell">{money(amount)}</td></tr>)}</tbody></table></div></section></>;
}

function GeneralJournalView({ accounts, journalEntries, onPost, journalLines, exportCsv, todayValue }) {
  const today = toDateInputValue(new Date());
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([
    { accountId: accounts[0]?.id || '', debit: '', credit: '' },
    { accountId: accounts.find((account) => account.type === 'Revenue')?.id || '', debit: '', credit: '' },
  ]);
  const [error, setError] = useState('');
  const debitTotal = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const creditTotal = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const manualLines = journalLines.filter((line) => line.reference.startsWith('JRN-'));
  const accountMap = new Map(accounts.map((account) => [account.id, account.name]));
  const rows = [...journalLines].reverse();
  const exportRows = [
    ['Date', 'Reference', 'Account code', 'Account', 'Description', 'Debit (JMD)', 'Credit (JMD)'],
    ...rows.map((line) => [line.date, line.reference, line.accountId, accountMap.get(line.accountId) || line.accountId, line.description, line.debit, line.credit]),
  ];
  const updateLine = (index, field, value) => setLines((items) => items.map((line, itemIndex) => itemIndex === index ? { ...line, [field]: value } : line));
  const submit = (event) => {
    event.preventDefault();
    if (!description.trim() || !isValidDate(date) || lines.length < 2
      || lines.some((line) => !line.accountId || (Number(line.debit) <= 0 && Number(line.credit) <= 0)
        || (Number(line.debit) > 0 && Number(line.credit) > 0))
      || debitTotal <= 0 || debitTotal !== creditTotal) {
      setError('Add a description and at least two valid lines. Debits and credits must be equal and each line must post to one side.');
      return;
    }
    const entry = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      reference: `JRN-${date.replaceAll('-', '')}-${Date.now().toString().slice(-5)}`,
      date,
      description: description.trim(),
      lines: lines.map((line) => ({ accountId: line.accountId, debit: Number(line.debit) || 0, credit: Number(line.credit) || 0 })),
    };
    if (onPost(entry)) {
      setDescription('');
      setLines([
        { accountId: accounts[0]?.id || '', debit: '', credit: '' },
        { accountId: accounts.find((account) => account.type === 'Revenue')?.id || '', debit: '', credit: '' },
      ]);
      setError('');
    } else {
      setError('Entry could not be saved. Verify the accounts and try again.');
    }
  };

  return <><section className="panel full-panel journal-compose"><div className="panel-heading"><div><h2>Post a journal entry</h2><p>Enter balanced debit and credit lines. Posted entries are saved on this device.</p></div></div><form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Entry date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>Description<input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this adjustment for?" required /></label></div><div className="table-scroll"><table className="data-table journal-entry-table"><thead><tr><th>ACCOUNT</th><th>DEBIT (JMD)</th><th>CREDIT (JMD)</th><th /></tr></thead><tbody>{lines.map((line, index) => <tr key={index}><td><select aria-label={`Account for journal line ${index + 1}`} value={line.accountId} onChange={(event) => updateLine(index, 'accountId', event.target.value)} required><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.id} · {account.name}</option>)}</select></td><td><input aria-label={`Debit for journal line ${index + 1}`} type="number" min="0" step="1" value={line.debit} onChange={(event) => updateLine(index, 'debit', event.target.value)} /></td><td><input aria-label={`Credit for journal line ${index + 1}`} type="number" min="0" step="1" value={line.credit} onChange={(event) => updateLine(index, 'credit', event.target.value)} /></td><td><button className="button button-secondary button-small" type="button" disabled={lines.length <= 2} onClick={() => setLines((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></td></tr>)}</tbody></table></div><div className="journal-form-footer"><button className="button button-secondary button-small" type="button" onClick={() => setLines((items) => [...items, { accountId: '', debit: '', credit: '' }])}><Plus size={14} /> Add line</button><span>Debits <strong>{money(debitTotal)}</strong> · Credits <strong>{money(creditTotal)}</strong></span><button className="button button-primary button-small" type="submit"><Check size={15} /> Post entry</button></div>{error && <p className="form-error" role="alert">{error}</p>}</form></section><section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>Journal activity</h2><p>{manualLines.length} manual entries · transaction activity also posts automatically</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-general-journal-${todayValue}.csv`, exportRows)}><Download size={15} /> Export CSV</button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>DATE</th><th>REFERENCE</th><th>ACCOUNT</th><th>DESCRIPTION</th><th>DEBIT</th><th>CREDIT</th></tr></thead><tbody>{rows.length ? rows.map((entry, index) => <tr key={`${entry.reference}-${entry.accountId}-${index}`}><td className="date-cell">{dateLabel(entry.date)}</td><td>{entry.reference}</td><td>{entry.accountId} · {accountMap.get(entry.accountId) || 'Unknown account'}</td><td>{entry.description}</td><td className="amount-cell">{entry.debit ? money(entry.debit) : '—'}</td><td className="amount-cell">{entry.credit ? money(entry.credit) : '—'}</td></tr>) : <tr><td colSpan="6" className="empty-state">No journal entries available.</td></tr>}</tbody></table></div></section></>;
}

function ChartOfAccountsView({ accounts, accountBalances, onAdd, exportCsv, todayValue }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Asset');
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const account = { id: code.trim(), name: name.trim(), type };
    if (!isAccount(account) || accounts.some((item) => item.id === account.id || item.name.toLowerCase() === account.name.toLowerCase())) {
      setError('Use a unique 4–6 digit code and a unique account name.');
      return;
    }
    if (onAdd(account)) {
      setCode('');
      setName('');
      setError('');
    } else {
      setError('Account could not be saved. Verify its code and name.');
    }
  };
  const rows = accountBalances.map((account) => [account.id, account.name, account.type, account.balance]);

  return <><section className="panel full-panel journal-compose"><div className="panel-heading"><div><h2>Add an account</h2><p>Choose a unique account code and accounting type.</p></div></div><form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Account code<input inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. 5300" required /></label><label>Account name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Repairs expense" required /></label></div><div className="form-grid"><label>Account type<select value={type} onChange={(event) => setType(event.target.value)}>{['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((item) => <option key={item}>{item}</option>)}</select></label><span /></div><div><button className="button button-primary button-small" type="submit"><Plus size={15} /> Add account</button></div>{error && <p className="form-error" role="alert">{error}</p>}</form></section><section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>Chart of accounts</h2><p>{accounts.length} active accounts · balances in JMD</p></div><button className="button button-secondary button-small" onClick={() => exportCsv(`island-ledger-chart-of-accounts-${todayValue}.csv`, [['Code', 'Account', 'Type', 'Balance (JMD)'], ...rows])}><Download size={15} /> Export CSV</button></div><div className="table-scroll"><table className="data-table"><thead><tr><th>CODE</th><th>ACCOUNT</th><th>TYPE</th><th>BALANCE</th></tr></thead><tbody>{accountBalances.map((account) => <tr key={account.id}><td>{account.id}</td><td>{account.name}</td><td>{account.type}</td><td className="amount-cell">{money(account.balance)}</td></tr>)}</tbody></table></div></section></>;
}

function AgingAnalysisView({ invoices, transactions, type, todayValue }) {
  const daysPastDue = (due) => Math.max(0, Math.floor((new Date(`${todayValue}T12:00:00`) - new Date(`${due}T12:00:00`)) / 86400000));
  const buckets = [
    { label: 'Not due', min: 0, max: 0, total: 0, items: [] },
    { label: '1–30 days overdue', min: 1, max: 30, total: 0, items: [] },
    { label: '31–60 days overdue', min: 31, max: 60, total: 0, items: [] },
    { label: '61–90 days overdue', min: 61, max: 90, total: 0, items: [] },
    { label: '90+ days overdue', min: 91, max: Infinity, total: 0, items: [] },
  ];
  const sourceRows = type === 'AR'
    ? invoices.filter((item) => item.status !== 'Paid').map((item) => ({
        id: item.id, party: item.client, description: item.description, due: item.due, amount: item.amount,
      }))
    : transactions.filter((item) => item.type === 'expense').map((item) => ({
        id: `AP-${item.id}`, party: item.name, description: item.detail,
        due: toDateInputValue(addDays(new Date(`${item.date}T12:00:00`), 14)), amount: item.amount,
      }));
  const items = sourceRows.map((item) => {
    const late = daysPastDue(item.due);
    const bucket = buckets.find((entry) => late >= entry.min && late <= entry.max) || buckets[buckets.length - 1];
    const reminder = late > 90 ? 'Escalate urgently' : late > 30 ? 'Follow up again' : late > 0 ? 'Send payment reminder' : 'Monitor due date';
    return { ...item, late, bucket, reminder, tone: late > 90 ? 'aging-critical' : late > 30 ? 'aging-warning' : late > 0 ? 'aging-late' : 'aging-current' };
  });
  items.forEach((item) => {
    item.bucket.total += Number(item.amount);
    item.bucket.items.push(item);
  });
  const total = buckets.reduce((sum, bucket) => sum + bucket.total, 0);
  const exportRows = [
    ['Reference', type === 'AR' ? 'Customer' : 'Supplier', 'Description', 'Due date', 'Days overdue', 'Aging bucket', 'Suggested follow-up', 'Amount (JMD)'],
    ...items.map((item) => [item.id, item.party, item.description, item.due, item.late, item.bucket.label, item.reminder, item.amount]),
  ];

  return <><section className="report-overview"><div className="report-intro"><span className="report-icon"><CalendarDays size={20} /></span><div><h2>{type === 'AR' ? 'Accounts receivable aging' : 'Accounts payable aging'}</h2><p>{type === 'AR' ? 'Outstanding customer balances by age' : 'Supplier obligations by age'}</p></div></div><div className="report-total-grid"><div><span>Total outstanding</span><strong>{money(total)}</strong></div><div><span>Not due</span><strong>{money(buckets[0].total)}</strong></div><div><span>1–30 overdue</span><strong>{money(buckets[1].total)}</strong></div><div><span>Over 90 overdue</span><strong>{money(buckets[4].total)}</strong></div></div></section>{type === 'AP' && <p className="storage-alert">AP aging is an estimate based on recorded expense dates plus 14 days; these expenses may already be paid. Verify supplier bills before acting.</p>}<section className="panel full-panel"><div className="panel-heading table-heading"><div><h2>{type === 'AR' ? 'Receivables and reminder priorities' : 'Payables and payment priorities'}</h2><p>Age-based follow-up recommendations</p></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>{type === 'AR' ? 'CUSTOMER' : 'SUPPLIER'}</th><th>REFERENCE</th><th>DUE DATE</th><th>AGE</th><th>FOLLOW-UP</th><th className="amount-cell">AMOUNT</th></tr></thead><tbody>{items.length ? items.map((item) => <tr className={item.tone} key={item.id}><td><strong>{item.party}</strong><small className="invoice-desc">{item.description}</small></td><td>{item.id}</td><td className="date-cell">{dateLabel(item.due)}</td><td><span className={`status-pill ${item.tone}`}>{item.late ? `${item.late} days overdue` : 'Not due'}</span></td><td>{item.reminder}</td><td className="amount-cell">{money(item.amount)}</td></tr>) : <tr><td colSpan="6" className="empty-state">No outstanding balances to review.</td></tr>}</tbody><tfoot><tr><td colSpan="5"><strong>Total outstanding</strong></td><td className="amount-cell"><strong>{money(total)}</strong></td></tr></tfoot></table></div><div className="aging-buckets">{buckets.map((bucket) => <div key={bucket.label}><span>{bucket.label}</span><strong>{bucket.items.length} · {money(bucket.total)}</strong></div>)}</div></section></>;
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
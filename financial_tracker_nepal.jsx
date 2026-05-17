import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Trash2, Filter, PieChart, Menu, X, Home, BarChart3, Settings } from 'lucide-react';

const FinancialTracker = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], type: 'income', category: 'Salary', amount: 50000, description: 'Monthly salary' },
    { id: 2, date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Groceries', amount: 1500, description: 'Weekly groceries' },
    { id: 3, date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Utilities', amount: 800, description: 'Electricity bill' },
  ]);

  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'Groceries',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other Income'],
    expense: ['Groceries', 'Utilities', 'Transportation', 'Dining', 'Entertainment', 'Healthcare', 'Other Expense'],
    loan: ['Car Loan', 'Mortgage', 'Personal Loan', 'Student Loan', 'Credit Card', 'Other Loan'],
    miscellaneous: ['Gifts', 'Charity', 'Emergency', 'Other Miscellaneous'],
  };

  const typeColors = {
    income: '#10b981',
    expense: '#ef4444',
    loan: '#f59e0b',
    miscellaneous: '#8b5cf6',
  };

  const typeLabels = {
    income: 'Income',
    expense: 'Expense',
    loan: 'Loan',
    miscellaneous: 'Miscellaneous',
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const newTransaction = {
      id: Date.now(),
      date: formData.date,
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      type: 'expense',
      category: 'Groceries',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type,
      category: categories[type][0],
    });
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    const today = new Date();
    if (dateRange === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date === todayStr);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today.setDate(today.getDate() - 7));
      filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
      filtered = filtered.filter(t => new Date(t.date) >= monthAgo);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter, dateRange]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const loan = filteredTransactions
      .filter(t => t.type === 'loan')
      .reduce((sum, t) => sum + t.amount, 0);

    const miscellaneous = filteredTransactions
      .filter(t => t.type === 'miscellaneous')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: parseFloat(income.toFixed(2)),
      expense: parseFloat(expense.toFixed(2)),
      loan: parseFloat(loan.toFixed(2)),
      miscellaneous: parseFloat(miscellaneous.toFixed(2)),
      balance: parseFloat((income - expense - loan - miscellaneous).toFixed(2)),
    };
  }, [filteredTransactions]);

  // All time stats
  const allTimeStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const loan = transactions
      .filter(t => t.type === 'loan')
      .reduce((sum, t) => sum + t.amount, 0);

    const miscellaneous = transactions
      .filter(t => t.type === 'miscellaneous')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income: parseFloat(income.toFixed(2)),
      expense: parseFloat(expense.toFixed(2)),
      loan: parseFloat(loan.toFixed(2)),
      miscellaneous: parseFloat(miscellaneous.toFixed(2)),
      balance: parseFloat((income - expense - loan - miscellaneous).toFixed(2)),
    };
  }, [transactions]);

  const dailyExpenses = useMemo(() => {
    const daily = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!daily[t.date]) daily[t.date] = 0;
        daily[t.date] += t.amount;
      });
    return daily;
  }, [filteredTransactions]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = dailyExpenses[todayStr] || 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    filteredTransactions.forEach(t => {
      if (!breakdown[t.category]) breakdown[t.category] = 0;
      breakdown[t.category] += t.amount;
    });
    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a1f35 100%)', minHeight: '100vh' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #e2e8f0;
        }

        .navbar {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .nav-menu {
          display: flex;
          gap: 1rem;
          list-style: none;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          padding: 0.75rem 1.25rem;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .nav-link:hover {
          border-color: rgba(148, 163, 184, 0.5);
          color: #f1f5f9;
        }

        .nav-link.active {
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          color: #0f172a;
          border-color: transparent;
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          color: #e2e8f0;
          cursor: pointer;
          font-size: 1.5rem;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          z-index: 999;
          flex-direction: column;
          padding: 2rem;
          gap: 1rem;
        }

        .mobile-menu.open {
          display: flex;
        }

        .mobile-menu-close {
          align-self: flex-end;
          background: none;
          border: none;
          color: #e2e8f0;
          cursor: pointer;
          font-size: 1.5rem;
        }

        .mobile-menu .nav-link {
          width: 100%;
          text-align: left;
          padding: 1rem;
          justify-content: flex-start;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-section {
          display: none;
        }

        .page-section.active {
          display: block;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header {
          margin-bottom: 3rem;
          animation: slideDown 0.6s ease-out;
        }

        .title {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 1rem;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          padding: 1.5rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card:hover {
          border-color: rgba(148, 163, 184, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }

        .stat-label {
          font-size: 0.875rem;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .income { color: #10b981; }
        .expense { color: #ef4444; }
        .loan { color: #f59e0b; }
        .miscellaneous { color: #8b5cf6; }
        .balance { 
          color: #60a5fa;
          font-size: 2.5rem;
        }

        .form-section {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #f1f5f9;
        }

        .type-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .type-btn {
          padding: 0.75rem 1rem;
          border: 2px solid rgba(148, 163, 184, 0.3);
          background: rgba(51, 65, 85, 0.5);
          color: #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          text-transform: capitalize;
        }

        .type-btn:hover {
          border-color: rgba(148, 163, 184, 0.5);
          background: rgba(51, 65, 85, 0.7);
        }

        .type-btn.active {
          border-color: currentColor;
          color: var(--color);
          background: rgba(51, 65, 85, 0.9);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input,
        .form-select {
          padding: 0.75rem;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          color: #f1f5f9;
          font-size: 1rem;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
          background: rgba(30, 41, 59, 0.95);
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-select option {
          background: #1e293b;
          color: #f1f5f9;
        }

        .submit-btn {
          grid-column: 1 / -1;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          color: #0f172a;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(96, 165, 250, 0.3);
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: rgba(51, 65, 85, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: capitalize;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: #60a5fa;
          color: #0f172a;
          border-color: #60a5fa;
        }

        .filter-btn:hover {
          border-color: rgba(148, 163, 184, 0.5);
        }

        .transactions-section {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .transaction-item {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border-left: 4px solid;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          transition: all 0.2s;
        }

        .transaction-item:hover {
          background: rgba(15, 23, 42, 0.8);
          transform: translateX(4px);
        }

        .transaction-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
        }

        .transaction-details h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #f1f5f9;
        }

        .transaction-details p {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .transaction-amount {
          font-weight: 700;
          font-size: 1.1rem;
          font-variant-numeric: tabular-nums;
        }

        .delete-btn {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          color: #fca5a5;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.4);
          border-color: #ef4444;
          color: #ef4444;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #64748b;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .daily-summary {
          background: rgba(96, 165, 250, 0.1);
          border: 1px solid rgba(96, 165, 250, 0.3);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .daily-item {
          text-align: center;
        }

        .daily-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .daily-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ef4444;
          font-variant-numeric: tabular-nums;
        }

        .dashboard-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .recent-transactions {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .category-breakdown {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .breakdown-item:last-child {
          border-bottom: none;
        }

        .breakdown-label {
          font-size: 0.95rem;
          color: #cbd5e1;
        }

        .breakdown-amount {
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .welcome-banner {
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%);
          border: 1px solid rgba(96, 165, 250, 0.3);
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-text {
          color: #94a3b8;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .title {
            font-size: 2rem;
          }

          .nav-menu {
            display: none;
          }

          .hamburger {
            display: block;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .transaction-item {
            grid-template-columns: auto 1fr auto;
          }

          .delete-btn {
            width: 32px;
            height: 32px;
          }

          .dashboard-section {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 1rem;
          }

          .navbar {
            padding: 1rem;
          }
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">💰 Financial Tracker</div>
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <ul className="nav-menu">
            <li className="nav-item">
              <button
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage('dashboard');
                  setMobileMenuOpen(false);
                }}
              >
                <Home size={18} /> Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage('transactions');
                  setMobileMenuOpen(false);
                }}
              >
                <Calendar size={18} /> Transactions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${currentPage === 'analysis' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage('analysis');
                  setMobileMenuOpen(false);
                }}
              >
                <BarChart3 size={18} /> Analysis
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu open">
          <button
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
          <button
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('dashboard');
              setMobileMenuOpen(false);
            }}
          >
            <Home size={18} /> Dashboard
          </button>
          <button
            className={`nav-link ${currentPage === 'transactions' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('transactions');
              setMobileMenuOpen(false);
            }}
          >
            <Calendar size={18} /> Transactions
          </button>
          <button
            className={`nav-link ${currentPage === 'analysis' ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('analysis');
              setMobileMenuOpen(false);
            }}
          >
            <BarChart3 size={18} /> Analysis
          </button>
        </div>
      )}

      <div className="container">
        {/* DASHBOARD PAGE */}
        <div className={`page-section ${currentPage === 'dashboard' ? 'active' : ''}`}>
          <div className="header">
            <h1 className="title">Your Financial Dashboard</h1>
            <p className="subtitle">Complete overview of your income, expenses, loans, and miscellaneous spending</p>
          </div>

          <div className="welcome-banner">
            <div className="welcome-title">Welcome to Financial Tracker Nepal</div>
            <div className="welcome-text">Use this powerful tool to manage your transactions, save money, and achieve your financial goals</div>
          </div>

          {/* Stats Grid */}
          <div className="grid">
            <div className="stat-card">
              <div className="stat-label income">
                <TrendingUp size={16} /> Income
              </div>
              <div className="stat-value income">₹{allTimeStats.income.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label expense">
                <TrendingDown size={16} /> Expenses
              </div>
              <div className="stat-value expense">₹{allTimeStats.expense.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label loan">
                <DollarSign size={16} /> Loans
              </div>
              <div className="stat-value loan">₹{allTimeStats.loan.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label miscellaneous">
                <PieChart size={16} /> Miscellaneous
              </div>
              <div className="stat-value miscellaneous">₹{allTimeStats.miscellaneous.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label" style={{ color: '#60a5fa' }}>
                <Calendar size={16} /> Balance
              </div>
              <div className="stat-value balance">₹{allTimeStats.balance.toLocaleString()}</div>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="daily-summary">
            <div className="daily-item">
              <div className="daily-label">Today's Expenses</div>
              <div className="daily-value">₹{todayExpense.toFixed(2)}</div>
            </div>
            <div className="daily-item">
              <div className="daily-label">Total Transactions</div>
              <div className="daily-value">{transactions.length}</div>
            </div>
            <div className="daily-item">
              <div className="daily-label">Total Balance</div>
              <div className="daily-value">₹{allTimeStats.balance.toFixed(2)}</div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-section">
            {/* Recent Transactions */}
            <div className="recent-transactions">
              <h2 className="section-title">
                <Calendar size={20} /> Recent Transactions
              </h2>
              {transactions.slice(0, 5).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>No transactions yet</p>
                </div>
              ) : (
                transactions.slice(0, 5).map(transaction => (
                  <div
                    key={transaction.id}
                    className="transaction-item"
                    style={{ borderColor: typeColors[transaction.type] }}
                  >
                    <div
                      className="transaction-icon"
                      style={{
                        background: `${typeColors[transaction.type]}20`,
                        color: typeColors[transaction.type],
                      }}
                    >
                      {transaction.type === 'income' && '📈'}
                      {transaction.type === 'expense' && '📉'}
                      {transaction.type === 'loan' && '🏦'}
                      {transaction.type === 'miscellaneous' && '🎁'}
                    </div>

                    <div className="transaction-details">
                      <h4>{transaction.category}</h4>
                      <p>{transaction.description} • {transaction.date}</p>
                    </div>

                    <div className="transaction-amount" style={{ color: typeColors[transaction.type] }}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Category Breakdown */}
            <div className="category-breakdown">
              <h2 className="section-title">
                <PieChart size={20} /> Category Breakdown
              </h2>
              {categoryBreakdown.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <p>No data available</p>
                </div>
              ) : (
                categoryBreakdown.map(item => (
                  <div key={item.category} className="breakdown-item">
                    <div className="breakdown-label">{item.category}</div>
                    <div className="breakdown-amount">₹{item.amount.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TRANSACTIONS PAGE */}
        <div className={`page-section ${currentPage === 'transactions' ? 'active' : ''}`}>
          <div className="header">
            <h1 className="title">Transaction Management</h1>
            <p className="subtitle">Add and manage all your financial transactions</p>
          </div>

          {/* Add Transaction Form */}
          <div className="form-section">
            <h2 className="form-title">Add New Transaction</h2>

            <div className="type-selector">
              {Object.keys(categories).map(type => (
                <button
                  key={type}
                  className={`type-btn ${formData.type === type ? 'active' : ''}`}
                  style={{ '--color': typeColors[type] }}
                  onClick={() => handleTypeChange(type)}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddTransaction}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Weekly groceries"
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  <Plus size={20} /> Add Transaction
                </button>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="filters">
            <div>
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Types
              </button>
              <button
                className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
                onClick={() => setFilter('income')}
              >
                Income
              </button>
              <button
                className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
                onClick={() => setFilter('expense')}
              >
                Expenses
              </button>
              <button
                className={`filter-btn ${filter === 'loan' ? 'active' : ''}`}
                onClick={() => setFilter('loan')}
              >
                Loans
              </button>
              <button
                className={`filter-btn ${filter === 'miscellaneous' ? 'active' : ''}`}
                onClick={() => setFilter('miscellaneous')}
              >
                Misc.
              </button>
            </div>

            <div>
              <button
                className={`filter-btn ${dateRange === 'today' ? 'active' : ''}`}
                onClick={() => setDateRange('today')}
              >
                Today
              </button>
              <button
                className={`filter-btn ${dateRange === 'week' ? 'active' : ''}`}
                onClick={() => setDateRange('week')}
              >
                This Week
              </button>
              <button
                className={`filter-btn ${dateRange === 'month' ? 'active' : ''}`}
                onClick={() => setDateRange('month')}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="transactions-section">
            <h2 className="section-title">
              <Calendar size={20} /> Transaction List
            </h2>

            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="transaction-item"
                  style={{ borderColor: typeColors[transaction.type] }}
                >
                  <div
                    className="transaction-icon"
                    style={{
                      background: `${typeColors[transaction.type]}20`,
                      color: typeColors[transaction.type],
                    }}
                  >
                    {transaction.type === 'income' && '📈'}
                    {transaction.type === 'expense' && '📉'}
                    {transaction.type === 'loan' && '🏦'}
                    {transaction.type === 'miscellaneous' && '🎁'}
                  </div>

                  <div className="transaction-details">
                    <h4>{transaction.category}</h4>
                    <p>{transaction.description} • {transaction.date}</p>
                  </div>

                  <div className="transaction-amount" style={{ color: typeColors[transaction.type] }}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    title="Delete transaction"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ANALYSIS PAGE */}
        <div className={`page-section ${currentPage === 'analysis' ? 'active' : ''}`}>
          <div className="header">
            <h1 className="title">Financial Analysis</h1>
            <p className="subtitle">Detailed insights into your financial data</p>
          </div>

          {/* Analysis Stats */}
          <div className="grid">
            <div className="stat-card">
              <div className="stat-label income">
                <TrendingUp size={16} /> Income
              </div>
              <div className="stat-value income">₹{stats.income.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label expense">
                <TrendingDown size={16} /> Expenses
              </div>
              <div className="stat-value expense">₹{stats.expense.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label loan">
                <DollarSign size={16} /> Loans
              </div>
              <div className="stat-value loan">₹{stats.loan.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label miscellaneous">
                <PieChart size={16} /> Miscellaneous
              </div>
              <div className="stat-value miscellaneous">₹{stats.miscellaneous.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label" style={{ color: '#60a5fa' }}>
                <Calendar size={16} /> Balance
              </div>
              <div className="stat-value balance">₹{stats.balance.toLocaleString()}</div>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="daily-summary">
            <div className="daily-item">
              <div className="daily-label">Today's Expenses</div>
              <div className="daily-value">₹{todayExpense.toFixed(2)}</div>
            </div>
            <div className="daily-item">
              <div className="daily-label">Total Transactions</div>
              <div className="daily-value">{filteredTransactions.length}</div>
            </div>
            <div className="daily-item">
              <div className="daily-label">Expense Rate</div>
              <div className="daily-value">{stats.income > 0 ? ((stats.expense / stats.income) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="category-breakdown">
            <h2 className="section-title">
              <PieChart size={20} /> Category Analysis
            </h2>
            {categoryBreakdown.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <p>No data available for analysis</p>
              </div>
            ) : (
              categoryBreakdown.map((item, index) => (
                <div key={item.category} className="breakdown-item">
                  <div className="breakdown-label">
                    {index + 1}. {item.category}
                  </div>
                  <div className="breakdown-amount">₹{item.amount.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>

          {/* Daily Breakdown */}
          <div className="transactions-section" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">
              <Calendar size={20} /> Daily Expense Analysis
            </h2>
            {Object.entries(dailyExpenses).length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📆</div>
                <p>No daily expense data available</p>
              </div>
            ) : (
              Object.entries(dailyExpenses)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .slice(0, 10)
                .map(([date, amount]) => (
                  <div key={date} className="breakdown-item">
                    <div className="breakdown-label">{date}</div>
                    <div className="breakdown-amount" style={{ color: '#ef4444' }}>
                      ₹{amount.toFixed(2)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTracker;

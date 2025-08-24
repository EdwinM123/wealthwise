import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, Wallet, Target, Calendar, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Finnhub API key (replace with your own for production)
const FINNHUB_API_KEY = 'd2la8b1r01qqq9qu4pm0d2la8b1r01qqq9qu4pmg';

const WealthWise = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [newInvestment, setNewInvestment] = useState({
    symbol: '',
    shares: '',
    buyPrice: '',
    currentPrice: '',
    name: ''
  });
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: '',
    category: 'savings'
  });

  // For react-select symbol search
  const [symbolOptions, setSymbolOptions] = useState([]);
  const [isLoadingSymbols, setIsLoadingSymbols] = useState(false);
  const searchTimeout = useRef(null);

  // For live price updates
  const [liveBuyPrice, setLiveBuyPrice] = useState('');
  const [liveCurrentPrice, setLiveCurrentPrice] = useState('');
  const priceIntervalRef = useRef(null);

  // Debounced Finnhub symbol search
  const handleSymbolInputChange = (inputValue, { action }) => {
    if (action !== 'input-change') return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!inputValue) {
      setSymbolOptions([]);
      return;
    }

    setIsLoadingSymbols(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/search?q=${inputValue}&token=${FINNHUB_API_KEY}`);
        const data = await res.json();
        if (data.result) {
          setSymbolOptions(
            data.result
              .filter(item => ['Common Stock', 'ETF'].includes(item.type))
              .map(item => ({
                value: item.symbol,
                label: `${item.symbol} - ${item.description}`,
                name: item.description
              }))
          );
        } else {
          setSymbolOptions([]);
        }
      } catch {
        setSymbolOptions([]);
      }
      setIsLoadingSymbols(false);
    }, 400); // 400ms debounce
  };

  // When a symbol is selected, fill symbol and name
  const handleSymbolSelect = (selected) => {
    if (selected) {
      setNewInvestment({
        ...newInvestment,
        symbol: selected.value,
        name: selected.name
      });
    } else {
      setNewInvestment({
        ...newInvestment,
        symbol: '',
        name: ''
      });
    }
  };

  // Finnhub price fetch helper
  const fetchCurrentPrice = async (symbol) => {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
      const data = await res.json();
      return data.c || 0; // 'c' is the current price
    } catch (error) {
      console.error('Error fetching current price:', error);
      return 0;
    }
  };

  // Calculations (reordered for correct variable usage)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const portfolioValue = investments.reduce((sum, inv) =>
    sum + (inv.shares * inv.currentPrice), 0);

  const portfolioGainLoss = investments.reduce((sum, inv) =>
    sum + (inv.shares * (inv.currentPrice - inv.buyPrice)), 0);

  const portfolioPercentage = portfolioValue > 0 ?
    ((portfolioGainLoss / (portfolioValue - portfolioGainLoss)) * 100) : 0;

  const netWorth = totalIncome - totalExpenses + portfolioValue;

  // Chart data
  const getMonthName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'short' });
  };

  const months = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (7 - i));
    return d.toISOString().split('T')[0].slice(0, 7); // 'YYYY-MM'
  });

  const monthlyData = months.map((monthStr, idx) => {
    const monthName = new Date(`${monthStr}-01`).toLocaleString('default', { month: 'short' });
    const income = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthStr))
      .reduce((sum, t) => sum + t.amount, 0);
    return { month: monthName, income, expenses };
  });

  const expenseCategories = [
    { name: 'Food', color: '#FF6B6B' },
    { name: 'Transportation', color: '#4ECDC4' },
    { name: 'Entertainment', color: '#45B7D1' },
    { name: 'Utilities', color: '#96CEB4' },
    { name: 'Healthcare', color: '#FFEAA7' }
  ].map(cat => ({
    ...cat,
    value: transactions
      .filter(t => t.type === 'expense' && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0)
  })).filter(cat => cat.value > 0);

  const expenseCategoriesList = [
    'Food',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Healthcare'
  ];
  const incomeCategoriesList = [
    'Salary',
    'Business',
    'Investments',
    'Gifts',
    'Other'
  ];

  // Event handlers
  const addTransaction = (e) => {
    e.preventDefault();
    if (!newTransaction.category || !newTransaction.amount) return;

    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: parseFloat(newTransaction.amount) || 0
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: 'expense',
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Update addInvestment to use live prices
  const addInvestment = async (e) => {
    e.preventDefault();
    if (!newInvestment.symbol || !newInvestment.shares) return;

    // Fetch live price from Finnhub
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${newInvestment.symbol}&token=${FINNHUB_API_KEY}`);
    const data = await res.json();

    const investment = {
      id: Date.now(),
      ...newInvestment,
      shares: parseFloat(newInvestment.shares) || 0,
      buyPrice: data.o || 0, // open price as buy price
      currentPrice: data.c || 0, // current price
    };

    setInvestments([...investments, investment]);
    setNewInvestment({
      symbol: '',
      shares: '',
      buyPrice: '',
      currentPrice: '',
      name: ''
    });
    setLiveBuyPrice('');
    setLiveCurrentPrice('');
  };

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      target: parseFloat(newGoal.target) || 0,
      current: parseFloat(newGoal.current) || 0
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      target: '',
      current: '',
      category: 'savings'
    });
  };

  const removeTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const removeInvestment = (id) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const TabButton = ({ tab, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab)}
      className={`px-6 py-3 font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } rounded-lg`}
    >
      {label}
    </button>
  );

  const colorMap = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-50",
    },
    green: {
      text: "text-green-600",
      bg: "bg-green-50",
    },
    red: {
      text: "text-red-600",
      bg: "bg-red-50",
    },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-50",
    },
  };

  const StatCard = ({ icon: Icon, title, value, trend, color = 'blue' }) => {
    const colors = colorMap[color] || colorMap.blue;
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold ${colors.text} mt-1`}>
              {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-3">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    );
  };

  // Fetch live prices for selected symbol
  useEffect(() => {
    // Only fetch if symbol and shares are set
    if (!newInvestment.symbol || !newInvestment.shares) {
      setLiveBuyPrice('');
      setLiveCurrentPrice('');
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
      return;
    }

    const fetchPrices = async () => {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${newInvestment.symbol}&token=${FINNHUB_API_KEY}`);
      const data = await res.json();
      setLiveBuyPrice(data.o ? (parseFloat(data.o) * parseFloat(newInvestment.shares)).toFixed(2) : '');
      setLiveCurrentPrice(data.c ? (parseFloat(data.c) * parseFloat(newInvestment.shares)).toFixed(2) : '');
    };

    fetchPrices();
    priceIntervalRef.current = setInterval(fetchPrices, 10000); // update every 10s

    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, [newInvestment.symbol, newInvestment.shares]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">WealthWise</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">{showBalance ? 'Hide' : 'Show'} Balance</span>
              </button>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Net Worth</p>
                <p className="text-xl font-bold text-gray-900">
                  {showBalance ? `$${netWorth.toLocaleString()}` : '•••••'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-4 mt-6">
            <TabButton 
              tab="dashboard" 
              label="Dashboard" 
              isActive={activeTab === 'dashboard'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              tab="transactions" 
              label="Transactions" 
              isActive={activeTab === 'transactions'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              tab="investments" 
              label="Investments" 
              isActive={activeTab === 'investments'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              tab="goals" 
              label="Goals" 
              isActive={activeTab === 'goals'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={DollarSign} 
                title="Total Income" 
                value={showBalance ? totalIncome : '•••••'} 
                trend={5.2}
                color="green"
              />
              <StatCard 
                icon={TrendingDown} 
                title="Total Expenses" 
                value={showBalance ? totalExpenses : '•••••'} 
                trend={-2.1}
                color="red"
              />
              <StatCard 
                icon={TrendingUp} 
                title="Portfolio Value" 
                value={showBalance ? portfolioValue : '•••••'} 
                trend={portfolioPercentage}
                color="blue"
              />
              <StatCard 
                icon={Target} 
                title="Goals Progress" 
                value={`${goals.length} Active`} 
                color="purple"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Income vs Expenses */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Categories */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {expenseCategories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-600">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`w-4 h-4 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                      </p>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-8">
            {/* Add Transaction Form */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
              <form onSubmit={addTransaction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value, category: ''})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                >
                  <option value="">Select Category</option>
                  {(newTransaction.type === 'expense' ? expenseCategoriesList : incomeCategoriesList).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Amount"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                />
                
                <input
                  type="text"
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                />
                
                <button
                  type="submit"
                  disabled={!newTransaction.category || !newTransaction.amount}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 ${(!newTransaction.category || !newTransaction.amount) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">All Transactions</h3>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold">{transaction.category}</p>
                        <p className="text-gray-600">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{transaction.type}</p>
                    </div>
                    <button
                      onClick={() => removeTransaction(transaction.id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="space-y-8">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
                <p className="text-3xl font-bold text-blue-600">${portfolioValue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Total Gain/Loss</h3>
                <p className={`text-3xl font-bold ${portfolioGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioGainLoss >= 0 ? '+' : ''}${portfolioGainLoss.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Return %</h3>
                <p className={`text-3xl font-bold ${portfolioPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioPercentage >= 0 ? '+' : ''}{portfolioPercentage.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Add Investment Form */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Add New Investment</h3>
              <form onSubmit={addInvestment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Symbol Search Dropdown */}
                <Select
                  aria-label="Stock Symbol Search"
                  placeholder="Search Symbol"
                  isClearable
                  isLoading={isLoadingSymbols}
                  options={symbolOptions}
                  onInputChange={handleSymbolInputChange}
                  onChange={handleSymbolSelect}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  value={
                    newInvestment.symbol
                      ? { value: newInvestment.symbol, label: `${newInvestment.symbol} - ${newInvestment.name}` }
                      : null
                  }
                />

                {/* Company Name (auto-filled, read-only) */}
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newInvestment.name}
                  readOnly
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                />

                <input
                  type="number"
                  placeholder="Shares"
                  step="0.01"
                  value={newInvestment.shares}
                  onChange={(e) => setNewInvestment({...newInvestment, shares: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                />
                <input
                  type="number"
                  placeholder="Buy Price"
                  value={liveBuyPrice}
                  disabled
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
                <input
                  type="number"
                  placeholder="Current Price"
                  value={liveCurrentPrice}
                  disabled
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Investment List */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Investment Holdings</h3>
              <div className="space-y-4">
                {investments.map((investment) => {
                  const gainLoss = investment.shares * (investment.currentPrice - investment.buyPrice);
                  const gainLossPercent = ((investment.currentPrice - investment.buyPrice) / investment.buyPrice) * 100;
                  
                  return (
                    <div key={investment.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-lg">{investment.symbol}</h4>
                        <p className="text-gray-600">{investment.name}</p>
                        <p className="text-sm text-gray-500">{investment.shares} shares</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold">${(investment.shares * investment.currentPrice).toLocaleString()}</p>
                        <p className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </p>
                        <p className="text-sm text-gray-500">
                          ${investment.buyPrice} → ${investment.currentPrice}
                        </p>
                      </div>
                      <button
                        onClick={() => removeInvestment(investment.id)}
                        className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-8">
            {/* Add Goal Form */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
              <form onSubmit={addGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Goal Name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                />
                
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                >
                  <option value="savings">Savings</option>
                  <option value="purchase">Purchase</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="investment">Investment</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Target Amount"
                  step="0.01"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                />
                
                <input
                  type="number"
                  placeholder="Current Amount"
                  step="0.01"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                />
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Goals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                const remaining = goal.target - goal.current;
                
                return (
                  <div key={goal.id} className="bg-white rounded-xl p-6 shadow-lg relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{goal.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        goal.category === 'savings' ? 'bg-green-100 text-green-800' :
                        goal.category === 'purchase' ? 'bg-blue-100 text-blue-800' :
                        goal.category === 'lifestyle' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {goal.category}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>${goal.current.toLocaleString()}</span>
                        <span>${goal.target.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-blue-600 font-medium">{progress.toFixed(1)}% complete</span>
                        <span className="text-gray-600">${remaining.toLocaleString()} remaining</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Target className="w-4 h-4" />
                      <span>
                        {progress >= 100 ? 'Goal achieved!' : 
                         progress >= 75 ? 'Almost there!' :
                         progress >= 50 ? 'Halfway to goal' :
                         progress >= 25 ? 'Good progress' :
                         'Just getting started'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Goals Progress Chart */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Goals Progress Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goals.map(goal => ({
                  name: goal.name,
                  progress: (goal.current / goal.target) * 100,
                  remaining: ((goal.target - goal.current) / goal.target) * 100
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                  <Bar dataKey="progress" fill="#3B82F6" />
                  <Bar dataKey="remaining" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WealthWise;
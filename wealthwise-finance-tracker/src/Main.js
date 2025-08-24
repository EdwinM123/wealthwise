import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, TrendingUp, TrendingDown, Wallet, Target, Calendar, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const WealthWise = () => {
  // State management
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', category: 'Salary', amount: 3500, description: 'Monthly salary', date: '2025-08-01' },
    { id: 2, type: 'expense', category: 'Food', amount: 450, description: 'Groceries', date: '2025-08-15' },
    { id: 3, type: 'expense', category: 'Transportation', amount: 120, description: 'Gas', date: '2025-08-10' }
  ]);
  
  const [investments, setInvestments] = useState([
    { id: 1, symbol: 'AAPL', shares: 10, buyPrice: 150, currentPrice: 175, name: 'Apple Inc.' },
    { id: 2, symbol: 'GOOGL', shares: 5, buyPrice: 2500, currentPrice: 2650, name: 'Alphabet Inc.' },
    { id: 3, symbol: 'TSLA', shares: 8, buyPrice: 200, currentPrice: 185, name: 'Tesla Inc.' }
  ]);
  
  const [goals, setGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 10000, current: 3500, category: 'savings' },
    { id: 2, name: 'New Car', target: 25000, current: 8200, category: 'purchase' },
    { id: 3, name: 'Vacation', target: 5000, current: 1200, category: 'lifestyle' }
  ]);
  
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

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netWorth = totalIncome - totalExpenses;
  
  const portfolioValue = investments.reduce((sum, inv) => 
    sum + (inv.shares * inv.currentPrice), 0);
  
  const portfolioGainLoss = investments.reduce((sum, inv) => 
    sum + (inv.shares * (inv.currentPrice - inv.buyPrice)), 0);
  
  const portfolioPercentage = portfolioValue > 0 ? 
    ((portfolioGainLoss / (portfolioValue - portfolioGainLoss)) * 100) : 0;

  // Chart data
  const monthlyData = [
    { month: 'Jan', income: 3500, expenses: 2800 },
    { month: 'Feb', income: 3500, expenses: 3200 },
    { month: 'Mar', income: 3800, expenses: 2900 },
    { month: 'Apr', income: 3500, expenses: 3100 },
    { month: 'May', income: 3700, expenses: 2700 },
    { month: 'Jun', income: 3500, expenses: 3000 },
    { month: 'Jul', income: 3600, expenses: 2800 },
    { month: 'Aug', income: 3500, expenses: 2950 }
  ];

  const expenseCategories = [
    { name: 'Food', value: 450, color: '#FF6B6B' },
    { name: 'Transportation', value: 120, color: '#4ECDC4' },
    { name: 'Entertainment', value: 200, color: '#45B7D1' },
    { name: 'Utilities', value: 150, color: '#96CEB4' },
    { name: 'Healthcare', value: 80, color: '#FFEAA7' }
  ];

  // Event handlers
  const addTransaction = (e) => {
    e.preventDefault();
    if (!newTransaction.category || !newTransaction.amount) return;
    
    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: parseFloat(newTransaction.amount)
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

  const addInvestment = (e) => {
    e.preventDefault();
    if (!newInvestment.symbol || !newInvestment.shares || !newInvestment.buyPrice) return;
    
    const investment = {
      id: Date.now(),
      ...newInvestment,
      shares: parseFloat(newInvestment.shares),
      buyPrice: parseFloat(newInvestment.buyPrice),
      currentPrice: parseFloat(newInvestment.currentPrice) || parseFloat(newInvestment.buyPrice)
    };
    
    setInvestments([...investments, investment]);
    setNewInvestment({
      symbol: '',
      shares: '',
      buyPrice: '',
      currentPrice: '',
      name: ''
    });
  };

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    
    const goal = {
      id: Date.now(),
      ...newGoal,
      target: parseFloat(newGoal.target),
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

  const StatCard = ({ icon: Icon, title, value, trend, color = 'blue' }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>
            {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
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
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Amount"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <input
                  type="text"
                  placeholder="Symbol (e.g., AAPL)"
                  value={newInvestment.symbol}
                  onChange={(e) => setNewInvestment({...newInvestment, symbol: e.target.value.toUpperCase()})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newInvestment.name}
                  onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Shares"
                  step="0.01"
                  value={newInvestment.shares}
                  onChange={(e) => setNewInvestment({...newInvestment, shares: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Buy Price"
                  step="0.01"
                  value={newInvestment.buyPrice}
                  onChange={(e) => setNewInvestment({...newInvestment, buyPrice: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Current Price"
                  step="0.01"
                  value={newInvestment.currentPrice}
                  onChange={(e) => setNewInvestment({...newInvestment, currentPrice: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div key={investment.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
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
                      </div>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Current Amount"
                  step="0.01"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div key={goal.id} className="bg-white rounded-xl p-6 shadow-lg">
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
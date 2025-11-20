import React, { useState, useMemo } from 'react';
import { 
  Upload, 
  FileText, 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Award, 
  AlertCircle, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coffee, 
  ShoppingBag, 
  Car, 
  Home, 
  Zap,
  Shield,
  Trash2,
  X,
  FileWarning
} from 'lucide-react';

// --- Utility / Logic Helpers ---

const CATEGORIES = {
  DINING: { color: 'bg-orange-500', label: 'Dining & Food', icon: Coffee, pointsMultiplier: 3 },
  SHOPPING: { color: 'bg-blue-500', label: 'Shopping', icon: ShoppingBag, pointsMultiplier: 1 },
  TRANSPORT: { color: 'bg-purple-500', label: 'Transport', icon: Car, pointsMultiplier: 2 },
  HOUSING: { color: 'bg-teal-500', label: 'Housing & Utilities', icon: Home, pointsMultiplier: 1 },
  ENTERTAINMENT: { color: 'bg-pink-500', label: 'Entertainment', icon: Zap, pointsMultiplier: 2 },
  GROCERY: { color: 'bg-green-500', label: 'Groceries', icon: ShoppingBag, pointsMultiplier: 2 },
  OTHER: { color: 'bg-gray-400', label: 'Other', icon: FileText, pointsMultiplier: 1 },
};

// Simple keyword matching for demo categorization
const categorizeTransaction = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes('uber') || desc.includes('lyft') || desc.includes('gas') || desc.includes('shell')) return 'TRANSPORT';
  if (desc.includes('starbucks') || desc.includes('mcdonalds') || desc.includes('restaurant') || desc.includes('doordash')) return 'DINING';
  if (desc.includes('walmart') || desc.includes('target') || desc.includes('amazon')) return 'SHOPPING';
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('cinema') || desc.includes('ticket')) return 'ENTERTAINMENT';
  if (desc.includes('kroger') || desc.includes('whole foods') || desc.includes('trader')) return 'GROCERY';
  if (desc.includes('electric') || desc.includes('rent') || desc.includes('water')) return 'HOUSING';
  return 'OTHER';
};

const MOCK_DATA = [
  { id: 1, date: '2023-10-01', description: 'Starbucks Coffee', amount: 15.50, type: 'debit' },
  { id: 2, date: '2023-10-02', description: 'Uber Trip', amount: 24.00, type: 'debit' },
  { id: 3, date: '2023-10-03', description: 'Amazon Marketplace', amount: 120.99, type: 'debit' },
  { id: 4, date: '2023-10-05', description: 'Netflix Subscription', amount: 19.99, type: 'debit' },
  { id: 5, date: '2023-10-06', description: 'Shell Gas Station', amount: 45.00, type: 'debit' },
  { id: 6, date: '2023-10-08', description: 'Whole Foods Market', amount: 89.50, type: 'debit' },
  { id: 7, date: '2023-10-10', description: 'Cinema City', amount: 35.00, type: 'debit' },
  { id: 8, date: '2023-10-12', description: 'McDonalds', amount: 12.45, type: 'debit' },
  { id: 9, date: '2023-10-15', description: 'Target Store', amount: 210.00, type: 'debit' },
  { id: 10, date: '2023-10-18', description: 'City Water Bill', amount: 65.00, type: 'debit' },
  { id: 11, date: '2023-10-20', description: 'Uber Eats', amount: 32.00, type: 'debit' },
  { id: 12, date: '2023-10-22', description: 'Payment Received', amount: -1500.00, type: 'credit' },
];

// --- Components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      {subtext && <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{subtext}</span>}
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ProgressBar = ({ label, amount, total, color, percentage }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="text-slate-500">${amount.toFixed(2)} ({percentage}%)</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const InsightCard = ({ title, description, saving, type }) => (
  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-3 flex items-start space-x-3">
    <div className="mt-1">
      {type === 'warning' ? (
        <AlertCircle className="w-5 h-5 text-amber-500" />
      ) : (
        <TrendingUp className="w-5 h-5 text-indigo-600" />
      )}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
      {saving > 0 && (
        <div className="mt-2 inline-flex items-center px-2 py-1 bg-white rounded-md border border-indigo-100 shadow-sm">
          <span className="text-xs font-bold text-green-600">Potential Savings: ${saving}</span>
        </div>
      )}
    </div>
  </div>
);

// --- Main Application ---

export default function StatementAnalyzer() {
  const [view, setView] = useState('upload'); // 'upload' | 'dashboard'
  const [transactions, setTransactions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // --- Processing Logic ---

  const processedData = useMemo(() => {
    if (transactions.length === 0) return null;

    let totalSpend = 0;
    let totalPoints = 0;
    const categoryBreakdown = {};
    const insights = [];

    // Initialize breakdown
    Object.keys(CATEGORIES).forEach(key => {
      categoryBreakdown[key] = { amount: 0, count: 0, key };
    });

    transactions.forEach(tx => {
      if (tx.type === 'credit') return; // Skip payments

      const catKey = categorizeTransaction(tx.description);
      const catConfig = CATEGORIES[catKey];

      // Accumulate Spend
      totalSpend += tx.amount;
      categoryBreakdown[catKey].amount += tx.amount;
      categoryBreakdown[catKey].count += 1;

      // Calculate Rewards
      const points = Math.floor(tx.amount * catConfig.pointsMultiplier);
      totalPoints += points;
      tx.category = catKey; // Attach category to transaction object for list view
      tx.points = points;
    });

    // Generate Insights
    if (categoryBreakdown.DINING.amount > 150) {
      insights.push({
        title: "High Dining Spend",
        description: `You spent $${categoryBreakdown.DINING.amount.toFixed(0)} on dining out. Cooking at home 2 more nights a week could reduce this significantly.`,
        saving: (categoryBreakdown.DINING.amount * 0.3).toFixed(0),
        type: 'warning'
      });
    }
    if (categoryBreakdown.ENTERTAINMENT.amount > 50) {
      insights.push({
        title: "Subscription Alert",
        description: "Multiple entertainment charges detected. Ensure you are using all your active subscriptions.",
        saving: 15,
        type: 'info'
      });
    }

    // Sort categories by spend
    const sortedCategories = Object.values(categoryBreakdown)
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpend,
      totalPoints,
      sortedCategories,
      insights
    };
  }, [transactions]);

  // --- Handlers ---

  const handleLoadDemo = () => {
    setTransactions(MOCK_DATA);
    setError('');
    setView('dashboard');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setError('');

    // 1. Simple Extension Check
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      setError("PDF and Excel files are not supported in this demo. Please convert your statement to CSV.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;

      // 2. Binary Content Check (prevents loading garbage data)
      // If the first 500 characters contain null bytes or control characters, it's likely binary.
      if (/[\x00-\x08\x0E-\x1F]/.test(text.slice(0, 500))) {
         setError("This file appears to be binary (not text). Please upload a standard CSV file.");
         return;
      }

      const lines = text.split('\n');
      
      // Improved CSV Parsing with Validation
      const newTransactions = lines.slice(1).map((line, idx) => {
        // Handle simple CSVs (doesn't handle commas inside quotes perfectly, but better than nothing)
        const cols = line.split(',');
        if (cols.length < 2) return null; // Needs at least date and description
        
        // Flexible Date Parsing
        let dateStr = cols[0] || '';
        // If date is invalid or empty, default to today, but try to keep valid ones
        if (dateStr.length < 5) dateStr = new Date().toISOString();

        const amountStr = cols[2] || '0';
        // Clean currency symbols
        const cleanAmount = amountStr.replace(/[$,]/g, '');
        const amount = parseFloat(cleanAmount);
        
        if (isNaN(amount)) return null;

        return {
          id: idx,
          date: dateStr,
          description: cols[1] ? cols[1].replace(/"/g, '').trim() : 'Unknown',
          amount: amount,
          type: amount < 0 ? 'credit' : 'debit'
        };
      }).filter(t => t && t.description && t.amount !== 0); // Filter out empty rows/invalid amounts
      
      if (newTransactions.length > 0) {
        setTransactions(newTransactions);
        setView('dashboard');
      } else {
        setError("Could not parse valid transactions. Ensure CSV format: Date, Description, Amount");
      }
    };
    reader.readAsText(file);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Render Views ---

  if (view === 'upload' || !processedData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Statement Analyzer</h1>
            <p className="text-slate-500">Unlock insights from your credit card usage. <br/>Visualize spending, track rewards, and find savings.</p>
          </div>

          <div 
            className={`
              border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out
              flex flex-col items-center justify-center gap-4 cursor-pointer relative
              ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-102' : 'border-slate-300 bg-white hover:border-indigo-300'}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">Drop your statement here</p>
              <p className="text-sm text-slate-400 mt-1">Supports <span className="font-bold text-indigo-600">.CSV</span> files only</p>
            </div>
            <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-indigo-200">
              Browse Files
              <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
            
            {error && (
              <div className="absolute bottom-4 left-0 w-full px-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                  <FileWarning className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleLoadDemo}
            className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            No file? Try with Demo Data <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('upload')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Statement Analyzer</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('upload')}
              className="text-sm font-medium text-slate-500 hover:text-indigo-600"
            >
              Upload New
            </button>
            <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
              JD
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Spend" 
            value={`$${processedData.totalSpend.toFixed(2)}`} 
            subtext="This Statement"
            icon={DollarSign}
            colorClass="bg-slate-800 text-white"
          />
          <StatCard 
            title="Reward Points" 
            value={`${processedData.totalPoints.toLocaleString()} pts`} 
            subtext="Estimated Earned"
            icon={Award}
            colorClass="bg-amber-500 text-white"
          />
          <StatCard 
            title="Potential Savings" 
            value={`$${processedData.insights.reduce((acc, curr) => acc + Number(curr.saving || 0), 0)}`} 
            subtext="Optimizable Spend"
            icon={TrendingUp}
            colorClass="bg-green-500 text-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Breakdown & Insights */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Spend Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Category Breakdown
              </h2>
              <div className="space-y-1">
                {processedData.sortedCategories.map((cat) => {
                  const config = CATEGORIES[cat.key];
                  const percentage = ((cat.amount / processedData.totalSpend) * 100).toFixed(1);
                  return (
                    <ProgressBar 
                      key={cat.key}
                      label={config.label}
                      amount={cat.amount}
                      total={processedData.totalSpend}
                      color={config.color}
                      percentage={percentage}
                    />
                  );
                })}
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden max-h-[600px]">
              {/* Header Section */}
              <div className="p-6 border-b border-slate-100 bg-white z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Transactions
                  </h2>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search merchant..." 
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Scrollable Table Section */}
              <div className="overflow-y-auto overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                    <tr className="text-xs font-semibold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                      <th className="py-3 pl-6 w-24">Date</th>
                      <th className="py-3 px-2">Merchant</th>
                      <th className="py-3 px-2 hidden sm:table-cell">Category</th>
                      <th className="py-3 px-2 hidden sm:table-cell text-right">Points</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                      <th className="py-3 pr-6 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-50">
                    {transactions
                      .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((t) => {
                        const cat = CATEGORIES[categorizeTransaction(t.description)];
                        const isCredit = t.type === 'credit';
                        return (
                          <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="py-4 pl-6 text-slate-500 whitespace-nowrap">{t.date.split('T')[0]}</td>
                            <td className="py-4 px-2 font-medium text-slate-700">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isCredit ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                  {isCredit ? <ArrowDownRight className="w-4 h-4" /> : <cat.icon className="w-4 h-4" />}
                                </div>
                                <span className="truncate max-w-[140px] sm:max-w-full">{t.description}</span>
                              </div>
                            </td>
                            <td className="py-4 px-2 hidden sm:table-cell">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium bg-opacity-10 ${cat.color.replace('bg-', 'text-')} ${cat.color}`}>
                                {cat.label}
                              </span>
                            </td>
                            <td className="py-4 px-2 hidden sm:table-cell text-right text-amber-600 font-medium text-xs">
                              {!isCredit && `+${t.points || 0}`}
                            </td>
                            <td className={`py-4 px-2 text-right font-bold ${isCredit ? 'text-green-600' : 'text-slate-800'}`}>
                              {isCredit ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                            </td>
                            <td className="py-4 pr-6 text-right">
                              <button 
                                onClick={() => deleteTransaction(t.id)}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                
                {transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Search className="w-8 h-8 mb-2 opacity-50" />
                    <p>No transactions found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Insights Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Smart Insights */}
              <div className="bg-white p-6 rounded-2xl shadow-lg shadow-indigo-50 border border-indigo-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Smart Insights
                </h2>
                <div className="space-y-1">
                  {processedData.insights.length > 0 ? (
                    processedData.insights.map((insight, idx) => (
                      <InsightCard key={idx} {...insight} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <p>Great job! No unusual spending patterns detected this month.</p>
                    </div>
                  )}
                  
                  {/* Static Tip */}
                  <InsightCard 
                    title="Maximize Rewards" 
                    description="You spent heavily on Dining. Switch to the Gold Card to earn 4x points instead of 3x." 
                    saving={0}
                    type="info"
                  />
                </div>
              </div>

              {/* Rewards Summary Small */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Rewards Status</h3>
                  <Award className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="mb-6">
                  <p className="text-indigo-200 text-sm mb-1">Total Points Earned</p>
                  <p className="text-4xl font-bold">{processedData.totalPoints.toLocaleString()}</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    You can redeem these points for a <strong>${(processedData.totalPoints / 100).toFixed(2)}</strong> statement credit or transfer to travel partners.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
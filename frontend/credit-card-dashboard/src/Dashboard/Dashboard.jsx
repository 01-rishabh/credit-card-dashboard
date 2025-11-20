import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Container,
  AppBar,
  Toolbar,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
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
  FileWarning
} from 'lucide-react';

// --- Utility / Logic Helpers ---

const CATEGORIES = {
  DINING: { color: '#f97316', label: 'Dining & Food', icon: Coffee, pointsMultiplier: 3 }, // Orange-500
  SHOPPING: { color: '#3b82f6', label: 'Shopping', icon: ShoppingBag, pointsMultiplier: 1 }, // Blue-500
  TRANSPORT: { color: '#a855f7', label: 'Transport', icon: Car, pointsMultiplier: 2 }, // Purple-500
  HOUSING: { color: '#14b8a6', label: 'Housing & Utilities', icon: Home, pointsMultiplier: 1 }, // Teal-500
  ENTERTAINMENT: { color: '#ec4899', label: 'Entertainment', icon: Zap, pointsMultiplier: 2 }, // Pink-500
  GROCERY: { color: '#22c55e', label: 'Groceries', icon: ShoppingBag, pointsMultiplier: 2 }, // Green-500
  OTHER: { color: '#9ca3af', label: 'Other', icon: FileText, pointsMultiplier: 1 }, // Gray-400
};

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

// --- Custom Components ---

const StatCard = ({ title, value, subtext, icon: Icon, colorBg, colorText }) => (
  <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 3, 
          bgcolor: colorBg, 
          color: colorText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} />
        </Box>
        {subtext && (
          <Chip 
            label={subtext} 
            size="small" 
            sx={{ bgcolor: '#f8fafc', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }} 
          />
        )}
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const CategoryProgressBar = ({ label, amount, total, color, percentage }) => (
  <Box sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: '#64748b' }}>${amount.toFixed(2)} ({percentage}%)</Typography>
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={Number(percentage)} 
      sx={{ 
        height: 10, 
        borderRadius: 5, 
        bgcolor: '#f1f5f9',
        '& .MuiLinearProgress-bar': {
          bgcolor: color,
          borderRadius: 5,
        }
      }} 
    />
  </Box>
);

const InsightCard = ({ title, description, saving, type }) => (
  <Paper 
    elevation={0}
    sx={{ 
      p: 2, 
      mb: 2, 
      borderRadius: 3, 
      bgcolor: '#eef2ff', 
      border: '1px solid #e0e7ff',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2
    }}
  >
    <Box sx={{ mt: 0.5 }}>
      {type === 'warning' ? (
        <AlertCircle size={20} color="#f59e0b" />
      ) : (
        <TrendingUp size={20} color="#4f46e5" />
      )}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, lineHeight: 1.5 }}>{description}</Typography>
      {saving > 0 && (
        <Box sx={{ mt: 1.5, display: 'inline-block' }}>
          <Chip 
            label={`Potential Savings: $${saving}`} 
            size="small"
            sx={{ 
              bgcolor: 'white', 
              color: '#16a34a', 
              fontWeight: 700,
              border: '1px solid #dcfce7'
            }} 
          />
        </Box>
      )}
    </Box>
  </Paper>
);

// --- Main Theme Definition ---

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    background: {
      default: '#f8fafc',
    },
    primary: {
      main: '#4f46e5', // Indigo-600
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    }
  }
});

export default function App() {
  const [view, setView] = useState('upload');
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

    Object.keys(CATEGORIES).forEach(key => {
      categoryBreakdown[key] = { amount: 0, count: 0, key };
    });

    transactions.forEach(tx => {
      if (tx.type === 'credit') return;

      const catKey = categorizeTransaction(tx.description);
      const catConfig = CATEGORIES[catKey];

      totalSpend += tx.amount;
      categoryBreakdown[catKey].amount += tx.amount;
      categoryBreakdown[catKey].count += 1;

      const points = Math.floor(tx.amount * catConfig.pointsMultiplier);
      totalPoints += points;
      tx.category = catKey;
      tx.points = points;
    });

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

    const sortedCategories = Object.values(categoryBreakdown)
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { totalSpend, totalPoints, sortedCategories, insights };
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
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.pdf') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      setError("PDF and Excel files are not supported in this demo. Please convert to CSV.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      if (/[\x00-\x08\x0E-\x1F]/.test(text.slice(0, 500))) {
         setError("This file appears to be binary. Please upload a standard CSV file.");
         return;
      }

      const lines = text.split('\n');
      const newTransactions = lines.slice(1).map((line, idx) => {
        const cols = line.split(',');
        if (cols.length < 2) return null;
        
        let dateStr = cols[0] || '';
        if (dateStr.length < 5) dateStr = new Date().toISOString();

        const amountStr = cols[2] || '0';
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
      }).filter(t => t && t.description && t.amount !== 0);
      
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

  // --- Views ---

  const UploadView = () => (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2 
    }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            width: 64, 
            height: 64, 
            bgcolor: 'primary.main', 
            borderRadius: 4, 
            mx: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
          }}>
            <Shield color="white" size={32} />
          </Box>
          <Typography variant="h4" sx={{ mt: 3, fontWeight: 800, color: 'text.primary' }}>
            Statement Analyzer
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
            Unlock insights from your credit card usage. <br/>Visualize spending, track rewards, and find savings.
          </Typography>
        </Box>

        <Paper
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          elevation={0}
          sx={{
            p: 6,
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : '#cbd5e1',
            bgcolor: isDragging ? '#eef2ff' : 'white',
            borderRadius: 6,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            '&:hover': { borderColor: 'primary.light' }
          }}
        >
          <Box sx={{ width: 64, height: 64, bgcolor: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload color="#4f46e5" size={32} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Drop your statement here</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Supports <strong>.CSV</strong> files only</Typography>
          </Box>
          
          <Button
            component="label"
            variant="contained"
            sx={{ 
              textTransform: 'none', 
              borderRadius: 3, 
              px: 4, 
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}
          >
            Browse Files
            <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
          </Button>

          {error && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 0, 
              right: 0, 
              px: 4 
            }}>
              <Paper sx={{ 
                bgcolor: '#fef2f2', 
                color: '#dc2626', 
                p: 1.5, 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1,
                border: '1px solid #fecaca'
              }}>
                <FileWarning size={16} />
                <Typography variant="caption" fontWeight={600}>{error}</Typography>
              </Paper>
            </Box>
          )}
        </Paper>

        <Button 
          onClick={handleLoadDemo}
          endIcon={<ArrowUpRight size={16} />}
          sx={{ mt: 4, textTransform: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          No file? Try with Demo Data
        </Button>
      </Container>
    </Box>
  );

  const DashboardView = () => (
    <Box sx={{ pb: 8 }}>
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setView('upload')}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield color="white" size={20} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>Statement Analyzer</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button sx={{ textTransform: 'none', color: 'text.secondary' }} onClick={() => setView('upload')}>Upload New</Button>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.875rem', fontWeight: 700 }}>JD</Avatar>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Top Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total Spend" 
              value={`$${processedData.totalSpend.toFixed(2)}`} 
              subtext="This Statement"
              icon={DollarSign}
              colorBg="#1e293b" // slate-800
              colorText="white"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Reward Points" 
              value={`${processedData.totalPoints.toLocaleString()} pts`} 
              subtext="Estimated Earned"
              icon={Award}
              colorBg="#f59e0b" // amber-500
              colorText="white"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Potential Savings" 
              value={`$${processedData.insights.reduce((acc, curr) => acc + Number(curr.saving || 0), 0)}`} 
              subtext="Optimizable Spend"
              icon={TrendingUp}
              colorBg="#22c55e" // green-500
              colorText="white"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Main Content Column */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              
              {/* Category Breakdown */}
              <Card sx={{ borderRadius: 4, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChart size={20} color="#4f46e5" />
                    Category Breakdown
                  </Typography>
                  <Box>
                    {processedData.sortedCategories.map((cat) => {
                      const config = CATEGORIES[cat.key];
                      const percentage = ((cat.amount / processedData.totalSpend) * 100).toFixed(1);
                      return (
                        <CategoryProgressBar 
                          key={cat.key}
                          label={config.label}
                          amount={cat.amount}
                          total={processedData.totalSpend}
                          color={config.color}
                          percentage={percentage}
                        />
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Card sx={{ borderRadius: 4, boxShadow: '0px 2px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 600 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={20} color="#4f46e5" />
                    Transactions
                  </Typography>
                  <TextField 
                    size="small"
                    placeholder="Search merchant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={16} color="#94a3b8" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2, bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } }
                    }}
                    sx={{ width: { xs: '100%', sm: 250 } }}
                  />
                </Box>

                <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Merchant</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Category</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Points</TableCell>
                        <TableCell align="right" sx={{ bgcolor: '#f8fafc', color: '#64748b', fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ bgcolor: '#f8fafc' }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions
                        .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((t) => {
                          const cat = CATEGORIES[categorizeTransaction(t.description)];
                          const isCredit = t.type === 'credit';
                          return (
                            <TableRow key={t.id} hover>
                              <TableCell sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>{t.date.split('T')[0]}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: isCredit ? '#dcfce7' : '#f1f5f9', color: isCredit ? '#16a34a' : '#64748b' }}>
                                    {isCredit ? <ArrowDownRight size={16} /> : <cat.icon size={16} />}
                                  </Avatar>
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{t.description}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                <Chip 
                                  label={cat.label} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: `${cat.color}15`, // 10% opacity
                                    color: cat.color,
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }} 
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ color: '#d97706', fontWeight: 500, display: { xs: 'none', sm: 'table-cell' } }}>
                                {!isCredit && `+${t.points}`}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700, color: isCredit ? '#16a34a' : '#1e293b' }}>
                                {isCredit ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton size="small" onClick={() => deleteTransaction(t.id)} sx={{ color: '#cbd5e1', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}>
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                  {transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <Box sx={{ py: 8, textAlign: 'center', color: '#94a3b8' }}>
                      <Search size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
                      <Typography>No transactions found matching "{searchTerm}"</Typography>
                    </Box>
                  )}
                </TableContainer>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column: Insights */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 96 }}>
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                border: '1px solid #e0e7ff', 
                overflow: 'hidden', 
                position: 'relative',
                mb: 3
              }}>
                <Box sx={{ height: 4, background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)' }} />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Zap size={20} color="#f59e0b" fill="#f59e0b" />
                    Smart Insights
                  </Typography>
                  
                  {processedData.insights.length > 0 ? (
                    processedData.insights.map((insight, idx) => (
                      <InsightCard key={idx} {...insight} />
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                      <Typography variant="body2">Great job! No unusual spending patterns detected.</Typography>
                    </Box>
                  )}
                  
                  <InsightCard 
                    title="Maximize Rewards" 
                    description="You spent heavily on Dining. Switch to the Gold Card to earn 4x points instead of 3x." 
                    saving={0}
                    type="info"
                  />
                </CardContent>
              </Card>

              <Paper sx={{ 
                p: 3, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Rewards Status</Typography>
                  <Award size={24} color="#fde047" />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#c7d2fe' }}>Total Points Earned</Typography>
                  <Typography variant="h3" fontWeight={800}>{processedData.totalPoints.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 2, backdropFilter: 'blur(4px)' }}>
                  <Typography variant="caption" sx={{ color: '#e0e7ff', lineHeight: 1.4 }}>
                    Redeem for a <strong>${(processedData.totalPoints / 100).toFixed(2)}</strong> statement credit or transfer to travel partners.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {view === 'upload' || !processedData ? <UploadView /> : <DashboardView />}
    </ThemeProvider>
  );
}
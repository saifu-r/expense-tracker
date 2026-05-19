import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import History from './pages/History';
import AddTransaction from './pages/AddTransaction';
import Charts from './pages/Charts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ExpenseProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/history"  element={<History />} />
            <Route path="/add"      element={<AddTransaction />} />
            <Route path="/charts"   element={<Charts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </ExpenseProvider>
  );
}

import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Calendar, ShieldCheck, Cpu } from 'lucide-react';

const Home = () => {
  const { user, logout } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -left-32 -top-32 w-96 h-96 bg-brand-650/15 rounded-full blur-3xl" />
      <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-650 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-brand-400 to-indigo-300 bg-clip-text text-transparent">
              Smart Expense Tracker
            </h1>
            <p className="text-xs text-slate-500">MERN Authentication System</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-medium text-xs transition duration-200 cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative">
          
          {/* Status Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Session</span>
          </div>

          {/* Profile Card Header */}
          <div className="text-center mt-4 mb-8">
            <div className="inline-flex w-16 h-16 rounded-full bg-gradient-to-tr from-brand-650 to-indigo-500 items-center justify-center shadow-lg shadow-brand-500/20 mb-4 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-brand-400" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100">
              Welcome, {user?.name || 'User'}!
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Your authentication details are retrieved securely below.
            </p>
          </div>

          {/* User Details Details */}
          <div className="space-y-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl p-6">
            
            {/* Name */}
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-3.5">
              <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                <User className="w-4.5 h-4.5 text-slate-500" />
                <span>Full Name</span>
              </div>
              <span className="font-semibold text-slate-200 text-sm">{user?.name}</span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between border-b border-slate-850/60 pb-3.5">
              <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                <Mail className="w-4.5 h-4.5 text-slate-500" />
                <span>Email Address</span>
              </div>
              <span className="font-semibold text-slate-200 text-sm">{user?.email}</span>
            </div>

            {/* Created At */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                <Calendar className="w-4.5 h-4.5 text-slate-500" />
                <span>Account Created</span>
              </div>
              <span className="font-semibold text-slate-200 text-sm">
                {formatDate(user?.createdAt)}
              </span>
            </div>

          </div>

          <div className="mt-8 text-center text-xs text-slate-500 bg-slate-900/30 p-4 border border-slate-850/50 rounded-2xl leading-relaxed">
            🚀 <strong>Dashboard Placeholder:</strong> The dashboard routes and UI components will be connected next. Currently, all core authentication features (bcrypt, JWT storage, and protected endpoints) are fully functional.
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 py-6 px-6 bg-slate-950 text-center text-xs text-slate-650">
        <p>© 2026 Smart Expense Tracker. Secure Session Enabled.</p>
      </footer>
    </div>
  );
};

export default Home;

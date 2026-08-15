import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [uiState, setUiState] = useState({
    loading: false,
    error: '',
    success: '',
  });

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset error message when user starts typing again
    if (uiState.error) {
      setUiState((prev) => ({ ...prev, error: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setUiState({ loading: false, error: '', success: '' });

    // Client-side validations
    if (!name || !email || !password || !confirmPassword) {
      setUiState((prev) => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }

    if (password.length < 6) {
      setUiState((prev) => ({ ...prev, error: 'Password must be at least 6 characters long' }));
      return;
    }

    if (password !== confirmPassword) {
      setUiState((prev) => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, loading: true }));
      await register(name, email, password);
      
      setUiState({
        loading: false,
        error: '',
        success: 'Registration successful! Redirecting...',
      });

      // Redirect to home page after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setUiState({
        loading: false,
        error: err || 'Registration failed. Please check your credentials.',
        success: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic blurred background shapes */}
      <div className="absolute -left-40 -top-40 w-96 h-96 bg-brand-650/20 rounded-full blur-3xl animate-pulse duration-[8000ms]" />
      <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse duration-[6000ms]" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-650 to-brand-500 items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Join Smart Expense Tracker and save money
          </p>
        </div>

        {/* Success/Error Alerts */}
        {uiState.error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-brand-500/10 border border-brand-500/30 rounded-2xl text-brand-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-brand-450" />
            <span>{uiState.error}</span>
          </div>
        )}

        {uiState.success && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-gold/10 border border-gold/30 rounded-2xl text-gold text-sm">
            <Check className="w-5 h-5 shrink-0 text-gold" />
            <span>{uiState.success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block pl-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200"
                required
                disabled={uiState.loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block pl-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200"
                required
                disabled={uiState.loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block pl-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200"
                required
                minLength={6}
                disabled={uiState.loading}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase block pl-1">
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-2xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200"
                required
                disabled={uiState.loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uiState.loading}
            className="w-full mt-2 bg-gradient-to-r from-brand-650 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:from-slate-800 disabled:to-slate-800 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {uiState.loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-xs">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-semibold transition"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;

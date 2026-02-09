import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT THIS
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from './Input';

const LoginForm = ({ onSwitchView }) => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate(); // 2. INITIALIZE HOOK
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Supabase handles the redirect for Google Auth automatically
    } catch (error) {
      setMsg({ type: 'error', text: 'Google sign-in failed. Please try again.' });
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const result = await login(form);
      if (result.success) {
        setMsg({ type: 'success', text: 'Welcome back! Redirecting...' });
        
        // 3. THE FIX: Force Redirect after 500ms
        setTimeout(() => {
            navigate('/profile', { replace: true });
            // Optional: Triggers a re-check of auth state across the app
            window.dispatchEvent(new Event('auth-change'));
        }, 500);
        
      } else {
        setMsg({ type: 'error', text: result.message || 'Invalid credentials.' });
        setLoading(false); // Only stop loading on error
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Something went wrong. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 mt-2 text-sm">Enter your details to access your workspace.</p>
      </div>

      {/* Social Login Section */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 mb-6 group"
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end mt-1">
            <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </button>
          </div>
        </div>

        {msg.text && (
          <div className={`text-center text-sm p-3 rounded-lg font-medium border ${
            msg.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm flex justify-center items-center shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Sign In <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchView} 
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors ml-1"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from './Input';

const RegisterForm = ({ onSwitchView }) => {
  const { register, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '', // <--- Added username to state
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
    } catch (error) {
      setMsg({ type: 'error', text: 'Google sign-up failed. Please try again.' });
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    // 1. Prepare Payload for Supabase
    // We send 'username' and 'full_name' in the metadata
    const payload = {
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username, // <--- Sending username to Supabase
          full_name: `${form.first_name} ${form.last_name}`.trim(),
        }
      }
    };

    try {
      // Note: We are passing the 'payload' differently now to match how Supabase expects it
      // Ensure your AuthContext 'register' function passes 'options' correctly to supabase.auth.signUp()
      const result = await register(payload);
      
      if (result.success) {
        setMsg({ type: 'success', text: 'Account created! Please check your email to verify.' });
      } else {
        setMsg({ type: 'error', text: result.message || 'Registration failed.' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: error.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
        <p className="text-gray-500 mt-2 text-sm">Join the community to start collaborating.</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 mb-6"
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            <span>Sign up with Google</span>
          </>
        )}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Input
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* --- NEW USERNAME FIELD --- */}
        <Input
          label="Username"
          name="username"
          placeholder="e.g. code_wizard"
          value={form.username}
          onChange={handleChange}
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters.</p>

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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm flex justify-center items-center shadow-lg shadow-indigo-500/20 transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Create Account <UserPlus className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <button 
            onClick={onSwitchView} 
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors ml-1"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Lock, Mail, Loader2, Chrome } from 'lucide-react';

export function AuthForm({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await api.post('/auth/login', { email, password });
        onLogin();
      } else {
        await api.post('/auth/register', { email, password, name });
        // Auto-login after register for UX
        await api.post('/auth/login', { email, password });
        onLogin();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {isLogin ? 'Sign in to access your concepts' : 'Start your learning journey today'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            isLogin ? 'Sign In' : 'Sign Up'
          )}
        </button>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = 'http://localhost:3333/auth/google';
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all mb-6"
      >
        <Chrome className="h-5 w-5 text-gray-900" />
        <span>Sign in with Google</span>
      </button>

      <div className="text-center text-sm">
        <span className="text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </span>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </div>
    </div>
  );
}

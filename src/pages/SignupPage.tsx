import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { API_ENDPOINTS } from '../config/api';
import { TurnstileWidget } from '../components/TurnstileWidget';
import type { SignupData } from '../types/auth';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    password_confirm: '',
    username: '',
    first_name: '',
    last_name: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  // Validate email format
  const validateEmailFormat = (email: string): string | null => {
    if (!email) {
      return null;
    }

    // Check minimum length
    if (email.length < 3) {
      return 'Email is too short';
    }

    // Check for @ symbol
    if (!email.includes('@')) {
      return 'Email must contain @ symbol';
    }

    // Check for valid format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      // More specific error messages
      const parts = email.split('@');
      if (parts.length !== 2) {
        return 'Email must have exactly one @ symbol';
      }
      
      const [localPart, domain] = parts;
      
      if (!localPart) {
        return 'Email must have text before @';
      }
      
      if (!domain) {
        return 'Email must have a domain after @';
      }
      
      if (!domain.includes('.')) {
        return 'Email domain must contain a period (.)';
      }
      
      const domainParts = domain.split('.');
      const extension = domainParts[domainParts.length - 1];
      
      if (extension.length < 2) {
        return 'Email domain extension must be at least 2 characters';
      }
      
      // Check for invalid characters
      const validCharRegex = /^[a-zA-Z0-9._%+-]+$/;
      if (!validCharRegex.test(localPart)) {
        return 'Email contains invalid characters before @';
      }
      
      const validDomainRegex = /^[a-zA-Z0-9.-]+$/;
      if (!validDomainRegex.test(domain)) {
        return 'Email domain contains invalid characters';
      }
      
      return 'Please enter a valid email address';
    }

    return null; // Valid email
  };

  // Debounced email availability check
  const checkEmailAvailability = useCallback(
    async (email: string) => {
      if (!email || email.length < 3) {
        setEmailAvailable(null);
        return;
      }

      // Validate format first
      const formatError = validateEmailFormat(email);
      if (formatError) {
        setEmailError(formatError);
        setEmailAvailable(null);
        return;
      }

      setEmailChecking(true);
      
      try {
        const response = await fetch(
          `${API_ENDPOINTS.checkEmail}?email=${encodeURIComponent(email)}`
        );
        const data = await response.json();
        
        if (data.available) {
          setEmailAvailable(true);
          setEmailError('');
        } else {
          setEmailAvailable(false);
          setEmailError(data.message || 'Email is not available.');
        }
      } catch (err) {
        console.error('Error checking email:', err);
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    },
    []
  );

  // Validate username format
  const validateUsernameFormat = (username: string): string | null => {
    if (!username) {
      return null;
    }

    // Check minimum length
    if (username.length < 4) {
      return 'Username must be at least 4 characters';
    }

    // Check maximum length
    if (username.length > 30) {
      return 'Username must be at most 30 characters';
    }

    // Check for spaces
    if (username.includes(' ')) {
      return 'Username cannot contain spaces';
    }

    // Check for valid characters (letters, numbers, underscores, hyphens)
    const validCharRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validCharRegex.test(username)) {
      return 'Username can only contain letters, numbers, underscores (_), and hyphens (-)';
    }

    // Check if starts with a letter or number
    if (!/^[a-zA-Z0-9]/.test(username)) {
      return 'Username must start with a letter or number';
    }

    return null; // Valid username
  };

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      if (!username || username.length < 4) {
        setUsernameAvailable(null);
        return;
      }

      // Validate format first
      const formatError = validateUsernameFormat(username);
      if (formatError) {
        setUsernameError(formatError);
        setUsernameAvailable(null);
        return;
      }

      setUsernameChecking(true);
      
      try {
        const response = await fetch(
          `${API_ENDPOINTS.checkUsername}?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();
        
        if (data.available) {
          setUsernameAvailable(true);
          setUsernameError('');
        } else {
          setUsernameAvailable(false);
          setUsernameError(data.message || 'Username is not available.');
        }
      } catch (err) {
        console.error('Error checking username:', err);
        setUsernameAvailable(null);
      } finally {
        setUsernameChecking(false);
      }
    },
    []
  );

  // Debounce email checking - only check availability if format is valid
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        const formatError = validateEmailFormat(formData.email);
        if (!formatError) {
          // Only check availability if format is valid
          checkEmailAvailability(formData.email);
        }
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.email, checkEmailAvailability]);

  // Debounce username checking - only check availability if format is valid
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username) {
        const formatError = validateUsernameFormat(formData.username);
        if (!formatError) {
          // Only check availability if format is valid
          checkUsernameAvailability(formData.username);
        }
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [formData.username, checkUsernameAvailability]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    
    // Reset email state when typing
    if (name === 'email') {
      setEmailAvailable(null);
      // Immediate format validation as user types
      if (value) {
        const formatError = validateEmailFormat(value);
        setEmailError(formatError || '');
      } else {
        setEmailError('');
      }
    }
    
    // Reset username state when typing
    if (name === 'username') {
      setUsernameAvailable(null);
      // Immediate format validation as user types
      if (value) {
        const formatError = validateUsernameFormat(value);
        setUsernameError(formatError || '');
      } else {
        setUsernameError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check if email is available
    if (emailAvailable === false) {
      setError('Please choose an available email.');
      return;
    }

    if (emailAvailable === null && formData.email) {
      setError('Please wait while we check email availability.');
      return;
    }

    // Check if username is available
    if (usernameAvailable === false) {
      setError('Please choose an available username.');
      return;
    }

    if (usernameAvailable === null && formData.username) {
      setError('Please wait while we check username availability.');
      return;
    }

    // Check if Turnstile token is present
    if (!turnstileToken) {
      setError('Please complete the verification challenge.');
      return;
    }

    setLoading(true);

    try {
      // Call the backend signup API with Turnstile token
      const response = await fetch(API_ENDPOINTS.signup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstile_token: turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors from backend
        if (data.email) {
          setEmailError(Array.isArray(data.email) ? data.email[0] : data.email);
        }
        if (data.username) {
          setUsernameError(Array.isArray(data.username) ? data.username[0] : data.username);
        }
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Redirect to verification page with email
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card with glassmorphism */}
          <div className="bg-[var(--color-card)]/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-[var(--color-accent)] to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <UserPlus className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join the IranicDNA community</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-emerald-300"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300"
              >
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border ${
                      emailError 
                        ? 'border-red-500/50' 
                        : emailAvailable 
                        ? 'border-emerald-500/50' 
                        : 'border-white/10'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all`}
                    placeholder="your.email@example.com"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailChecking && formData.email && (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!emailChecking && emailAvailable === true && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                    {!emailChecking && emailAvailable === false && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                {emailError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-400"
                  >
                    {emailError}
                  </motion.p>
                )}
                {!emailError && emailAvailable === true && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-emerald-400"
                  >
                    ✓ Email is available!
                  </motion.p>
                )}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={4}
                    maxLength={30}
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border ${
                      usernameError 
                        ? 'border-red-500/50' 
                        : usernameAvailable 
                        ? 'border-emerald-500/50' 
                        : 'border-white/10'
                    } rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all`}
                    placeholder="Choose a username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameChecking && formData.username && (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    )}
                    {!usernameChecking && usernameAvailable === true && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                    {!usernameChecking && usernameAvailable === false && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                {usernameError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-400"
                  >
                    {usernameError}
                  </motion.p>
                )}
                {!usernameError && usernameAvailable === true && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-emerald-400"
                  >
                    ✓ Username is available!
                  </motion.p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  4-30 characters. Must start with letter/number. Letters, numbers, underscores, and hyphens only. No spaces.
                </p>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="password_confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Security Verification */}
              <TurnstileWidget
                onVerify={(token) => {
                  setTurnstileToken(token);
                  setError('');
                }}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                theme="dark"
              />

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[var(--color-accent)] to-amber-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="text-[var(--color-accent)] hover:text-amber-400 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};
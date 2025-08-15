import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CharacterIllustration from '../components/ui/CharacterIllustration';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      navigate('/app');
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Connexion échouée. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen bg-cream">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center pt-12 pb-4">
              <h1 className="text-4xl font-bold text-warmGray-800">
                Bon Retour !
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-warmGray-400" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Veuillez entrer une adresse email valide',
                      },
                    })}
                    type="email"
                    placeholder="email@gmail.com"
                    className="w-full pl-12 pr-4 py-4 bg-transparent border-2 border-warmGray-400 rounded-full text-warmGray-800 placeholder-warmGray-400 focus:outline-none focus:border-warmGray-600 transition-all duration-200"
                  />
                  <label className="absolute -top-3 left-6 bg-cream px-2 text-sm font-medium text-warmGray-600">
                    Email
                  </label>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-warmGray-400" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Le mot de passe doit contenir au moins 6 caractères',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    className="w-full pl-12 pr-12 py-4 bg-transparent border-2 border-warmGray-400 rounded-full text-warmGray-800 placeholder-warmGray-400 focus:outline-none focus:border-warmGray-600 transition-all duration-200"
                  />
                  <label className="absolute -top-3 left-6 bg-cream px-2 text-sm font-medium text-warmGray-600">
                    Mot de Passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-warmGray-400 hover:text-warmGray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-warmGray-400 hover:text-warmGray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-warmGray-500 hover:text-warmGray-700 font-medium transition-colors duration-200 text-sm"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Error Message */}
              {errors.root && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg mt-4">
                  {errors.root.message}
                </div>
              )}

              {/* Login Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E8C4A0] hover:bg-[#DDB892] text-[#8B6F47] font-medium py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8B6F47] mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-8 pb-12">
                <span className="text-warmGray-500 text-sm">
                  Vous n'avez pas de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-peach-600 hover:text-peach-700 font-medium transition-colors duration-200"
                  >
                    S'inscrire
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="flex-1 relative">
          <CharacterIllustration type="login" />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-cream relative overflow-x-hidden">
        {/* Large half-circle background starting from top - positioned absolutely */}
        <div
          className="absolute bg-peach-200 opacity-80"
          style={{
            width: '100%',
            height: '35vh',
            top: '0',
            left: '0',
            borderRadius: '0 0 50% 50%',
            zIndex: 1
          }}
        ></div>

        {/* Mobile Character Illustration - at bottom of half-circle */}
        <div className="relative z-10 flex justify-center" style={{ paddingTop: 'calc(35vh - 120px)' }}>
          <img
            src="/character.png"
            alt="Character with laptop and headphones"
            className="w-48 h-48 object-contain drop-shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="text-6xl hidden">👨‍💻</div>
        </div>

        {/* Mobile Title - in space between circle and form */}
        <div className="relative z-10 text-center py-6">
          <h1 className="text-2xl font-bold text-warmGray-800 tracking-wide">
            Login
          </h1>
        </div>

        {/* Mobile Content */}
        <div className="relative z-10 px-6">

          {/* Mobile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative z-10">
            {/* Email Field */}
            <div className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-warmGray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Veuillez entrer une adresse email valide',
                    },
                  })}
                  type="email"
                  placeholder="email@gmail.com"
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-2 border-warmGray-400 rounded-full text-warmGray-800 placeholder-warmGray-400 focus:outline-none focus:border-warmGray-600 transition-all duration-200"
                />
                <label className="absolute -top-3 left-6 bg-cream px-2 text-sm font-medium text-warmGray-600">
                  Email
                </label>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-warmGray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 bg-transparent border-2 border-warmGray-400 rounded-full text-warmGray-800 placeholder-warmGray-400 focus:outline-none focus:border-warmGray-600 transition-all duration-200"
                />
                <label className="absolute -top-3 left-6 bg-cream px-2 text-sm font-medium text-warmGray-600">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-warmGray-400 hover:text-warmGray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-warmGray-400 hover:text-warmGray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-warmGray-500 hover:text-warmGray-700 font-medium transition-colors duration-200 text-sm"
              >
                Forgot Password
              </button>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg mt-4">
                {errors.root.message}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#E8C4A0] hover:bg-[#DDB892] text-[#8B6F47] font-medium py-4 px-6 rounded-full transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#8B6F47] mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-6 pb-8">
              <span className="text-warmGray-500 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-peach-600 hover:text-peach-700 font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

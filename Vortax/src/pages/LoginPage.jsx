import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from './LoginPage.module.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  // Clear messages when switching between forms
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Login failed.');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.token);
      navigate('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Signup failed.');
        return;
      }

      const data = await response.json();
      setSuccess('Account created successfully! Please login.');
      setIsSignup(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    clearMessages();
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Google login failed.');
      }

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.token);
        navigate('/');
      } else {
        setError('Google login failed: ' + data.message);
      }
    } catch (error) {
      setError('Error during Google login: ' + error.message);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failed:', error);
    setError('Google login failed. Please try again.');
  };

  const handleSendResetOtp = async () => {
    clearMessages();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to send OTP.');
        return;
      }

      setSuccess('OTP sent to your email.');
      setOtpSent(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleResetPassword = async () => {
    clearMessages();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Password reset failed.');
        return;
      }

      setSuccess('Password reset successfully. You can now log in with your new password.');
      setForgotPassword(false);
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleFormSwitch = (newMode) => {
    clearMessages();
    setIsSignup(newMode === 'signup');
    setForgotPassword(newMode === 'forgot');
    setOtpSent(false);
    setOtp('');
    setNewPassword('');
  };

  return (
    <GoogleOAuthProvider clientId="934687510697-4b971je04qoe4h3843rdmj1qfr3m3bo6.apps.googleusercontent.com">
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {isSignup ? 'Sign Up' : forgotPassword ? 'Reset Password' : 'Login'}
        </h1>

        {!forgotPassword ? (
          <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={isSignup ? handleSignup : handleManualLogin}>
              {/* Email and OTP Section */}
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {isSignup && (
                  <button type="button" className={styles.otpButton}>
                    SEND OTP
                  </button>
                )}
              </div>

              {/* OTP Input for Signup */}
              {isSignup && (
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button type="button" className={styles.otpButton}>
                    VERIFY OTP
                  </button>
                </div>
              )}

              {/* Password Field */}
              <input
                type="password"
                className={styles.input}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Username Field for Signup */}
              {isSignup && (
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              )}

              {/* Submit Button */}
              <button type="submit" className={styles.signupButton}>
                {isSignup ? 'COMPLETE SIGNUP' : 'LOGIN'}
              </button>

              {/* Forgot Password Link (only for login) */}
              {!isSignup && (
                <p className={styles.forgotPassword} onClick={() => handleFormSwitch('forgot')}>
                  Forgot Password?
                </p>
              )}

              {/* OR Divider */}
              <div className={styles.divider}>
                <span>or</span>
              </div>

              {/* Google Login */}
              <div className={styles.googleLogin}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                  text={isSignup ? "signup_with" : "signin_with"}
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </form>

            {/* Toggle between Login and Signup */}
            <div className={styles.signinLink}>
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleFormSwitch('login'); }}>
                    Sign In
                  </a>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleFormSwitch('signup'); }}>
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                className={styles.input}
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
              {!otpSent ? (
                <button type="button" onClick={handleSendResetOtp} className={styles.button}>
                  Send OTP
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={handleResetPassword} className={styles.button}>
                    Reset Password
                  </button>
                </>
              )}
              
              <button 
                type="button" 
                onClick={() => handleFormSwitch('login')}
                className={styles.forgotPassword}
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
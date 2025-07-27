import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from './SignupPage.module.css';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP.');
        return;
      }

      setSuccess('OTP sent to your email.');
      setOtpSent(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'signup' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'OTP verification failed.');
        return;
      }

      setSuccess('OTP verified successfully.');
      setOtpVerified(true);
    } catch (err) {
      setError('An error occurred during OTP verification.');
    }
  };

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed.');
        return;
      }

      setSuccess('Signup successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleGoogleLoginSuccess = (response) => {
    console.log('Google Login Success:', response);
    fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess('Google login successful. Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError('Google login failed. Please try again.');
        }
      })
      .catch(() => setError('An error occurred during Google login.'));
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failed:', error);
    setError('Google login failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId="934687510697-4b971je04qoe4h3843rdmj1qfr3m3bo6.apps.googleusercontent.com">
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.heading}>Create Account</h1>
          
          <div className={styles.form}>
            {/* Email Section */}
            <div className={styles.inputGroup}>
              <input
                type="email"
                className={styles.input}
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                onClick={handleSendOtp} 
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {/* OTP Section */}
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={`${styles.input} ${!otpSent ? styles.disabled : ''}`}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={!otpSent}
                maxLength="6"
              />
              <button 
                onClick={handleVerifyOtp} 
                className={`${styles.button} ${styles.secondaryButton}`}
                disabled={!otpSent || !otp || otpVerified}
              >
                {otpVerified ? 'Verified ✓' : 'Verify OTP'}
              </button>
            </div>

            {/* Password Section */}
            <div className={styles.inputGroup}>
              <input
                type="password"
                className={`${styles.input} ${!otpVerified ? styles.disabled : ''}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!otpVerified}
                minLength="6"
              />
            </div>

            {/* Username Section */}
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={`${styles.input} ${!otpVerified ? styles.disabled : ''}`}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!otpVerified}
              />
            </div>

            {/* Main Signup Button */}
            <button 
              onClick={handleSignup} 
              className={`${styles.button} ${styles.primaryButton}`}
              disabled={!otpVerified}
            >
              Complete Signup
            </button>

            {/* Messages */}
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            {/* Divider */}
            <div className={styles.divider}>
              <span>or</span>
            </div>

            {/* Google Login */}
            <div className={styles.googleLogin}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
              />
            </div>
          </div>

          {/* Login Link */}
          <p className={styles.loginLink}>
            Already have an account? 
            <button 
              onClick={() => navigate('/login')}
              className={styles.linkButton}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignupPage;
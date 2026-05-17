import  { useState, useEffect, useMemo } from "react";
import axios from "axios";
import z  from "zod";
import { useRecoilState, useRecoilRefresher_UNSTABLE } from "recoil";
import { useNavigate } from "react-router-dom";
import { atom } from "recoil";
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from "../config/api";
import { userSelector } from "../Component/atoms/atoms";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

const ErrorAtom = atom<number | null>({
  key: "errorAtom",
  default: null,
});

const RateLimitAtom = atom<number | null>({
  key: "rateLimitAtom",
  default: null,
});

type Step = "email" | "login" | "register" | "reset";





export default function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);  
  const [toast, setToast] = useState<ToastProps>({ message: '', type: 'success', isVisible: false });
  const [Error, SetError] = useRecoilState(ErrorAtom);
  const [rateLimitExpiry, setRateLimitExpiry] = useRecoilState(RateLimitAtom);
  
  // Add refresher to update user data after login
  const refreshUser = useRecoilRefresher_UNSTABLE(userSelector);
  
  // Shared toast function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
  };

  // Check if email exists
  const handleEmailSubmit = async (enteredEmail: string) => {
    setEmail(enteredEmail);
    try {
      const res = await axios.get(`${API_URL}/api/user/check`, {
        params: { email: enteredEmail },
      });
      setStep(res.data.exist ? "login" : "register");
      
    } catch (err) {
      console.error("Error checking email:", err);
      showToast("Error checking email. Try again.", "error");
    }
  };

  // Handle password login
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        showToast("Logged in successfully!", "success");
        
        refreshUser();
        
        setTimeout(() => window.location.href = '/courses', 1000);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      
      if (err.response?.status === 429) {
        const expiryTime = Date.now() + 2 * 60 * 1000;
        setRateLimitExpiry(expiryTime);
        showToast("Too many attempts. Please wait 2 minutes.", "error");
      } else if (err.response?.status === 401) {
        SetError(401);
        showToast("Invalid password.", "error");
      } else {
        showToast("Login failed. Please try again.", "error");
      }
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/send-otp`, { email });
      
      if (res.status === 200) {
        showToast("OTP sent to your email!", "success");
        setIsOtpSent(true);
        
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      
      if (err.response?.status === 404) {
        showToast("Email not registered.", "error");
      } else if (err.response?.status === 429) {
        const expiryTime = Date.now() + 2 * 60 * 1000;
        setRateLimitExpiry(expiryTime);
        showToast("Too many requests. Please wait 2 minutes.", "error");
      } else {
        showToast("Failed to send OTP. Try again.", "error");
      }
    }
  };

  // Handle Registration without OTP
  const handleRegister = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        email,
        username,
        password,
      });

      if (res.status === 200 || res.status === 201) {
        // Get token from response body
        const token = res.data.token;
        localStorage.setItem("token", token);
        showToast("Account created successfully!", "success");
        
        // Refresh user selector to update sidebar immediately
        refreshUser();
        
        setTimeout(() => {
          navigate('/courses');
        }, 1500);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        const expiryTime = Date.now() + 2 * 60 * 1000;
        setRateLimitExpiry(expiryTime);
        showToast("Too many attempts. Please wait 2 minutes.", "error");
      } else if (err.response?.status === 400) {
        showToast(err.response?.data?.error || "Registration failed.", "error");
      } else if (err.response?.status === 409) {
        showToast("Email or username already exists.", "error");
      } else {
        showToast("Registration failed. Please try again.", "error");
      }
    }
  };

  // Verify OTP (only for password reset)
  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp,
        work: step
      });

      if (step === "reset" && res.status === 200) {
        showToast("Password reset successfully!", "success");
        setTimeout(() => {
          setStep("login");
        }, 1500);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        showToast("Invalid OTP. Please try again.", "error");
      } else if (err.response?.status === 404) {
        showToast("OTP not found or expired.", "error");
      } else if (err.response?.status === 410) {
        showToast("OTP expired. Request a new one.", "error");
      } else if (err.response?.status === 429) {
        showToast("Too many attempts. Request a new OTP.", "error");
        const expiryTime = Date.now() + 2 * 60 * 1000;
        setRateLimitExpiry(expiryTime);
      } else if (err.response?.status === 400) {
        showToast(err.response?.data?.error || "Verification failed.", "error");
      } else {
        showToast("Verification failed. Try again.", "error");
      }
    }
  };
    
        
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {step === "email" && (
          <EmailForm 
            email={email}
            setEmail={setEmail}
            onNext={handleEmailSubmit} 
          />
        )}
        
        {step === "login" && (
          <LoginForm 
            email={email}
            password={password}
            setStep={setStep}
            setPassword={setPassword}
            onLogin={handleLogin}
            rateLimitExpiry={rateLimitExpiry}
            error={Error}
            setError={SetError}
          />
        )}
        {step === "reset" && (
          <ResetForm
            email={email}
            password={password}
            setPassword={setPassword}
            otp={otp}
            setOtp={setOtp}
            onResetPassword={handleVerifyOTP}
            onSendOTP={handleSendOTP}
            rateLimitExpiry={rateLimitExpiry}
            isOtpSent={isOtpSent}
          />
        )}

        {step === "register" && (
          <RegisterForm 
            email={email}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            confirmPass={confirmPass}
            setConfirmPass={setConfirmPass}
            onRegister={handleRegister}
            rateLimitExpiry={rateLimitExpiry}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-xl backdrop-blur-sm ${
              toast.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
            } text-white z-50 font-medium`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


const emailSchema = z.string().email("Invalid email address");

// Reusable timer hook
function useRateLimitTimer(rateLimitExpiry: number | null) {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!rateLimitExpiry) {
      setRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, rateLimitExpiry - now);
      setRemainingTime(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [rateLimitExpiry]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return { remainingTime, formatTime, isRateLimited: remainingTime > 0 };
}

interface EmailFormProps {
  email: string;
  setEmail: (email: string) => void;
  onNext: (email: string) => void;
}

function EmailForm({ email, setEmail, onNext }: EmailFormProps) {
  const [error, setError] = useState<string>("");

  const handleNext = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError("Invalid Email");
      return;
    }
    setError("");
    onNext(result.data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 text-sm">Enter your email to continue</p>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(emailSchema.safeParse(e.target.value).success ? "" : "");
            }}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
              error || (!emailSchema.safeParse(email).success && email)
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300 focus:border-slate-600 bg-gray-50"
            }`}
          />
        </div>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {/* Submit Button */}
      <button
        disabled={!email || !emailSchema.safeParse(email).success}
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg"
      >
        Continue
      </button>
    </motion.div>
  );
}

interface LoginFormProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  rateLimitExpiry: number | null;
  error: number | null;
  setError: (error: number | null) => void;
  setStep: (step: Step) => void;
}

function LoginForm({ email, password, setPassword, onLogin, rateLimitExpiry, error, setError, setStep }: LoginFormProps) {
  const { remainingTime, formatTime, isRateLimited } = useRateLimitTimer(rateLimitExpiry);
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = () => {
    setStep("email");
    setPassword("");
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 text-sm">{email}</p>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            disabled={isRateLimited}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              (password.length < 6 && password) || error === 401
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300 focus:border-slate-600 bg-gray-50"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error === 401 && <p className="text-sm text-red-600 font-medium">Incorrect password. Please try again.</p>}
        {password.length < 6 && password && <p className="text-sm text-red-600 font-medium">Password must be at least 6 characters</p>}
      </div>

      {/* Forgot Password Link */}
      <button
        onClick={() => {
          handleReset();
        }}
        disabled={isRateLimited}
        className="text-slate-600 hover:text-slate-700 text-sm font-semibold transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        Forgot password?
      </button>

      {/* Rate Limit Warning */}
      {isRateLimited && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <p className="text-sm text-red-700 font-medium">
            Too many attempts. Please wait {formatTime(remainingTime)}
          </p>
        </motion.div>
      )}

      {/* Login Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onLogin}
        disabled={isRateLimited || password.length < 6}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
      >
        {isRateLimited ? `Wait ${formatTime(remainingTime)}` : 'Login'}
      </motion.button>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Don't have an account?{' '}
          <button
            onClick={() => setStep("email")}
            className="text-slate-600 hover:text-slate-700 font-semibold transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
}

interface RegisterFormProps {
  email: string;
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPass: string;
  setConfirmPass: (confirmPass: string) => void;
  onRegister: () => void;
  rateLimitExpiry: number | null;
}

function RegisterForm({
  email,
  username,
  setUsername,
  password,
  setPassword,
  confirmPass,
  setConfirmPass,
  onRegister,
  rateLimitExpiry
}: RegisterFormProps) {
  const [available, setAvailable] = useState<boolean | null>(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { remainingTime, formatTime, isRateLimited } = useRateLimitTimer(rateLimitExpiry);

  function debounce(func: Function, delay: number): Function {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  function checkUsername(username: string) {
    const fetchUsername = async () => {
      try {
        const exist = await axios.get(`${API_URL}/api/user/check-username?username=${username}`);
        setAvailable(exist.data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setAvailable(false);
      }
    };
    fetchUsername();
  }

  const debouncedCheck = useMemo(() => debounce(checkUsername, 500), []);

  useEffect(() => {
    if (username.length >= 4 && !username.includes(" ")) {
      debouncedCheck(username);
    }
  }, [username]);

  const isValid = username.length >= 4 && !username.includes(" ") && available && password.length >= 6 && confirmPass === password && !isRateLimited;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-2xl p-8 space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 text-sm">{email}</p>
      </div>

      {/* Username Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Username</label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isRateLimited}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              username.includes(" ") || (username.length >= 4 && !available)
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : username.length >= 4 && available
                ? "border-green-500 focus:border-green-500 bg-green-50"
                : "border-gray-300 focus:border-slate-600 bg-gray-50"
            }`}
          />
        </div>
        <div className="text-xs">
          {username.includes(" ") && <p className="text-red-600 font-medium">Username cannot contain spaces</p>}
          {username.length < 4 && username && <p className="text-gray-600">At least 4 characters needed</p>}
          {username.length >= 4 && available && <p className="text-green-600 font-medium">✓ Username available</p>}
          {username.length >= 4 && !available && <p className="text-red-600 font-medium">Username already taken</p>}
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isRateLimited}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              password.length < 6 && password
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300 focus:border-slate-600 bg-gray-50"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {password.length < 6 && password && <p className="text-xs text-red-600 font-medium">At least 6 characters</p>}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            disabled={isRateLimited}
            className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
              confirmPass !== password && confirmPass
                ? "border-red-500 focus:border-red-500 bg-red-50"
                : "border-gray-300 focus:border-slate-600 bg-gray-50"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {confirmPass !== password && confirmPass && <p className="text-xs text-red-600 font-medium">Passwords don't match</p>}
      </div>

      {/* Rate Limit Warning */}
      {isRateLimited && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p className="text-sm text-red-700 font-medium">
            Too many attempts. Please wait {formatTime(remainingTime)}
          </p>
        </motion.div>
      )}

      {/* Register Button - Direct registration without OTP */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRegister()}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
      >
        Create Account
      </motion.button>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => {
              setUsername('');
              setPassword('');
              setConfirmPass('');
            }}
            className="text-slate-600 hover:text-slate-700 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
}


interface ResetFormProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  onResetPassword: () => void;
  onSendOTP: () => void;
  rateLimitExpiry: number | null;
  isOtpSent: boolean;
}

function ResetForm({ email, password, setPassword, otp, setOtp, onResetPassword, onSendOTP, rateLimitExpiry, isOtpSent }: ResetFormProps) {
  const [newPassword, setNewPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { remainingTime, formatTime: formatRateLimitTime, isRateLimited } = useRateLimitTimer(rateLimitExpiry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-2xl p-8 space-y-5"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-600 text-sm">{email}</p>
      </div>

      {!isOtpSent ? (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <p className="text-sm text-blue-700 font-medium">Sending OTP to your email...</p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSendOTP}
            disabled={isRateLimited}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
          >
            {isRateLimited ? `Wait ${formatRateLimitTime(remainingTime)}` : 'Send OTP'}
          </motion.button>
        </>
      ) : (
        <>
          {/* New Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                  password.length < 6 && password
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-slate-600 bg-gray-50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password.length < 6 && password && <p className="text-xs text-red-600 font-medium">At least 6 characters</p>}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                  password !== newPassword && newPassword
                    ? "border-red-500 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-slate-600 bg-gray-50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password !== newPassword && newPassword && <p className="text-xs text-red-600 font-medium">Passwords don't match</p>}
          </div>

          {/* OTP Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Verification Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`w-full px-4 py-3 rounded-lg border-2 text-center text-2xl tracking-widest font-semibold transition-colors focus:outline-none ${
                otp.length !== 6 && otp
                  ? "border-red-500 focus:border-red-500 bg-red-50"
                  : "border-gray-300 focus:border-slate-600 bg-gray-50"
              }`}
            />
            {otp.length !== 6 && otp && <p className="text-xs text-red-600 font-medium">OTP must be 6 digits</p>}
          </div>

          {/* Rate Limit Warning */}
          {isRateLimited && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-sm text-red-700 font-medium">
                Too many attempts. Please wait {formatRateLimitTime(remainingTime)}
              </p>
            </motion.div>
          )}

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetPassword}
            disabled={isRateLimited || password.length < 6 || password !== newPassword || otp.length < 6}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-lg"
          >
            Reset Password
          </motion.button>

          {/* Resend OTP Button */}
          <button
            onClick={onSendOTP}
            disabled={isRateLimited}
            className="w-full border-2 border-slate-600 text-slate-600 hover:bg-slate-50 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-3 rounded-lg transition-colors"
          >
            Resend OTP
          </button>
        </>
      )}
    </motion.div>
  );
}


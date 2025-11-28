import  { useState, useEffect, useMemo } from "react";
import axios from "axios";
import z  from "zod";
import { Button, TextField } from "@mui/material";
import { useRecoilState, useRecoilRefresher_UNSTABLE } from "recoil";
import { useNavigate } from "react-router-dom";
import { atom } from "recoil";
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from "../config/api";
import { userSelector } from "../Component/atoms/atoms";

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

  // Verify OTP
  const handleVerifyOTP = async () => {
    try {
      if (step === "register" && (username.length >= 4 && password.length >= 6 && confirmPass === password)) {
        
      }
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        username,
        password,
        otp,
        work: step

      });

      
      if (res.status === 200 && step !== "reset") {
        // Get token from response body (not headers)
        const token = res.data.token;
        localStorage.setItem("token", token);
        showToast("OTP verified successfully!", "success");
        
        // Refresh user selector to update sidebar immediately
        refreshUser();
        
        setTimeout(() => {
          navigate('/courses');
        }, 1500);
      }
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
    <div className="min-h-screen flex items-center justify-center" style={{ padding: 20 }}>
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
          onSendOTP={handleSendOTP}
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
          onRegister={handleSendOTP}
          rateLimitExpiry={rateLimitExpiry}
          otp={otp}
          setOtp={setOtp}
          onRegister2={handleVerifyOTP}
          isOtpSent={isOtpSent}
        />
      )}



      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white z-50`}
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
    <div>
      <h3>Enter your Email</h3>
      <TextField
        label="Email"
        type="email"
        fullWidth
        variant="outlined"
        margin="normal"
        placeholder="Email"
        helperText={error}
        color={emailSchema.safeParse(email).success ? "primary" : "error"}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(emailSchema.safeParse(e.target.value).success ? "" : "Enter a valid email");
        }}
      />
      <br />
      <Button
        disabled={!email || !emailSchema.safeParse(email).success}
        variant="contained"
        onClick={handleNext}
      >
        Next
      </Button>
    </div>
  );
}

interface LoginFormProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
  onSendOTP: () => void;
  rateLimitExpiry: number | null;
  error: number | null;
  setError: (error: number | null) => void;
  setStep: (step: Step) => void;
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
function LoginForm({ email, password, setPassword, onLogin, onSendOTP, rateLimitExpiry, error, setError, setStep }: LoginFormProps) {
  const { remainingTime, formatTime, isRateLimited } = useRateLimitTimer(rateLimitExpiry);

  return (
    <div>
      <h3>Welcome back, {email}</h3>
      <TextField
        label="Password"
        type="password"
        color={password.length < 6 || error !== null || isRateLimited ? "error" : "primary"}
        helperText={
          isRateLimited 
            ? `Too many attempts. Retry in ${formatTime(remainingTime)}` 
            : password.length < 6 
              ? "Password must be at least 6 characters" 
              : error === 401
                ? "Incorrect Password" 
                : ""
        }
        fullWidth
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        disabled={isRateLimited}
      />
      <br />
      <a 
        onClick={isRateLimited ? undefined : ()=>{onSendOTP()
          setStep("reset")
        }}
        style={{ 
          marginTop: 10, 
          cursor: isRateLimited ? 'not-allowed' : 'pointer', 
          display: 'block', 
          textAlign: 'right',
          opacity: isRateLimited ? 0.5 : 1,
          pointerEvents: isRateLimited ? 'none' : 'auto'
        }}
      >
        Forget Password..
      </a>

      <Button 
        onClick={onLogin}
        disabled={isRateLimited || password.length < 6}
        variant="contained"
        fullWidth
        style={{ marginTop: 10 }}
      >
        {isRateLimited ? `Wait ${formatTime(remainingTime)}` : 'Login'}
      </Button>

    </div>
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
  otp: string;
  setOtp: (otp: string) => void;
  onRegister2: () => void;
  isOtpSent: boolean;

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
  rateLimitExpiry,
  otp,
  setOtp,
  onRegister2,
  isOtpSent
}: RegisterFormProps) {
  const [available, setAvailable] = useState<boolean | null>(true);
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

    console.log("Checking:", username);

      const fetchUsername = async () => {
        try {
          const exist = await axios.get(`${API_URL}/api/user/check-username?username=${username}`);
          setAvailable(exist.data.available);
          console.log("Available:", exist.data.available);
        } catch (error) {
          console.error('Error checking username:', error);
          setAvailable(false);
        }
      }
      fetchUsername();
    
  }

const debouncedCheck = useMemo(() => debounce(checkUsername, 500), []);

useEffect(() => {
  if (username.length >= 4 && !username.includes(" ") )
  debouncedCheck(username);
}, [username]);
 

  const isValid = username.length >= 4 && !username.includes(" ") && available && password.length >= 6 && confirmPass === password && !isRateLimited;

  return (
    <div>
      <h3>Create account with {email}</h3>
      <div style={{ padding: '20px', marginTop: '30px' }}>
        <TextField
          label="Username"
          color={username.length < 4 || isRateLimited || username.includes(" ")  ? "error" : available ? "primary" : "error"}
          helperText={
            username.includes(" ")
            ? "Username cannot contain spaces"
            : isRateLimited 
              ? `Too many attempts. Retry in ${formatTime(remainingTime)}`
              : username.length < 4 
                ? "Username must be at least 4 characters" 
                : available 
                  ? "Username is available" 
                  : "Username is taken"
          }
          fullWidth
          variant="outlined"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isRateLimited}
        />
        
        <TextField
          label="Password"
          type="password"
          color={password.length < 6 || isRateLimited ? "error" : "primary"}
          helperText={password.length < 6 ? "Password must be at least 6 characters" : ""}
          fullWidth
          variant="outlined"
          margin="normal"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isRateLimited}
        />
        
        <TextField
          label="Confirm Password"
          type="password"
          color={confirmPass !== password || isRateLimited ? "error" : "primary"}
          helperText={confirmPass === password ? "" : "Passwords do not match"}
          fullWidth
          variant="outlined"
          margin="normal"
          placeholder="Confirm Password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          disabled={isRateLimited}
        />
        
        <Button
          onClick={() => {onRegister();}}
          variant="contained"
          fullWidth
          disabled={!isValid}
          style={{ marginTop: 10 }}
        >
          {isRateLimited ? `Wait ${formatTime(remainingTime)}` : 'Get OTP'}
        </Button>

        <TextField
          label="Enter OTP"
          type="text"
          color={otp.length !== 6 ? "error" : "primary"}
          helperText={otp.length === 6 ? "" : "OTP must be 6 digits"}
          fullWidth
          disabled={!isOtpSent || isRateLimited}
          variant="outlined"
          margin="normal"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          
        />
        <Button
          onClick={() => {onRegister2();}}
          variant="contained"
          fullWidth
          disabled={otp.length !== 6 || isRateLimited || !isOtpSent}
          style={{ marginTop: 10 }}
        >
          {isRateLimited ? `Wait ${formatTime(remainingTime)}` : 'Register'}
        </Button>


      </div>
    </div>
  );
}


function ResetForm({ email, password, setPassword, otp, setOtp, onResetPassword, onSendOTP, rateLimitExpiry,isOtpSent }: ResetFormProps) {
  const [newPassword, setNewPassword] = useState<string>("");
  const { remainingTime, formatTime: formatRateLimitTime, isRateLimited } = useRateLimitTimer(rateLimitExpiry);

  return (
    <div className="flex flex-col">
      <div>Reset Form</div>
      <h3>Reset Password for {email}</h3>
      <h4>OTP has been sent</h4>
      <TextField
        label="New Password"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        label="Confirm Password"
        variant="outlined"
        fullWidth
        color={password === newPassword ? "primary" : "error"}
        margin="normal"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        label="OTP"
        variant="outlined"
        fullWidth
        margin="normal"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        disabled={!isOtpSent}
      />
      {isRateLimited && (
        <div>Too many attempts. Try again later in {formatRateLimitTime(remainingTime)}</div>
      )}
      <Button
        onClick={onResetPassword}
        variant="contained"
        fullWidth
        disabled={isRateLimited || password.length < 6 || password !== newPassword || otp.length < 6}
        style={{ marginTop: 10 }}
      >
        Reset Password
      </Button>
      <Button
        onClick={onSendOTP}
        variant="outlined"
        color="primary"
        fullWidth
        style={{ marginTop: 10 }}
      >
        Resend OTP
      </Button>
      </div>
    
  );
}


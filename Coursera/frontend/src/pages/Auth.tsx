import React, { useState ,useEffect} from "react";
import axios from "axios";
import z from "zod";
import { Button, TextField } from "@mui/material";


type Step = "email" | "login" | "register";

export default function AuthPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");

  const handleEmailSubmit = async (enteredEmail: string) => {
   
   
    setEmail(enteredEmail);
    //alert("Email submitted: " + enteredEmail);
    try {
      const res = await axios.get("http://localhost:5000/api/user/check", {
        params: { email: enteredEmail },
      });
      setStep(res.data.exist ? "login" : "register");
    } catch (err) {
      console.error("Error checking email:", err);
      alert( "Error checking email");
    }
  };

  const handleLogin = async (password: string) => {
    try {
      
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
     
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", res.data.user);

      alert("Logged in successfully!");
      
      window.location.href = "/";
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid password.");
    }
  };

  const handleRegister = async (username: string, password: string, confirmPass: string) => {
    if (password !== confirmPass) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        email,
        username,
        password,
      });
      if (res.status !== 201) {
        throw new Error("Registration failed");}
        localStorage.setItem("token", res.data.token);  
      //alert("Registration successful!");
      window.location.href = "/";
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Try again.");
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center"
    style={{ display: "flex", justifyContent: "center", padding: 20 }}>
      {step === "email" && (
        <EmailForm onNext={handleEmailSubmit} />
      )}
      {step === "login" && (
        <LoginForm email={email} onLogin={handleLogin} />
      )}
      {step === "register" && (
        <RegisterForm email={email} onRegister={handleRegister} />
      )}
    </div>
  );
}

const emailSchema = z.string().email("Invalid email address");

function EmailForm({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string>("");

  const handleNext = () => {
    const result = emailSchema.safeParse(email);
    console.log("Email validation result:", result);
    if (!result.success) {
      setError("Invalid Email"); // show Zod error
      return;
    }
    setError(""); // clear error
    onNext(result.data); // result.data is the validated email
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
          {emailSchema.safeParse(e.target.value).success ? setError("") : setError("enter a valid email")};
        }}
      />
      <br />
      <Button
        disabled={!email || emailSchema.safeParse(email).success === false}
        variant="contained"
        onClick={handleNext}
      >
        Next
      </Button>
      {/*<button onClick={()=> onNext(email)}>Next</button>*/}
    </div>
  );
}


function LoginForm({ email, onLogin }: { email: string; onLogin: (password: string) => void }) {
  const [password, setPassword] = useState<string>("");

  return (
    <div>
      <h3>Welcome back, {email}</h3>
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <Button onClick={() => onLogin(password)}>Login</Button>
    </div>
  );
}


function RegisterForm({
  email,
  onRegister,
}: {
  email: string;
  onRegister: (username: string, password: string, confirmPass: string) => void;
}) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
    const [available, setAvailable] = useState<boolean | null>(true);

    const BASE_URL = "http://localhost:5000";

    useEffect(() => {
        if (username.length > 3) {
            const fetchUsername = async () => {
                try {
                    const exist = await axios.get(`${BASE_URL}/api/user/check-username?username=${username}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setAvailable(exist.data.available);
                } catch (error) {
                    console.error('Error checking username:', error);
                    setAvailable(false);
                }
            };
            fetchUsername();
        }
    }, [username]);


  return (
    <div>
      <h3>Create account with {email}</h3>
                <div style={{ padding: '20px', marginTop: '30px' }}>
                    <TextField
                        label="Username"
                        color={username.length < 4 ? "error" : available ? "primary" : "error"}
                        helperText={username.length < 4 ? "Username must be at least 4 characters" : available ? "Username is available" : "Username is taken"}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
     
      <TextField
        label="Password"
        type="password"
        color = {password.length < 6 ? "error" : "primary"}
        helperText={password.length < 6 ? "Password must be at least 6 characters" : ""}
        fullWidth
        variant="outlined"
        margin="normal"
        placeholder="Password"
        
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <TextField
        label="Confirm Password"
        type="password"
        color = {confirmPass!==password ? "error" : "primary"}
        helperText={confirmPass===password ? "" : "Passwords do not match"}
        fullWidth
        variant="outlined"
        margin="normal"
        placeholder="Confirm Password"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
      />
      <br />
<Button
        onClick={() => onRegister(username, password, confirmPass)}
        variant="contained"
        disabled={username.length < 4 || !available || password.length < 6 || confirmPass !== password}
      >
        Register
      </Button>    
    </div>
    </div>
  );
}

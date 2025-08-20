import React, { useState } from "react";
import axios from "axios";
import z from "zod";


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
      <input
        type="email"
        placeholder="example@mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <br />
      <button onClick={handleNext}>Next</button>
      {/*<button onClick={()=> onNext(email)}>Next</button>*/}
    </div>
  );
}


function LoginForm({ email, onLogin }: { email: string; onLogin: (password: string) => void }) {
  const [password, setPassword] = useState<string>("");

  return (
    <div>
      <h3>Welcome back, {email}</h3>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={() => onLogin(password)}>Login</button>
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

  return (
    <div>
      <h3>Create account with {email}</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPass}
        onChange={(e) => setConfirmPass(e.target.value)}
      />
      <br />
      <button onClick={() => onRegister(username, password, confirmPass)}>Register</button>
    </div>
  );
}

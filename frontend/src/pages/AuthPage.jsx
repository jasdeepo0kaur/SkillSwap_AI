
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
const AuthPage = ({ setUser }) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/auth/login" : "/auth/signup";

    const payload = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication Failed");
      }

      localStorage.setItem("token", data.token);
      setUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b1020",
      }}
    >
      <div className="blob blob1"></div>
    <div className="blob blob2"></div>
    <div className="blob blob3"></div>
 
 {/* Sparkles */}
    <div className="sparkle s1"></div>
    <div className="sparkle s2"></div>
    <div className="sparkle s3"></div>
    <div className="sparkle s4"></div>
    <div className="sparkle s5"></div>
    <div className="sparkle s6"></div>
    <div className="sparkle s7"></div>
    <div className="sparkle s8"></div>

      
    
      <div
       className="auth-box"
        style={{
          width: "420px",
          maxWidth: "90%",
          background: "linear-gradient(145deg, #1b2340, #101728)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#fff",
            marginBottom: "25px",
            textShadow: "0 0 18px rgba(139,92,246,0.6)",
          }}
        >
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        {error && (
          <div
            style={{
              color: "#ff6b6b",
              background: "#2d1a1a",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ color: "#fff" }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  marginTop: "5px",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: "#fff" }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #444",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: "#fff" }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                 border: "1px solid #3a4260",
                background: "#202845",
                color: "#fff",
                marginTop: "5px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#8b5cf6",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#ccc",
          }}
        >
          {isLogin
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#8b5cf6",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
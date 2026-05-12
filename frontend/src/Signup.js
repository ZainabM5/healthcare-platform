import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    // Username validation
    if (username.length < 4) {
      alert("Username must be at least 4 characters");
      return false;
    }

    if (username.length > 15) {
      alert("Username must be less than 15 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      alert("Username can only contain letters, numbers, and underscore");
      return false;
    }

    // Password validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      alert("Password must contain at least one special character");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    // 🔐 FRONTEND VALIDATION
    if (!validateInput()) return;

    try {
      setLoading(true);

      const response = await fetch("http://13.61.152.142:8000/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        alert("Signup failed");
        return;
      }

      const data = await response.json();
      setLoading(false);

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("is_admin", false);

        alert("Account created successfully 🎉");
        window.location.href = "/dashboard";
      }

    } catch (error) {
      setLoading(false);
      console.error(error);
      alert("Server error");
    }
  };

  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to right, #667eea, #764ba2)",
    },
    box: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
      textAlign: "center",
      width: "320px",
    },
    title: {
      marginBottom: "10px",
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "15px",
      opacity: loading ? 0.7 : 1,
    },
    link: {
      marginTop: "15px",
      display: "block",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>🏥 Healthcare App</h1>
        <h2 style={styles.title}>Create Account</h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p style={styles.link}>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
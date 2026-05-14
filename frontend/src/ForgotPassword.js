import { useState } from "react";

// ✅ API URL
const API_URL = process.env.REACT_APP_API_URL;

function ForgotPassword() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/forgot-password/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            new_password: password,
          }),
        }
      );

      const data = await response.json();

      setLoading(false);

      // ✅ HANDLE VALIDATION ERRORS
      if (data.error) {
        alert(data.error);
        return;
      }

      // ✅ SUCCESS
      alert("Password reset successful ✅");

      window.location.href = "/";

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

      background:
        "linear-gradient(to right, #667eea, #764ba2)",
    },

    box: {
      backgroundColor: "white",

      padding: "30px",

      borderRadius: "12px",

      boxShadow:
        "0 8px 20px rgba(0,0,0,0.2)",

      textAlign: "center",

      width: "320px",
    },

    title: {
      marginBottom: "15px",

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

      marginTop: "10px",

      backgroundColor: "#667eea",

      color: "white",

      border: "none",

      borderRadius: "6px",

      cursor: "pointer",

      fontSize: "15px",

      opacity: loading ? 0.7 : 1,
    },

    backLink: {
      marginTop: "15px",

      display: "block",

      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>

      <div style={styles.box}>

        <h1 style={styles.title}>
          🔐 Forgot Password
        </h1>

        <input
          style={styles.input}

          type="text"

          placeholder="Username"

          value={username}

          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          style={styles.input}

          type="password"

          placeholder="New Password"

          value={password}

          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          style={styles.button}

          onClick={handleReset}

          disabled={loading}
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>

        <p style={styles.backLink}>
          <a href="/">
            ← Back to Login
          </a>
        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;
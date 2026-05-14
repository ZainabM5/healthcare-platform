import { useState } from "react";

// ✅ API URL
const API_URL = process.env.REACT_APP_API_URL;

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/login/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      if (!response.ok) {
        setLoading(false);
        alert("Login failed");
        return;
      }

      const data = await response.json();

      setLoading(false);

      console.log("Response:", data);

      if (data.token) {

        // ✅ Save auth
        localStorage.setItem("token", data.token);

        localStorage.setItem(
          "is_admin",
          data.is_admin
        );

        // 🔀 Redirect
        if (data.is_admin) {
          window.location.href = "/admin";

        } else {
          window.location.href = "/dashboard";
        }

      } else {
        alert(
          data.error ||
          "Invalid username or password"
        );
      }

    } catch (error) {

      setLoading(false);

      console.error("ERROR:", error);

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
      backgroundColor: "#667eea",
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

    forgot: {
      marginTop: "10px",
      color: "#667eea",
      cursor: "pointer",
      fontSize: "14px",
    },

    hint: {
      fontSize: "12px",
      color: "#777",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>

      <div style={styles.box}>

        <h1 style={styles.title}>
          🏥 Healthcare App
        </h1>

        <h2 style={styles.title}>
          Login
        </h2>

        <input
          style={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

        {/* 🔑 Forgot Password */}
        <p
          style={styles.forgot}
          onClick={() =>
            (window.location.href =
              "/forgot-password")
          }
        >
          Forgot Password?
        </p>

        {/* 🔗 Signup */}
        <p style={styles.link}>
          New user?
          {" "}
          <a href="/signup">
            Sign up here
          </a>
        </p>

        {/* 💡 Hint */}
        <p style={styles.hint}>
          Admin users will be redirected automatically
        </p>

      </div>

    </div>
  );
}

export default Login;
import { useState, useEffect, useCallback } from "react";

function AdminDashboard() {
  const [name, setName] = useState("");
  const [patients, setPatients] = useState("");
  const [wait, setWait] = useState("");
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);

  // ✅ API URL
  const API_URL = process.env.REACT_APP_API_URL;

  // 🔐 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // 🔐 Secure fetch
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Session expired. Please login.");
      window.location.href = "/";
      return null;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Token ${token}`,
        ...(options.headers || {}),
      },
    });

    if (response.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/";
      return null;
    }

    return response;
  }, []);

  // 🔒 Protect page
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  }, []);

  // 🏥 Fetch hospitals
  const fetchHospitals = useCallback(async () => {
    try {
      const response = await authFetch(`${API_URL}/hospitals/`);

      if (!response) return;

      const data = await response.json();
      setHospitals(data);

    } catch (error) {
      console.error(error);
      alert("Failed to load hospitals");
    }
  }, [authFetch, API_URL]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // ➕ Add hospital
  const handleAdd = async () => {
    if (!name || !patients || !wait) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await authFetch(
        `${API_URL}/add-hospital/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            current_patients: parseInt(patients),
            current_wait: parseInt(wait),
          }),
        }
      );

      if (!response) return;

      const data = await response.json();

      setLoading(false);

      if (data.error) {
        alert(data.error);
      } else {
        alert("Hospital added successfully ✅");

        setName("");
        setPatients("");
        setWait("");

        fetchHospitals();
      }

    } catch (error) {
      setLoading(false);
      console.error(error);
      alert("Server error");
    }
  };

  // 🗑 Delete hospital
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hospital?")) return;

    try {
      const response = await authFetch(
        `${API_URL}/delete-hospital/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response) return;

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Deleted successfully");

        setHospitals(
          hospitals.filter((h) => h.id !== id)
        );
      }

    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  // ✏️ Edit hospital
  const handleEdit = async (hospital) => {
    const newName = prompt("Enter hospital name", hospital.name);
    const newPatients = prompt(
      "Enter patients",
      hospital.current_patients
    );
    const newWait = prompt(
      "Enter wait time",
      hospital.current_wait
    );

    if (!newName || !newPatients || !newWait) return;

    try {
      const response = await authFetch(
        `${API_URL}/update-hospital/${hospital.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName,
            current_patients: parseInt(newPatients),
            current_wait: parseInt(newWait),
          }),
        }
      );

      if (!response) return;

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Updated successfully ✅");

        setHospitals(
          hospitals.map((h) =>
            h.id === hospital.id
              ? {
                  ...h,
                  name: newName,
                  current_patients: newPatients,
                  current_wait: newWait,
                }
              : h
          )
        );
      }

    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  const styles = {
    container: {
      padding: "30px",
      maxWidth: "700px",
      margin: "auto",
      textAlign: "center",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },

    logoutBtn: {
      backgroundColor: "red",
      color: "white",
      border: "none",
      padding: "10px 15px",
      cursor: "pointer",
      borderRadius: "6px",
    },

    input: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },

    button: {
      width: "100%",
      padding: "12px",
      marginTop: "15px",
      backgroundColor: "#667eea",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },

    list: {
      marginTop: "40px",
      textAlign: "left",
    },

    card: {
      padding: "15px",
      marginBottom: "15px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
    },

    actionBtn: {
      marginTop: "10px",
      marginRight: "10px",
      padding: "8px 12px",
      cursor: "pointer",
      border: "none",
      borderRadius: "5px",
    },
  };

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h1>🛠 Admin Dashboard</h1>

        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <input
        style={styles.input}
        placeholder="Hospital name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        style={styles.input}
        type="number"
        placeholder="Patients"
        value={patients}
        onChange={(e) => setPatients(e.target.value)}
      />

      <input
        style={styles.input}
        type="number"
        placeholder="Wait time"
        value={wait}
        onChange={(e) => setWait(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={handleAdd}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Hospital"}
      </button>

      <div style={styles.list}>
        <h2>🏥 Hospitals</h2>

        {hospitals.map((h) => (
          <div key={h.id} style={styles.card}>

            <h3>{h.name}</h3>

            <p>
              👥 Patients: {h.current_patients}
            </p>

            <p>
              ⏳ Wait Time: {h.current_wait} mins
            </p>

            <button
              style={{
                ...styles.actionBtn,
                backgroundColor: "#667eea",
                color: "white",
              }}
              onClick={() => handleEdit(h)}
            >
              ✏️ Edit
            </button>

            <button
              style={{
                ...styles.actionBtn,
                backgroundColor: "red",
                color: "white",
              }}
              onClick={() => handleDelete(h.id)}
            >
              🗑 Delete
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminDashboard;
import { useState, useEffect, useCallback } from "react";

function AdminDashboard() {
  const [name, setName] = useState("");
  const [patients, setPatients] = useState("");
  const [wait, setWait] = useState("");
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);

  // 🔐 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // 🔐 Centralized secure fetch (FIXED)
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

  // 🔐 Protect page
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  }, []);

  // 🏥 Fetch hospitals
  const fetchHospitals = useCallback(async () => {
    const response = await authFetch("http://13.61.152.142:8000/hospitals/");
    if (!response) return;

    const data = await response.json();
    setHospitals(data);
  }, [authFetch]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // ➕ ADD
  const handleAdd = async () => {
    if (!name || !patients || !wait) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await authFetch(
        "http://13.61.152.142:8000/add-hospital/",
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
      alert("Server error");
    }
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hospital?")) return;

    const response = await authFetch(
      `http://13.61.152.142:8000/delete-hospital/${id}/`,
      { method: "DELETE" }
    );

    if (!response) return;

    const data = await response.json();

    if (data.error) {
      alert(data.error);
    } else {
      alert("Deleted successfully");
      setHospitals(hospitals.filter((h) => h.id !== id));
    }
  };

  // ✏️ EDIT
  const handleEdit = async (hospital) => {
    const newName = prompt("Enter name", hospital.name);
    const newPatients = prompt("Enter patients", hospital.current_patients);
    const newWait = prompt("Enter wait", hospital.current_wait);

    if (!newName || !newPatients || !newWait) return;

    const response = await authFetch(
      `http://13.61.152.142:8000/update-hospital/${hospital.id}/`,
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
      alert("Updated successfully");

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
  };

  const styles = {
    container: {
      padding: "30px",
      maxWidth: "600px",
      margin: "auto",
      textAlign: "center",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoutBtn: {
      backgroundColor: "red",
      color: "white",
      border: "none",
      padding: "8px 12px",
      cursor: "pointer",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginTop: "10px",
    },
    button: {
      width: "100%",
      padding: "10px",
      marginTop: "15px",
      backgroundColor: "#667eea",
      color: "white",
      border: "none",
      cursor: "pointer",
    },
    list: {
      marginTop: "30px",
      textAlign: "left",
    },
    actionBtn: {
      marginTop: "5px",
      marginRight: "5px",
      padding: "5px 10px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛠 Admin Dashboard</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
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

      <button style={styles.button} onClick={handleAdd}>
        {loading ? "Adding..." : "Add Hospital"}
      </button>

      <div style={styles.list}>
        <h3>Hospitals</h3>

        {hospitals.map((h) => (
          <div key={h.id}>
            <strong>{h.name}</strong> — {h.current_patients} patients — {h.current_wait} mins
            <br />

            <button
              style={styles.actionBtn}
              onClick={() => handleEdit(h)}
            >
              ✏️ Edit
            </button>

            <button
              style={{ ...styles.actionBtn, backgroundColor: "red", color: "white" }}
              onClick={() => handleDelete(h.id)}
            >
              🗑 Delete
            </button>

            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
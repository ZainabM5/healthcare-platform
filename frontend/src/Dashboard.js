import { useState, useEffect } from "react";
import "./Dashboard.css";

// 🔐 Centralized secure fetch
const authFetch = async (url, options = {}) => {
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
};

function Dashboard() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [patients, setPatients] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // 🔐 Protect page
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
    }
  }, []);

  // 🏥 Fetch hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await authFetch(
          "http://13.61.152.142:8000/hospitals/"
        );

        if (!response) {
          setLoadingHospitals(false);
          return;
        }

        if (!response.ok) {
          alert("Failed to load hospitals");
          setLoadingHospitals(false);
          return;
        }

        const data = await response.json();

        setHospitals(data);
        setLoadingHospitals(false);

      } catch (error) {
        console.error(error);
        alert("Error loading hospitals");
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  // 🎯 Wait category
  const getWaitLevel = (wait) => {
    if (wait < 40) return { label: "Low", color: "green" };
    if (wait < 80) return { label: "Medium", color: "orange" };
    return { label: "High", color: "red" };
  };

  // 🤖 Prediction
  const handlePredict = async () => {
    if (!selectedHospital) {
      alert("Please select a hospital first");
      return;
    }

    const newPatients = parseInt(patients);

    if (!newPatients || newPatients <= 0) {
      alert("Please enter a valid patient count");
      return;
    }

    if (newPatients <= selectedHospital.current_patients) {
      alert(`Enter > ${selectedHospital.current_patients}`);
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await authFetch(
        `http://13.61.152.142:8000/predict/?patients=${newPatients}&current_patients=${selectedHospital.current_patients}&current_wait=${selectedHospital.current_wait}`
      );

      if (!response) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        alert("Prediction failed");
        setLoading(false);
        return;
      }

      const data = await response.json();

      setLoading(false);

      if (data.error) {
        alert(data.error);
        return;
      }

      setResult(data);

    } catch (error) {
      setLoading(false);
      console.error(error);
      alert("Prediction failed");
    }
  };

  return (
    <div className="container">
      <h1>🏥 Healthcare Dashboard</h1>

      {/* 🏥 Hospitals */}
      {loadingHospitals ? (
        <p>Loading hospitals...</p>
      ) : hospitals.length === 0 ? (
        <p>No hospitals available</p>
      ) : (
        <div className="hospital-list">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={`card ${
                selectedHospital === hospital ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedHospital(hospital);
                setPatients("");
                setResult(null);
              }}
            >
              <h3>{hospital.name}</h3>
              <p>👥 Patients: {hospital.current_patients}</p>
              <p>⏱ Wait: {hospital.current_wait} mins</p>
            </div>
          ))}
        </div>
      )}

      {/* 📊 Selected */}
      {selectedHospital && (
        <div className="box">
          <h2>{selectedHospital.name}</h2>

          <p>👥 Current Patients: {selectedHospital.current_patients}</p>
          <p>⏱ Current Wait: {selectedHospital.current_wait} mins</p>

          <input
            type="number"
            min={selectedHospital.current_patients + 1}
            placeholder={`Enter > ${selectedHospital.current_patients}`}
            value={patients}
            onChange={(e) => setPatients(e.target.value)}
          />

          <button onClick={handlePredict} disabled={loading}>
            {loading ? "Calculating..." : "⏱ Estimate Wait Time"}
          </button>

          {/* 🔓 Logout */}
          <button
            style={{
              marginTop: "10px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("is_admin");
              window.location.href = "/";
            }}
          >
            🔓 Logout
          </button>

          {result && (
            <>
              <hr />

              <h2 style={{ color: "#667eea" }}>
                ⏱ Estimated Wait: {result.estimated_wait} mins
              </h2>

              {(() => {
                const level = getWaitLevel(result.estimated_wait);

                return (
                  <h3 style={{ color: level.color }}>
                    ● {level.label} Wait
                  </h3>
                );
              })()}

              <p style={{ marginTop: "10px", color: "#555" }}>
                {result.estimated_wait < 40 &&
                  "Quick service expected."}

                {result.estimated_wait >= 40 &&
                  result.estimated_wait < 80 &&
                  "Moderate waiting time due to patient load."}

                {result.estimated_wait >= 80 &&
                  "High demand — longer waiting time expected."}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
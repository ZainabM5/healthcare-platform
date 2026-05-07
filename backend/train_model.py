import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

data = []

# Generate realistic data
for patients in range(10, 301, 10):
    for current_patients in range(10, 301, 20):
        current_wait = current_patients * 0.8  # baseline wait

        # realistic wait formula
        waiting_time = (
            current_wait +
            (patients - current_patients) * 1.5
        )

        # avoid negative
        waiting_time = max(5, waiting_time)

        data.append([
            patients,
            current_patients,
            current_wait,
            waiting_time
        ])

# Create dataframe
df = pd.DataFrame(data, columns=[
    "patients",
    "current_patients",
    "current_wait",
    "waiting_time"
])

# Train model
X = df[["patients", "current_patients", "current_wait"]]
y = df["waiting_time"]

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X, y)

# Save model
joblib.dump(model, "model.pkl")

print("✅ Model trained with realistic generated data!")
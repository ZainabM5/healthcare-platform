from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny

from rest_framework.decorators import api_view, permission_classes
from .models import Hospital

import pandas as pd
import joblib
import os
import re


# 🔒 Load ML model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "model.pkl")
model = joblib.load(model_path)


# 🏠 Home API
@api_view(['GET'])
def home(request):
    return Response({"message": "Healthcare API is running"})


# 🏥 Hospitals API (PROTECTED)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hospitals(request):
    hospitals = Hospital.objects.all()

    data = []
    for h in hospitals:
        data.append({
            "id": h.id,
            "name": h.name,
            "current_wait": h.current_wait,
            "current_patients": h.current_patients
        })

    return Response(data)


# 📊 Load CSV data
@api_view(['GET'])
def data_view(request):
    try:
        df = pd.read_csv('data.csv')
        data = df.head(10).to_dict(orient='records')
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)})


# 🤖 ML Prediction (PROTECTED)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def predict(request):
    try:
        patients = int(request.GET.get('patients', 0))
        current_patients = int(request.GET.get('current_patients', 0))
        current_wait = int(request.GET.get('current_wait', 0))

        if patients <= current_patients:
            return Response({
                "error": "Enter a number greater than current patients"
            })

        # ✅ FIX: Use DataFrame (removes warning)
        import pandas as pd

        input_data = pd.DataFrame([{
            "patients": patients,
            "current_patients": current_patients,
            "current_wait": current_wait
        }])

        ai_prediction = model.predict(input_data)[0]

        change = patients - current_patients

        # 🔥 TREND LOGIC
        trend_wait = current_wait + (change * 1.2)

        # 🤖 COMBINE ML + LOGIC
        estimated_wait = (0.8 * trend_wait) + (0.2 * ai_prediction)

        # ✅ FORCE INCREASE
        min_increase = current_wait + (change * 0.8)
        estimated_wait = max(estimated_wait, min_increase)

        # 🔒 SAFETY
        estimated_wait = max(5, estimated_wait)

        return Response({
            "estimated_wait": round(float(estimated_wait), 2)
        })

    except Exception as e:
        return Response({"error": str(e)})


# 📈 Stats (PROTECTED)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    return Response({
        "avg_wait_time": 30,
        "max_wait_time": 90,
        "min_wait_time": 5
    })

# Signup
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password required"})

    # 🔐 USERNAME VALIDATION (MOVE HERE)
    import re

    if len(username) < 4:
        return Response({"error": "Username must be at least 4 characters"})

    if len(username) > 15:
        return Response({"error": "Username must be less than 15 characters"})

    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return Response({
            "error": "Username can only contain letters, numbers, and underscore"
        })

    # 🔐 PASSWORD VALIDATION
    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters long"})

    if not re.search(r'[A-Z]', password):
        return Response({"error": "Password must contain at least one uppercase letter"})

    if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
        return Response({"error": "Password must contain at least one special character"})

    # 🔁 CHECK USER EXISTS
    if User.objects.filter(username=username).exists():
        return Response({"error": "User already exists"})

    # 👤 CREATE USER
    user = User.objects.create_user(username=username, password=password)
    token = Token.objects.create(user=user)

    return Response({"token": token.key})


# 🔐 Login
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        user = User.objects.get(username=username)

        if user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "token": token.key,
                "is_admin": user.is_staff
            })
        else:
            return Response({"error": "Invalid credentials"})

    except User.DoesNotExist:
        return Response({"error": "User not found"})


# 🛠 ADMIN: Add Hospital (PROTECTED + ADMIN ONLY)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_hospital(request):

    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    name = request.data.get("name")
    patients = request.data.get("current_patients")
    wait = request.data.get("current_wait")

    if not name:
        return Response({"error": "Hospital name required"})

    Hospital.objects.create(
        name=name,
        current_patients=patients,
        current_wait=wait
    )

    return Response({"message": "Hospital added successfully"})
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_hospital(request, id):

    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    try:
        hospital = Hospital.objects.get(id=id)
    except Hospital.DoesNotExist:
        return Response({"error": "Hospital not found"}, status=404)

    hospital.name = request.data.get("name", hospital.name)
    hospital.current_patients = request.data.get("current_patients", hospital.current_patients)
    hospital.current_wait = request.data.get("current_wait", hospital.current_wait)

    hospital.save()

    return Response({"message": "Hospital updated successfully"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_hospital(request, id):

    if not request.user.is_staff:
        return Response({"error": "Admin only"}, status=403)

    try:
        hospital = Hospital.objects.get(id=id)
    except Hospital.DoesNotExist:
        return Response({"error": "Hospital not found"}, status=404)

    hospital.delete()

    return Response({"message": "Hospital deleted successfully"})

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):

    username = request.data.get("username")
    new_password = request.data.get("new_password")

    # 🔐 PASSWORD VALIDATION
    if len(new_password) < 6:
        return Response({
            "error": "Password must be at least 6 characters long"
        })

    if not re.search(r'[A-Z]', new_password):
        return Response({
            "error": "Password must contain at least one uppercase letter"
        })

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
        return Response({
            "error": "Password must contain at least one special character"
        })

    try:
        user = User.objects.get(username=username)

        user.password = make_password(new_password)
        user.save()

        return Response({
            "message": "Password reset successful"
        })

    except User.DoesNotExist:

        return Response({
            "error": "User not found"
        }, status=404)
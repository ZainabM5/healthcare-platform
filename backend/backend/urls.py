from django.contrib import admin
from django.urls import path

from api.views import (
    home,
    data_view,
    predict,
    stats,
    signup,
    login,
    hospitals,
    add_hospital,
    update_hospital,
    delete_hospital,
    forgot_password
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', home),
    path('data/', data_view),
    path('predict/', predict),
    path('stats/', stats),

    # 🔐 AUTH
    path('signup/', signup),
    path('login/', login),
    path('forgot-password/', forgot_password),

    # 🏥 APIs
    path('hospitals/', hospitals),
    path('add-hospital/', add_hospital),

    path('update-hospital/<int:id>/', update_hospital),
    path('delete-hospital/<int:id>/', delete_hospital),
]
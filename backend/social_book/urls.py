"""social_book URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from djoser.urls import jwt
from graphene_django.views import GraphQLView

from django.views.decorators.csrf import csrf_exempt
from graphene_file_upload.django import FileUploadGraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),

    path(r"graphql",   csrf_exempt(FileUploadGraphQLView.as_view(graphiql=True))),

    # You can keep your old GraphQL view here if you have one for non-upload requests
    # path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=True))),

    re_path(r'^auth/', include('djoser.urls')),
    re_path(r'^auth/', include('djoser.urls.jwt')),

    # YOUR PATTERNS
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns = urlpatterns+static(settings.MEDIA_URL,
# document_root=settings.MEDIA_ROOT)
    
    
# path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
# path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
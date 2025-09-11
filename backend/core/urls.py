from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'posts', views.PostViewSet)


urlpatterns = [
    path('', views.FeedAPIView.as_view(), name='index'),
    path('settings', views.ProfileSettingsAPIView.as_view(), name='settings'),
    path('search/<str:username>/', views.SearchAPIView.as_view(), name='search-api'),  
    
    path('follow', views.FollowAPIView.as_view(), name='follow'),
    path('profile/<str:pk>', views.ProfileAPIView.as_view(), name='profile'),
    path('like-post', views.LikePostAPIView.as_view(), name='like-post'),

    
    path('create-user', views.CreateUserAPIView.as_view(), name='signup'),
] + router.urls
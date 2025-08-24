from django.urls import path
from . import views, api_views

urlpatterns = [
    # Camera stream views
    path('', views.index, name='index'),
    path('video_feed/', views.video_feed, name='video_feed'),
    
    # API endpoints
    path('api/emotion-detect/', api_views.EmotionDetectionCreateView.as_view(), name='emotion-detect'),
    path('api/persons/', api_views.PersonListView.as_view(), name='person-list'),
    path('api/persons/<str:person_id>/', api_views.PersonDetailView.as_view(), name='person-detail'),
    path('api/persons/<str:person_id>/emotions/', api_views.EmotionHistoryView.as_view(), name='emotion-history'),
    path('api/persons/<str:person_id>/chart/', api_views.person_emotion_chart, name='person-emotion-chart'),
    path('api/dashboard-stats/', api_views.dashboard_stats, name='dashboard-stats'),
    path('api/live-emotions/', api_views.live_emotions, name='live-emotions'),
]
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Person, EmotionDetection, EmotionStats
from .serializers import (
    PersonSerializer, 
    EmotionDetectionSerializer, 
    EmotionDetectionCreateSerializer,
    EmotionStatsSerializer
)

class EmotionDetectionCreateView(APIView):
    def post(self, request):
        serializer = EmotionDetectionCreateSerializer(data=request.data)
        if serializer.is_valid():
            emotion_detection = serializer.save()
            response_serializer = EmotionDetectionSerializer(emotion_detection)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PersonListView(generics.ListAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class PersonDetailView(generics.RetrieveAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    lookup_field = 'person_id'

class EmotionHistoryView(generics.ListAPIView):
    serializer_class = EmotionDetectionSerializer
    
    def get_queryset(self):
        person_id = self.kwargs.get('person_id')
        queryset = EmotionDetection.objects.filter(person__person_id=person_id)
        
        # Optional date filtering
        days = self.request.query_params.get('days')
        if days:
            try:
                days = int(days)
                date_from = timezone.now() - timedelta(days=days)
                queryset = queryset.filter(detected_at__gte=date_from)
            except ValueError:
                pass
        
        return queryset.order_by('-detected_at')

@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics"""
    # Total persons and emotions
    total_persons = Person.objects.count()
    total_emotions = EmotionDetection.objects.count()
    
    # Today's detections
    today = timezone.now().date()
    today_detections = EmotionDetection.objects.filter(
        detected_at__date=today
    ).count()
    
    # Active persons (detected in last 24 hours)
    yesterday = timezone.now() - timedelta(hours=24)
    active_persons = Person.objects.filter(
        last_seen__gte=yesterday
    ).count()
    
    # Emotion distribution
    emotion_distribution = EmotionDetection.objects.values('emotion').annotate(
        count=Count('emotion')
    ).order_by('-count')
    
    # Recent detections
    recent_detections = EmotionDetection.objects.select_related('person').order_by(
        '-detected_at'
    )[:10]
    recent_serializer = EmotionDetectionSerializer(recent_detections, many=True)
    
    return Response({
        'total_persons': total_persons,
        'total_emotions': total_emotions,
        'today_detections': today_detections,
        'active_persons': active_persons,
        'emotion_distribution': list(emotion_distribution),
        'recent_detections': recent_serializer.data
    })

@api_view(['GET'])
def person_emotion_chart(request, person_id):
    """Get emotion chart data for a specific person"""
    try:
        person = Person.objects.get(person_id=person_id)
        stats = EmotionStats.objects.get(person=person)
        stats_serializer = EmotionStatsSerializer(stats)
        
        # Emotion timeline (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        timeline_data = []
        
        for i in range(7):
            date = seven_days_ago + timedelta(days=i)
            day_emotions = EmotionDetection.objects.filter(
                person=person,
                detected_at__date=date.date()
            ).values('emotion').annotate(count=Count('emotion'))
            
            timeline_data.append({
                'date': date.date().isoformat(),
                'emotions': {item['emotion']: item['count'] for item in day_emotions}
            })
        
        return Response({
            'person_id': person_id,
            'total_stats': stats_serializer.data,
            'timeline': timeline_data
        })
    
    except Person.DoesNotExist:
        return Response(
            {'error': 'Person not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except EmotionStats.DoesNotExist:
        return Response(
            {'error': 'No emotion stats found for this person'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
def live_emotions(request):
    """Get live emotion detections (last 30 seconds)"""
    thirty_seconds_ago = timezone.now() - timedelta(seconds=30)
    live_detections = EmotionDetection.objects.filter(
        detected_at__gte=thirty_seconds_ago
    ).select_related('person').order_by('-detected_at')
    
    serializer = EmotionDetectionSerializer(live_detections, many=True)
    return Response(serializer.data)
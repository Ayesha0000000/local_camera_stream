from rest_framework import serializers
from .models import Person, EmotionDetection, EmotionStats

class EmotionDetectionSerializer(serializers.ModelSerializer):
    person_id = serializers.CharField(source='person.person_id', read_only=True)
    
    class Meta:
        model = EmotionDetection
        fields = ['id', 'person_id', 'emotion', 'confidence', 'detected_at', 'camera_id']

class EmotionStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmotionStats
        fields = ['happy_count', 'sad_count', 'angry_count', 'surprised_count', 
                 'fear_count', 'disgust_count', 'neutral_count']

class PersonSerializer(serializers.ModelSerializer):
    stats = EmotionStatsSerializer(read_only=True)
    recent_emotions = serializers.SerializerMethodField()
    
    class Meta:
        model = Person
        fields = ['person_id', 'name', 'first_detected', 'last_seen', 
                 'total_detections', 'stats', 'recent_emotions']
    
    def get_recent_emotions(self, obj):
        recent = obj.emotions.all()[:5]
        return EmotionDetectionSerializer(recent, many=True).data

class EmotionDetectionCreateSerializer(serializers.Serializer):
    person_id = serializers.CharField(max_length=100)
    emotion = serializers.ChoiceField(choices=EmotionDetection.EMOTION_CHOICES)
    confidence = serializers.FloatField(min_value=0, max_value=1)
    camera_id = serializers.CharField(max_length=50, default='camera_1')
    
    def create(self, validated_data):
        person_id = validated_data.pop('person_id')
        
        # Get or create person
        person, created = Person.objects.get_or_create(
            person_id=person_id,
            defaults={'name': f'Person {person_id}'}
        )
        
        # Update person stats
        person.total_detections += 1
        person.save()
        
        # Create emotion detection
        emotion_detection = EmotionDetection.objects.create(
            person=person,
            **validated_data
        )
        
        # Update emotion stats
        stats, created = EmotionStats.objects.get_or_create(person=person)
        stats.update_emotion_count(validated_data['emotion'])
        
        return emotion_detection
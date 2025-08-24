from django.db import models
from django.utils import timezone

class Person(models.Model):
    person_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    first_detected = models.DateTimeField(default=timezone.now)
    last_seen = models.DateTimeField(auto_now=True)
    total_detections = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Person {self.person_id}"
    
    class Meta:
        ordering = ['-last_seen']

class EmotionDetection(models.Model):
    EMOTION_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('angry', 'Angry'),
        ('surprised', 'Surprised'),
        ('fear', 'Fear'),
        ('disgust', 'Disgust'),
        ('neutral', 'Neutral'),
    ]
    
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='emotions')
    emotion = models.CharField(max_length=20, choices=EMOTION_CHOICES)
    confidence = models.FloatField()
    detected_at = models.DateTimeField(default=timezone.now)
    camera_id = models.CharField(max_length=50, default='camera_1')
    
    def __str__(self):
        return f"{self.person.person_id} - {self.emotion} ({self.confidence:.2f})"
    
    class Meta:
        ordering = ['-detected_at']

class EmotionStats(models.Model):
    person = models.OneToOneField(Person, on_delete=models.CASCADE, related_name='stats')
    happy_count = models.IntegerField(default=0)
    sad_count = models.IntegerField(default=0)
    angry_count = models.IntegerField(default=0)
    surprised_count = models.IntegerField(default=0)
    fear_count = models.IntegerField(default=0)
    disgust_count = models.IntegerField(default=0)
    neutral_count = models.IntegerField(default=0)
    
    def update_emotion_count(self, emotion):
        field_name = f"{emotion}_count"
        if hasattr(self, field_name):
            setattr(self, field_name, getattr(self, field_name) + 1)
            self.save()
    
    def __str__(self):
        return f"Stats for {self.person.person_id}"
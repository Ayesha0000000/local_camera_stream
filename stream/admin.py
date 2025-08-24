from django.contrib import admin
from .models import Person, EmotionDetection, EmotionStats

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['person_id', 'name', 'total_detections', 'first_detected', 'last_seen']
    list_filter = ['first_detected', 'last_seen']
    search_fields = ['person_id', 'name']
    readonly_fields = ['first_detected', 'last_seen', 'total_detections']
    ordering = ['-last_seen']

@admin.register(EmotionDetection)
class EmotionDetectionAdmin(admin.ModelAdmin):
    list_display = ['person', 'emotion', 'confidence', 'camera_id', 'detected_at']
    list_filter = ['emotion', 'camera_id', 'detected_at']
    search_fields = ['person__person_id', 'emotion']
    readonly_fields = ['detected_at']
    ordering = ['-detected_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('person')

@admin.register(EmotionStats)
class EmotionStatsAdmin(admin.ModelAdmin):
    list_display = ['person', 'happy_count', 'sad_count', 'angry_count', 
                   'surprised_count', 'fear_count', 'disgust_count', 'neutral_count']
    search_fields = ['person__person_id']
    readonly_fields = ['person']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('person')
    
    def has_add_permission(self, request):
        return False
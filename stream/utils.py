import cv2
import numpy as np
import requests
import json
from datetime import datetime
from django.conf import settings

class EmotionDetector:
    def __init__(self):
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Emotion labels
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprised', 'neutral']
        
        # Person tracking
        self.person_trackers = {}
        self.next_person_id = 1
        
    def detect_faces(self, frame):
        """Detect faces in the frame"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        return faces
    
    def predict_emotion(self, face_roi):
        """Predict emotion from face ROI - Mock implementation"""
        # In a real implementation, you would use a trained emotion detection model
        # For now, we'll simulate emotion detection
        emotions = ['happy', 'sad', 'angry', 'surprised', 'fear', 'disgust', 'neutral']
        emotion = np.random.choice(emotions)
        confidence = np.random.uniform(0.6, 0.95)
        return emotion, confidence
    
    def track_person(self, face_coords, frame_shape):
        """Track person based on face coordinates"""
        x, y, w, h = face_coords
        center_x = x + w // 2
        center_y = y + h // 2
        
        # Simple tracking based on proximity
        min_distance = float('inf')
        matched_id = None
        
        for person_id, tracker_data in self.person_trackers.items():
            last_center = tracker_data['last_center']
            distance = np.sqrt((center_x - last_center[0])**2 + (center_y - last_center[1])**2)
            
            if distance < 100 and distance < min_distance:  # Threshold for same person
                min_distance = distance
                matched_id = person_id
        
        if matched_id:
            # Update existing tracker
            self.person_trackers[matched_id]['last_center'] = (center_x, center_y)
            self.person_trackers[matched_id]['last_seen'] = datetime.now()
            return f"person_{matched_id}"
        else:
            # Create new tracker
            person_id = f"person_{self.next_person_id}"
            self.person_trackers[self.next_person_id] = {
                'last_center': (center_x, center_y),
                'last_seen': datetime.now(),
                'face_coords': (x, y, w, h)
            }
            self.next_person_id += 1
            return person_id
    
    def send_emotion_data(self, person_id, emotion, confidence, camera_id='camera_1'):
        """Send emotion data to Django API"""
        try:
            data = {
                'person_id': person_id,
                'emotion': emotion,
                'confidence': confidence,
                'camera_id': camera_id
            }
            
            response = requests.post(
                'http://127.0.0.1:8000/api/emotion-detect/',
                json=data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                print(f"Sent emotion data: {person_id} - {emotion} ({confidence:.2f})")
            else:
                print(f"Error sending data: {response.status_code}")
                
        except Exception as e:
            print(f"Error sending emotion data: {str(e)}")
    
    def process_frame(self, frame):
        """Process a single frame for emotion detection"""
        # Detect faces
        faces = self.detect_faces(frame)
        
        # Process each face
        for (x, y, w, h) in faces:
            # Extract face ROI
            face_roi = frame[y:y+h, x:x+w]
            
            # Track person
            person_id = self.track_person((x, y, w, h), frame.shape)
            
            # Predict emotion
            emotion, confidence = self.predict_emotion(face_roi)
            
            # Send data to API
            self.send_emotion_data(person_id, emotion, confidence)
            
            # Draw rectangle and text on frame
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Add person ID and emotion text
            cv2.putText(frame, f"{person_id}", (x, y-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            cv2.putText(frame, f"{emotion} ({confidence:.2f})", (x, y+h+20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        return frame

class CameraStreamer:
    def __init__(self, camera_index=0):
        self.camera_index = camera_index
        self.cap = None
        self.emotion_detector = EmotionDetector()
        
    def initialize_camera(self):
        """Initialize camera"""
        try:
            self.cap = cv2.VideoCapture(self.camera_index)
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            return True
        except Exception as e:
            print(f"Error initializing camera: {str(e)}")
            return False
    
    def get_frame(self):
        """Get a single frame from camera"""
        if self.cap is None:
            if not self.initialize_camera():
                return None
        
        ret, frame = self.cap.read()
        if not ret:
            return None
        
        # Process frame for emotion detection
        processed_frame = self.emotion_detector.process_frame(frame)
        
        # Encode frame as JPEG
        ret, jpeg = cv2.imencode('.jpg', processed_frame)
        return jpeg.tobytes()
    
    def generate_frames(self):
        """Generator function for streaming frames"""
        while True:
            frame = self.get_frame()
            if frame is not None:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
    
    def release_camera(self):
        """Release camera resources"""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
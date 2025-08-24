from django.shortcuts import render
from django.http import StreamingHttpResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import cv2
import json
from .utils import CameraStreamer

# Global camera streamer instance
camera_streamer = None

def get_camera_streamer():
    """Get or create camera streamer instance"""
    global camera_streamer
    if camera_streamer is None:
        camera_streamer = CameraStreamer(
            camera_index=getattr(settings, 'CAMERA_INDEX', 0)
        )
    return camera_streamer

def index(request):
    """Main index view"""
    return HttpResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Emotion Detection Camera Stream</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                color: white;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
            }
            .camera-feed {
                border: 3px solid #fff;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 100%;
                height: auto;
            }
            h1 {
                font-size: 2.5em;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .info {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                backdrop-filter: blur(10px);
            }
            .status {
                display: inline-block;
                padding: 10px 20px;
                background: #4CAF50;
                border-radius: 20px;
                margin: 10px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎭 Emotion Detection System</h1>
            <div class="info">
                <h3>Live Camera Feed with Real-time Emotion Detection</h3>
                <div class="status">🟢 System Active</div>
                <div class="status">📷 Camera Online</div>
                <div class="status">🧠 AI Processing</div>
            </div>
            <img src="/video_feed/" class="camera-feed" alt="Camera Feed">
            <div class="info">
                <p><strong>Features:</strong></p>
                <p>✅ Real-time face detection</p>
                <p>✅ Emotion recognition</p>
                <p>✅ Person tracking</p>
                <p>✅ Database logging</p>
                <p>✅ Web dashboard</p>
            </div>
            <div class="info">
                <p><strong>Access Dashboard:</strong> <a href="http://localhost:3000" style="color: #FFD700;">React Frontend</a></p>
                <p><strong>Admin Panel:</strong> <a href="/admin/" style="color: #FFD700;">Django Admin</a></p>
            </div>
        </div>
    </body>
    </html>
    """)

def video_feed(request):
    """Video streaming generator function"""
    try:
        streamer = get_camera_streamer()
        return StreamingHttpResponse(
            streamer.generate_frames(),
            content_type='multipart/x-mixed-replace; boundary=frame'
        )
    except Exception as e:
        print(f"Error in video feed: {str(e)}")
        return HttpResponse("Camera not available", status=503)

@csrf_exempt
def release_camera(request):
    """Release camera resources"""
    global camera_streamer
    if camera_streamer:
        camera_streamer.release_camera()
        camera_streamer = None
    return HttpResponse("Camera released")
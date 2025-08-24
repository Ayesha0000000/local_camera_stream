import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';

const EMOTION_COLORS = {
  happy: '#28a745',
  sad: '#007bff',
  angry: '#dc3545',
  surprised: '#ffc107',
  fear: '#6f42c1',
  disgust: '#fd7e14',
  neutral: '#6c757d'
};

const EMOTION_ICONS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😮',
  fear: '😨',
  disgust: '🤢',
  neutral: '😐'
};

function CameraView() {
  const [liveEmotions, setLiveEmotions] = useState([]);
  const [isStreamActive, setIsStreamActive] = useState(false);

  useEffect(() => {
    fetchLiveEmotions();
    const interval = setInterval(fetchLiveEmotions, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveEmotions = async () => {
    try {
      const response = await fetch('/api/live-emotions/');
      if (response.ok) {
        const data = await response.json();
        setLiveEmotions(data);
        setIsStreamActive(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching live emotions:', error);
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-white mb-3">
          <i className="bi bi-camera-video-fill me-3"></i>
          Live Camera Feed
        </h1>
        <p className="lead text-light">Real-time emotion detection</p>
      </div>

      <Row>
        {/* Camera Feed */}
        <Col lg={8} className="mb-4">
          <Card className="glass-card border-0 shadow">
            <Card.Header className="bg-transparent border-bottom-0 d-flex justify-content-between align-items-center">
              <h4 className="text-white mb-0">
                <i className="bi bi-camera me-2"></i>
                Camera Stream
              </h4>
              <div className="d-flex align-items-center">
                <div 
                  className={`rounded-circle me-2 ${
                    isStreamActive ? 'bg-success animate-pulse' : 'bg-danger'
                  }`}
                  style={{ width: '12px', height: '12px' }}
                ></div>
                <Badge bg={isStreamActive ? 'success' : 'danger'}>
                  {isStreamActive ? 'Live' : 'Offline'}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="position-relative bg-dark rounded-bottom overflow-hidden">
                <img 
                  src="/video_feed/"
                  alt="Camera Feed"
                  className="w-100 h-auto"
                  style={{ minHeight: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-none align-items-center justify-content-center text-white bg-secondary"
                  style={{ minHeight: '400px' }}
                >
                  <div className="text-center">
                    <i className="bi bi-camera-video-off display-1 mb-3"></i>
                    <h4>Camera not available</h4>
                    <p className="text-muted">Check camera connection</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Live Emotions Panel */}
        <Col lg={4}>
          <Row>
            {/* Current Detections */}
            <Col xs={12} className="mb-4">
              <Card className="glass-card border-0 shadow">
                <Card.Header className="bg-transparent border-bottom-0">
                  <h5 className="text-white mb-0">
                    <i className="bi bi-lightning-fill me-2"></i>
                    Live Detections
                  </h5>
                </Card.Header>
                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {liveEmotions.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-person display-4 text-muted mb-3"></i>
                      <p className="text-muted">No recent detections</p>
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {liveEmotions.map((detection, index) => (
                        <ListGroup.Item 
                          key={index}
                          className="bg-transparent border-secondary text-white px-0"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <strong className="text-primary">{detection.person_id}</strong>
                            <small className="text-muted">
                              {new Date(detection.detected_at).toLocaleTimeString()}
                            </small>
                          </div>
                          
                          <div className="d-flex align-items-center">
                            <span className="fs-4 me-3">
                              {EMOTION_ICONS[detection.emotion]}
                            </span>
                            <div className="flex-grow-1">
                              <Badge 
                                style={{ 
                                  backgroundColor: EMOTION_COLORS[detection.emotion],
                                  border: 'none'
                                }}
                                className="me-2"
                              >
                                {detection.emotion}
                              </Badge>
                              <small className="text-muted">
                                {(detection.confidence * 100).toFixed(1)}%
                              </small>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Camera Info */}
            <Col xs={12} className="mb-4">
              <Card className="glass-card border-0 shadow">
                <Card.Header className="bg-transparent border-bottom-0">
                  <h5 className="text-white mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Camera Info
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="bg-transparent border-secondary text-white px-0 d-flex justify-content-between">
                      <span className="text-muted">Status:</span>
                      <Badge bg={isStreamActive ? 'success' : 'danger'}>
                        {isStreamActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent border-secondary text-white px-0 d-flex justify-content-between">
                      <span className="text-muted">Camera ID:</span>
                      <span>Camera_1</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent border-secondary text-white px-0 d-flex justify-content-between">
                      <span className="text-muted">Detection Rate:</span>
                      <span>Real-time</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="bg-transparent border-secondary text-white px-0 d-flex justify-content-between">
                      <span className="text-muted">Resolution:</span>
                      <span>640x480</span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* Quick Stats */}
            <Col xs={12}>
              <Card className="glass-card border-0 shadow">
                <Card.Header className="bg-transparent border-bottom-0">
                  <h5 className="text-white mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Session Stats
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="text-center">
                    <Col xs={6}>
                      <div className="border-end border-secondary">
                        <h3 className="text-white mb-1">
                          {new Set(liveEmotions.map(e => e.person_id)).size}
                        </h3>
                        <small className="text-muted">Active Persons</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <h3 className="text-white mb-1">{liveEmotions.length}</h3>
                      <small className="text-muted">Recent Detections</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default CameraView;
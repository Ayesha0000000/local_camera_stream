import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, InputGroup, Button } from 'react-bootstrap';

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

function PersonsList({ onSelectPerson }) {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/persons/');
      if (response.ok) {
        const data = await response.json();
        setPersons(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersons = persons.filter(person =>
    person.person_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTopEmotion = (stats) => {
    if (!stats) return { emotion: 'neutral', count: 0 };
    
    const emotions = [
      { name: 'happy', count: stats.happy_count },
      { name: 'sad', count: stats.sad_count },
      { name: 'angry', count: stats.angry_count },
      { name: 'surprised', count: stats.surprised_count },
      { name: 'fear', count: stats.fear_count },
      { name: 'disgust', count: stats.disgust_count },
      { name: 'neutral', count: stats.neutral_count }
    ];
    
    return emotions.reduce((max, emotion) => 
      emotion.count > max.count ? emotion : max
    );
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h4 className="text-white">Loading persons...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-white mb-3">
          <i className="bi bi-people-fill me-3"></i>
          Detected Persons
        </h1>
        <p className="lead text-light">View all persons detected by the system</p>
      </div>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col>
          <Card className="glass-card border-0 shadow">
            <Card.Body>
              <InputGroup size="lg">
                <InputGroup.Text className="bg-secondary border-secondary">
                  <i className="bi bi-search text-white"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search persons by ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-dark border-secondary text-white"
                />
                <InputGroup.Text className="bg-secondary border-secondary">
                  <Badge bg="primary">
                    {filteredPersons.length} of {persons.length} persons
                  </Badge>
                </InputGroup.Text>
              </InputGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Persons Grid */}
      {filteredPersons.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-person-x display-1 text-muted mb-4"></i>
          <h3 className="text-white mb-3">No persons found</h3>
          <p className="text-muted">
            {searchTerm ? 'Try adjusting your search terms' : 'No persons have been detected yet'}
          </p>
        </div>
      ) : (
        <Row>
          {filteredPersons.map((person) => {
            const topEmotion = getTopEmotion(person.stats);
            
            return (
              <Col key={person.person_id} lg={4} md={6} className="mb-4">
                <Card 
                  className="glass-card border-0 shadow h-100 hover-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectPerson(person.person_id)}
                >
                  <Card.Body>
                    {/* Person Header */}
                    <div className="d-flex align-items-center mb-4">
                      <div className="me-3">
                        <div 
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}
                        >
                          {person.person_id.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="text-white mb-1">{person.person_id}</h5>
                        {person.name && (
                          <p className="text-muted mb-0 small">{person.name}</p>
                        )}
                      </div>
                      <div className="fs-2">
                        {EMOTION_ICONS[topEmotion.name]}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4">
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="text-center">
                            <h6 className="text-primary mb-1">{person.total_detections}</h6>
                            <small className="text-muted">Total Detections</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center">
                            <Badge 
                              style={{ 
                                backgroundColor: EMOTION_COLORS[topEmotion.name] || '#6c757d',
                                border: 'none'
                              }}
                              className="px-2 py-1"
                            >
                              {topEmotion.name} ({topEmotion.count})
                            </Badge>
                            <div><small className="text-muted">Top Emotion</small></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="border-top border-secondary pt-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">First Seen:</small>
                          <small className="text-white">
                            {new Date(person.first_detected).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Last Seen:</small>
                          <small className="text-white">
                            {new Date(person.last_seen).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Recent Emotions Preview */}
                    {person.recent_emotions && person.recent_emotions.length > 0 && (
                      <div className="border-top border-secondary pt-3 mt-3">
                        <small className="text-muted d-block mb-2">Recent Emotions:</small>
                        <div className="d-flex gap-1">
                          {person.recent_emotions.slice(0, 5).map((emotion, index) => (
                            <div
                              key={index}
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: '30px',
                                height: '30px',
                                backgroundColor: EMOTION_COLORS[emotion.emotion],
                                fontSize: '0.8rem'
                              }}
                              title={`${emotion.emotion} (${(emotion.confidence * 100).toFixed(1)}%)`}
                            >
                              {EMOTION_ICONS[emotion.emotion]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Click indicator */}
                    <div className="text-center mt-3 pt-3 border-top border-secondary">
                      <small className="text-muted">
                        <i className="bi bi-arrow-right me-1"></i>
                        Click to view details
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default PersonsList;
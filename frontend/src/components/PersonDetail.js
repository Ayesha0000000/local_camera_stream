import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ListGroup } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

function PersonDetail({ personId, onBack }) {
  const [person, setPerson] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    if (personId) {
      fetchPersonData();
      fetchEmotionHistory();
      fetchChartData();
    }
  }, [personId, selectedDays]);

  const fetchPersonData = async () => {
    try {
      const response = await fetch(`/api/persons/${personId}/`);
      if (response.ok) {
        const data = await response.json();
        setPerson(data);
      }
    } catch (error) {
      console.error('Error fetching person data:', error);
    }
  };

  const fetchEmotionHistory = async () => {
    try {
      const response = await fetch(`/api/persons/${personId}/emotions/?days=${selectedDays}`);
      if (response.ok) {
        const data = await response.json();
        setEmotionHistory(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching emotion history:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`/api/persons/${personId}/chart/`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare pie chart data
  const pieChartData = person?.stats ? [
    { name: 'Happy', value: person.stats.happy_count, fill: '#28a745' },
    { name: 'Sad', value: person.stats.sad_count, fill: '#007bff' },
    { name: 'Angry', value: person.stats.angry_count, fill: '#dc3545' },
    { name: 'Surprised', value: person.stats.surprised_count, fill: '#ffc107' },
    { name: 'Fear', value: person.stats.fear_count, fill: '#6f42c1' },
    { name: 'Disgust', value: person.stats.disgust_count, fill: '#fd7e14' },
    { name: 'Neutral', value: person.stats.neutral_count, fill: '#6c757d' },
  ].filter(item => item.value > 0) : [];

  // Prepare timeline data for line chart
  const timelineData = chartData?.timeline ? chartData.timeline.map(day => {
    const emotions = day.emotions || {};
    return {
      date: day.date,
      happy: emotions.happy || 0,
      sad: emotions.sad || 0,
      angry: emotions.angry || 0,
      surprised: emotions.surprised || 0,
      fear: emotions.fear || 0,
      disgust: emotions.disgust || 0,
      neutral: emotions.neutral || 0,
    };
  }) : [];

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h4 className="text-white">Loading person details...</h4>
        </div>
      </Container>
    );
  }

  if (!person) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <i className="bi bi-person-x display-1 text-muted mb-4"></i>
          <h3 className="text-white mb-3">Person not found</h3>
          <Button variant="primary" onClick={onBack}>
            <i className="bi bi-arrow-left me-2"></i>
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <Button 
          variant="outline-light" 
          className="mb-3"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Persons
        </Button>
        <div className="text-center">
          <h1 className="display-4 fw-bold text-white mb-3">Person Details</h1>
          <p className="lead text-light">Detailed analytics for {person.person_id}</p>
        </div>
      </div>

      {/* Person Overview */}
      <Row className="mb-4">
        <Col>
          <Card className="glass-card border-0 shadow">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <div className="me-4">
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                  >
                    {person.person_id.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h2 className="text-white mb-2">{person.person_id}</h2>
                  {person.name && <p className="text-muted mb-3">{person.name}</p>}
                  <Row className="g-4">
                    <Col md={3}>
                      <div className="text-center">
                        <h5 className="text-primary mb-1">{person.total_detections}</h5>
                        <small className="text-muted">Total Detections</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h6 className="text-white mb-1">
                          {new Date(person.first_detected).toLocaleDateString()}
                        </h6>
                        <small className="text-muted">First Seen</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h6 className="text-white mb-1">
                          {new Date(person.last_seen).toLocaleString()}
                        </h6>
                        <small className="text-muted">Last Seen</small>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <Badge bg="success" className="px-3 py-2">
                          <i className="bi bi-circle-fill me-1"></i>
                          Active
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        {/* Emotion Distribution Pie Chart */}
        <Col lg={6} className="mb-4">
          <Card className="glass-card border-0 shadow h-100">
            <Card.Header className="bg-transparent border-bottom-0">
              <h5 className="text-white mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Emotion Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <i className="bi bi-emoji-neutral display-4 mb-3"></i>
                    <p>No emotion data available</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Timeline Chart */}
        <Col lg={6} className="mb-4">
          <Card className="glass-card border-0 shadow h-100">
            <Card.Header className="bg-transparent border-bottom-0 d-flex justify-content-between align-items-center">
              <h5 className="text-white mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Emotion Timeline
              </h5>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                className="form-select form-select-sm bg-dark border-secondary text-white"
                style={{ width: 'auto' }}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </Card.Header>
            <Card.Body>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#495057" />
                    <XAxis dataKey="date" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#343a40',
                        border: '1px solid #6f42c1',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="happy" stroke="#28a745" strokeWidth={2} />
                    <Line type="monotone" dataKey="sad" stroke="#007bff" strokeWidth={2} />
                    <Line type="monotone" dataKey="angry" stroke="#dc3545" strokeWidth={2} />
                    <Line type="monotone" dataKey="surprised" stroke="#ffc107" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <i className="bi bi-graph-up display-4 mb-3"></i>
                    <p>No timeline data available</p>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Emotion History */}
      <Row>
        <Col>
          <Card className="glass-card border-0 shadow">
            <Card.Header className="bg-transparent border-bottom-0">
              <h5 className="text-white mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Emotion History
              </h5>
            </Card.Header>
            <Card.Body>
              {emotionHistory.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-clock display-4 text-muted mb-3"></i>
                  <p className="text-muted">No emotion history available</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="table-dark table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Emotion</th>
                        <th>Confidence</th>
                        <th>Camera</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emotionHistory.map((emotion, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="fs-4 me-3">
                                {EMOTION_ICONS[emotion.emotion]}
                              </span>
                              <Badge 
                                style={{ 
                                  backgroundColor: EMOTION_COLORS[emotion.emotion],
                                  border: 'none'
                                }}
                              >
                                {emotion.emotion}
                              </Badge>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                                <div 
                                  className="progress-bar bg-success"
                                  style={{ width: `${emotion.confidence * 100}%` }}
                                ></div>
                              </div>
                              {(emotion.confidence * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td>
                            <Badge bg="info">{emotion.camera_id}</Badge>
                          </td>
                          <td>
                            <div>
                              <div className="fw-medium">
                                {new Date(emotion.detected_at).toLocaleDateString()}
                              </div>
                              <small className="text-muted">
                                {new Date(emotion.detected_at).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PersonDetail;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

function Dashboard() {
  const [stats, setStats] = useState({
    total_persons: 0,
    total_emotions: 0,
    today_detections: 0,
    active_persons: 0,
    emotion_distribution: [],
    recent_detections: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard-stats/');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const emotionChartData = stats.emotion_distribution.map(item => ({
    ...item,
    fill: EMOTION_COLORS[item.emotion] || '#6c757d'
  }));

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h4 className="text-white">Loading Dashboard...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-white mb-3">
          <i className="bi bi-graph-up me-3"></i>
          Emotion Detection Dashboard
        </h1>
        <p className="lead text-light">Real-time emotion monitoring and analytics</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-5">
        <Col md={3} className="mb-3">
          <Card className="glass-card h-100 border-0 shadow">
            <Card.Body className="text-center">
              <div className="display-1 text-primary mb-3">
                <i className="bi bi-people-fill"></i>
              </div>
              <h3 className="text-white mb-1">{stats.total_persons}</h3>
              <p className="text-muted mb-0">Total Persons</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="glass-card h-100 border-0 shadow">
            <Card.Body className="text-center">
              <div className="display-1 text-warning mb-3">
                <i className="bi bi-emoji-smile"></i>
              </div>
              <h3 className="text-white mb-1">{stats.total_emotions}</h3>
              <p className="text-muted mb-0">Total Emotions</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="glass-card h-100 border-0 shadow">
            <Card.Body className="text-center">
              <div className="display-1 text-info mb-3">
                <i className="bi bi-calendar-day"></i>
              </div>
              <h3 className="text-white mb-1">{stats.today_detections}</h3>
              <p className="text-muted mb-0">Today's Detections</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="glass-card h-100 border-0 shadow">
            <Card.Body className="text-center">
              <div className="display-1 text-success mb-3">
                <i className="bi bi-circle-fill"></i>
              </div>
              <h3 className="text-white mb-1">{stats.active_persons}</h3>
              <p className="text-muted mb-0">Active Persons</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-5">
        {/* Emotion Distribution Pie Chart */}
        <Col lg={6} className="mb-4">
          <Card className="glass-card border-0 shadow h-100">
            <Card.Header className="bg-transparent border-bottom-0">
              <h4 className="text-white mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Emotion Distribution
              </h4>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ emotion, count }) => `${emotion}: ${count}`}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {emotionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Emotion Bar Chart */}
        <Col lg={6} className="mb-4">
          <Card className="glass-card border-0 shadow h-100">
            <Card.Header className="bg-transparent border-bottom-0">
              <h4 className="text-white mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Emotion Counts
              </h4>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emotionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#495057" />
                  <XAxis dataKey="emotion" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#343a40',
                      border: '1px solid #6f42c1',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="count" fill="#6f42c1" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Detections */}
      <Row>
        <Col>
          <Card className="glass-card border-0 shadow">
            <Card.Header className="bg-transparent border-bottom-0">
              <h4 className="text-white mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Detections
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Person ID</th>
                      <th>Emotion</th>
                      <th>Confidence</th>
                      <th>Camera</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_detections.map((detection, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{detection.person_id}</td>
                        <td>
                          <Badge 
                            bg="secondary" 
                            style={{ 
                              backgroundColor: EMOTION_COLORS[detection.emotion] || '#6c757d',
                              border: 'none'
                            }}
                            className="d-inline-flex align-items-center"
                          >
                            <span className="me-1">
                              {EMOTION_ICONS[detection.emotion] || '😐'}
                            </span>
                            {detection.emotion}
                          </Badge>
                        </td>
                        <td>{(detection.confidence * 100).toFixed(1)}%</td>
                        <td>
                          <Badge bg="info">{detection.camera_id}</Badge>
                        </td>
                        <td>{new Date(detection.detected_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
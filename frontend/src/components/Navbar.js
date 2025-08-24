import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

function NavigationBar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-bar-chart-fill' },
    { id: 'camera', label: 'Live Camera', icon: 'bi-camera-video-fill' },
    { id: 'persons', label: 'Persons', icon: 'bi-people-fill' },
  ];

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navbar-glass shadow-lg">
      <Container fluid>
        <Navbar.Brand className="fw-bold text-light">
          <i className="bi bi-emoji-smile-fill me-2 text-warning"></i>
          Emotion Detection System
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {navItems.map((item) => (
              <Nav.Link
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-3 py-2 mx-1 rounded-pill transition-all ${
                  currentView === item.id
                    ? 'bg-primary text-white shadow'
                    : 'text-light hover-purple'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
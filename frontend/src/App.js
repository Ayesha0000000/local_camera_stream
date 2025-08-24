import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CameraView from './components/CameraView';
import PersonDetail from './components/PersonDetail';
import PersonsList from './components/PersonsList';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'camera':
        return <CameraView />;
      case 'persons':
        return <PersonsList onSelectPerson={(personId) => {
          setSelectedPersonId(personId);
          setCurrentView('personDetail');
        }} />;
      case 'personDetail':
        return <PersonDetail 
          personId={selectedPersonId} 
          onBack={() => setCurrentView('persons')} 
        />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <div className="min-vh-100 bg-purple-gradient">
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="container-fluid px-4 py-4">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
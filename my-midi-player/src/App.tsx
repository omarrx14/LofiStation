import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RetroMIDIReaderPlayer from './components/lofistation/lofistation2.tsx';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/lofistation2" element={<RetroMIDIReaderPlayer />} />
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
};

export default App;

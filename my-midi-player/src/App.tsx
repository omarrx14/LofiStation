import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LofiStation from './components/lofistation/lofistation.tsx';
import RetroMIDIReaderPlayer from './components/lofistation/lofistation2.tsx';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/lofistation" Component={LofiStation} />
        <Route path="/lofistation2" Component={RetroMIDIReaderPlayer} />

        {/* Otras rutas */}
      </Routes>
    </Router>
  );
};

export default App;

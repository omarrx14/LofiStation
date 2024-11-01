import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RetroMIDIReaderPlayer from './components/lofistation/lofistation2.tsx';
import MidiPlayer from './components/lofistation/lofistation2comps/midiPlayer.tsx';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/lofistation2" element={<RetroMIDIReaderPlayer />} />
        <Route path="/lofistation" element={<MidiPlayer />} />
      </Routes>
    </Router>
  );
};

export default App;

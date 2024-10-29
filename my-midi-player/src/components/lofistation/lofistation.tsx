// import React, { useState, useEffect } from 'react';
// import * as Tone from 'tone';
// import { Midi } from '@tonejs/midi';

// const LofiStation: React.FC = () => {
//     const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
//     const [currentFileIndex, setCurrentFileIndex] = useState(0);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [volume, setVolume] = useState(50);
//     const [synths, setSynths] = useState<any[]>([]);
//     const [midiParts, setMidiParts] = useState<any[]>([]);
//     const NUM_CHANNELS = 16;



//     // const instruments: { [key: string]: string } = {
//     //     Piano: 'sine',
//     //     Guitarra: 'triangle',
//     //     Bajo: 'square',
//     //     Sintetizador: 'sawtooth',
//     // };

//     useEffect(() => {
//         if (midiParts.length > 0) {
//             // Hacer algo con midiParts
//             midiParts.forEach(part => {
//                 part.start();
//             });
//         }
//     }, [midiParts]);



//     useEffect(() => {
//         const synthArray = Array.from({ length: NUM_CHANNELS }, () =>
//             new Tone.PolySynth(Tone.Synth).toDestination()
//         );
//         setSynths(synthArray);
//         Tone.getDestination().volume.value = Tone.gainToDb(volume / 100);
//     }, []);

//     const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const files = Array.from(event.target.files || []).filter(file =>
//             file.name.endsWith('.mid')
//         );
//         setUploadedFiles(files);
//     };

//     const loadAndPlayMIDI = async (file: File) => {
//         const arrayBuffer = await file.arrayBuffer();
//         const midi = new Midi(arrayBuffer);
//         const parts: any[] = [];

//         midi.tracks.forEach((track, trackIndex) => {
//             const synth = synths[trackIndex % NUM_CHANNELS];
//             const part = new Tone.Part((time, note) => {
//                 synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
//             }, track.notes).start(0);
//             parts.push(part);
//         });

//         setMidiParts(parts);
//         Tone.Transport.start();
//         setIsPlaying(true);
//     };

//     const playPause = () => {
//         Tone.start();
//         if (isPlaying) {
//             Tone.Transport.pause();
//             setIsPlaying(false);
//         } else {
//             if (Tone.Transport.state === 'stopped') {
//                 loadAndPlayMIDI(uploadedFiles[currentFileIndex]);
//             } else {
//                 Tone.Transport.start();
//             }
//             setIsPlaying(true);
//         }
//     };

//     const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const newVolume = Number(e.target.value);
//         Tone.getDestination().volume.value = Tone.gainToDb(newVolume / 100);
//         setVolume(newVolume);
//     };

//     const nextTrack = () => {
//         if (currentFileIndex < uploadedFiles.length - 1) {
//             setCurrentFileIndex(currentFileIndex + 1);
//             if (isPlaying) {
//                 Tone.Transport.stop();
//                 loadAndPlayMIDI(uploadedFiles[currentFileIndex + 1]);
//             }
//         }
//     };

//     const prevTrack = () => {
//         if (currentFileIndex > 0) {
//             setCurrentFileIndex(currentFileIndex - 1);
//             if (isPlaying) {
//                 Tone.Transport.stop();
//                 loadAndPlayMIDI(uploadedFiles[currentFileIndex - 1]);
//             }
//         }
//     };

//     return (
//         <div className="player" style={{ backgroundColor: '#333', padding: '20px', color: 'white' }}>
//             <input type="file" multiple onChange={handleFileUpload} accept=".mid,.midi,audio/midi" />
//             <div className="controls">
//                 <button onClick={playPause}>{isPlaying ? 'Pausa' : 'Reproducir'}</button>
//                 <button onClick={nextTrack}>Siguiente</button>
//                 <button onClick={prevTrack}>Anterior</button>
//             </div>
//             <label>Volumen</label>
//             <input type="range" value={volume} onChange={changeVolume} min="0" max="100" />
//             <div className="midi-info">{uploadedFiles.length > 0 && `Cargando: ${uploadedFiles[currentFileIndex].name}`}</div>
//         </div>
//     );
// };

// export default LofiStation;

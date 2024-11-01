
import { useState } from "react";
import * as Tone from "tone";
import Soundfont, { InstrumentName } from "soundfont-player";

const Instruments = () => {
    const [currentInstrument, setCurrentInstrument] = useState<string>("piano");

    const instrumentList = [
        { name: "piano", sound: "acoustic_grand_piano" },
        { name: "bass", sound: "electric_bass_finger" },
        { name: "synth1", sound: "synth_drum" },
        { name: "strings", sound: "string_ensemble_1" },
        { name: "guitar", sound: "acoustic_guitar_nylon" },
        { name: "flute", sound: "flute" },
        { name: "violin", sound: "violin" },
        { name: "organ", sound: "drawbar_organ" },
        { name: "trumpet", sound: "trumpet" },
        { name: "synth2", sound: "synth_brass_1" }
    ];

    // Configuración de Efectos
    const reverb = new Tone.Reverb({ decay: 2, wet: 0.4 }).toDestination();
    const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.5 }).toDestination();
    const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();
    chorus.start();

    // Load and play a note using SoundFont
    const playNote = async (instrument: string, note: string) => {
        const audioContext = new AudioContext();
        const player = await Soundfont.instrument(audioContext, instrument as InstrumentName, { soundfont: "FluidR3_GM" });
        const source = player.play(note, 0, { duration: 1 });
        source.connect(audioContext.destination);
    };


    // Play note with Tone.js Synths and add effects
    const playSynthNote = (note: string, type: string) => {
        const synth = new Tone.Synth({
            oscillator: { type: type as OscillatorType }
        }).connect(chorus).connect(reverb).connect(delay); // Conectando efectos

        synth.triggerAttackRelease(note, "8n");
    };

    // Handler to play based on selected instrument
    const handlePlay = (note: string) => {
        switch (currentInstrument) {
            case "piano":
            case "bass":
            case "guitar":
            case "strings":
            case "flute":
            case "violin":
            case "organ":
            case "trumpet":
                playNote(instrumentList.find(inst => inst.name === currentInstrument)?.sound || "piano", note);
                break;
            case "synth1":
                playSynthNote(note, "sawtooth"); // Synth example
                break;
            case "synth2":
                playSynthNote(note, "triangle"); // Another Synth example
                break;
            default:
                playSynthNote(note, "sine"); // Default Synth sound
        }
    };

    return (
        <div>
            <h2>Instrumentos con Efectos</h2>
            <select
                value={currentInstrument}
                onChange={(e) => setCurrentInstrument(e.target.value)}
            >
                {instrumentList.map((inst) => (
                    <option key={inst.name} value={inst.name}>
                        {inst.name}
                    </option>
                ))}
            </select>

            <div>
                <button onClick={() => handlePlay("C4")}>C</button>
                <button onClick={() => handlePlay("D4")}>D</button>
                <button onClick={() => handlePlay("E4")}>E</button>
                <button onClick={() => handlePlay("F4")}>F</button>
                <button onClick={() => handlePlay("G4")}>G</button>
                <button onClick={() => handlePlay("A4")}>A</button>
                <button onClick={() => handlePlay("B4")}>B</button>
            </div>
        </div>
    );
};

export default Instruments;

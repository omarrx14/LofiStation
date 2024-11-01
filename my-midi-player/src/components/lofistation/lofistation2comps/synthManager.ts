
import * as Tone from "tone";
import Soundfont, { InstrumentName } from "soundfont-player";

export const createSynthWithEffects = (instrumentName: string, reverbValue: number, delayValue: number, chorusValue: number) => {
    const reverb = new Tone.Reverb({ decay: reverbValue, wet: 0.3 }).toDestination();
    const delay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: delayValue }).toDestination();
    const chorus = new Tone.Chorus(4, chorusValue, 0.3).toDestination();
    chorus.start();

    return Soundfont.instrument(new AudioContext(), instrumentName as InstrumentName).then((instrument) => {
        const synth = new Tone.Synth({
            oscillator: { type: "sine" }
        }).connect(chorus).connect(reverb).connect(delay);
        return { instrument, synth };
    });
};

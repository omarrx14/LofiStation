
interface EffectSettings {
    reverb: number;
    delay: number;
    chorus: number;
}

interface EffectsControlsProps {
    effects: EffectSettings;
    onChange: (effect: keyof EffectSettings, value: number) => void;
}

const EffectsControls: React.FC<EffectsControlsProps> = ({ effects, onChange }) => {
    return (
        <div>
            <div>
                <label>Reverb: </label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={effects.reverb}
                    onChange={(e) => onChange("reverb", parseFloat(e.target.value))}
                />
                <span>{effects.reverb}</span>
            </div>
            <div>
                <label>Delay: </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={effects.delay}
                    onChange={(e) => onChange("delay", parseFloat(e.target.value))}
                />
                <span>{effects.delay}</span>
            </div>
            <div>
                <label>Chorus: </label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={effects.chorus}
                    onChange={(e) => onChange("chorus", parseFloat(e.target.value))}
                />
                <span>{effects.chorus}</span>
            </div>
        </div>
    );
};

export default EffectsControls;

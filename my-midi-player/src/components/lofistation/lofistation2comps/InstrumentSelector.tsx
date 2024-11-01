

interface InstrumentSelectorProps {
    instrument: string;
    onChange: (instrument: string) => void;
    options: string[];
}

const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({ instrument, onChange, options }) => {
    return (
        <div>
            <label>Instrumento: </label>
            <select value={instrument} onChange={(e) => onChange(e.target.value)}>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default InstrumentSelector;

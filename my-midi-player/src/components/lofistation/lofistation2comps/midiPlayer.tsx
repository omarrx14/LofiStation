
import React, { useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'
import { Button } from "../../../components/ui/button"
import { Slider } from "../../../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Play, Pause, Upload } from 'lucide-react'
import { createSynthWithEffects } from './synthManager'

interface EffectSettings {
    reverb: number;
    delay: number;
    chorus: number;
}

const instrumentOptions = [
    "acoustic_grand_piano", "electric_bass_finger", "synth_drum", "string_ensemble_1",
    "acoustic_guitar_nylon", "flute", "violin", "drawbar_organ",
    "trumpet", "synth_brass_1"
]

const EffectsControls = ({ effects, onChange }: { effects: EffectSettings, onChange: (effect: keyof EffectSettings, value: number) => void }) => (
    <div className="grid grid-cols-3 gap-4 mt-4">
        {Object.entries(effects).map(([effect, value]) => (
            <div key={effect}>
                <label className="text-sm font-medium text-gray-300 mb-1 block">{effect.charAt(0).toUpperCase() + effect.slice(1)}</label>
                <Slider
                    value={[value]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(newValue) => onChange(effect as keyof EffectSettings, newValue[0])}
                />
            </div>
        ))}
    </div>
)

export default function LofiMidiPlayerRetro() {
    const [midiData, setMidiData] = useState<Midi | null>(null)
    const [bpm, setBpm] = useState(120)
    const [isPlaying, setIsPlaying] = useState(false)
    const [trackInstruments, setTrackInstruments] = useState<string[]>([])
    const [trackEffects, setTrackEffects] = useState<EffectSettings[]>([])
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const analyzerRef = useRef<Tone.Analyser | null>(null)

    useEffect(() => {
        const newAnalyzer = new Tone.Analyser('waveform', 1024)
        Tone.Destination.connect(newAnalyzer)
        analyzerRef.current = newAnalyzer

        return () => {
            newAnalyzer.dispose()
        }
    }, [])

    useEffect(() => {
        let animationFrameId: number | undefined;

        const drawWaveform = () => {
            if (canvasRef.current && analyzerRef.current) {
                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    const width = canvas.width
                    const height = canvas.height
                    const waveform = analyzerRef.current.getValue()

                    ctx.clearRect(0, 0, width, height)
                    ctx.beginPath()
                    ctx.strokeStyle = 'rgb(255, 102, 178)' // Pink color
                    ctx.lineWidth = 2

                    for (let i = 0; i < waveform.length; i++) {
                        const x = (i / waveform.length) * width
                        const y = ((waveform[i] as number + 1) / 2) * height

                        if (i === 0) {
                            ctx.moveTo(x, y)
                        } else {
                            ctx.lineTo(x, y)
                        }
                    }

                    ctx.stroke()
                }
            }

            animationFrameId = requestAnimationFrame(drawWaveform)
        }

        if (isPlaying) {
            drawWaveform()
        } else if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [isPlaying])

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const arrayBuffer = await file.arrayBuffer()
            const midi = new Midi(arrayBuffer)
            setMidiData(midi)
            setTrackInstruments(Array(midi.tracks.length).fill("acoustic_grand_piano"))
            setTrackEffects(Array(midi.tracks.length).fill({ reverb: 0.2, delay: 0.4, chorus: 0.3 }))
        }
    }

    const handleInstrumentChange = (index: number, instrument: string) => {
        const newInstruments = [...trackInstruments]
        newInstruments[index] = instrument
        setTrackInstruments(newInstruments)
    }

    const handleEffectChange = (index: number, effect: keyof EffectSettings, value: number) => {
        const newEffects = [...trackEffects]
        newEffects[index] = { ...newEffects[index], [effect]: value }
        setTrackEffects(newEffects)
    }

    const handleBpmChange = (newBpm: number) => {
        setBpm(newBpm)
        Tone.getTransport().bpm.value = newBpm
    }

    const playMidi = () => {
        if (!midiData) return;
        Tone.getTransport().stop();
        Tone.getTransport().cancel();

        midiData.tracks.forEach((track, index) => {
            const instrumentName = trackInstruments[index];
            const { reverb, delay, chorus } = trackEffects[index];

            createSynthWithEffects(instrumentName, reverb, delay, chorus).then(({ synth }) => {
                track.notes.forEach((note) => {
                    Tone.Transport.schedule((time) => {
                        synth.triggerAttackRelease(note.name, note.duration, time);
                    }, note.time);
                });
            });
        });

        Tone.getTransport().start();
        setIsPlaying(true);
    };

    const stopMidi = () => {
        Tone.getTransport().stop()
        setIsPlaying(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-teal-700 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl bg-gray-900 text-white">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-pink-500">Reproductor MIDI Lofi Retro</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex items-center justify-center">
                            <label className="cursor-pointer bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                                <Upload className="mr-2" />
                                <span>Subir archivo MIDI</span>
                                <Input type="file" accept=".mid,.midi" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>

                        <div className="bg-gradient-to-r from-pink-500 to-teal-500 rounded-2xl p-1">
                            <div className="bg-gray-900 rounded-2xl p-4">
                                <canvas ref={canvasRef} width={600} height={100} className="w-full" />
                            </div>
                        </div>

                        <div className="flex items-center justify-center space-x-4">
                            <span className="text-teal-300">BPM:</span>
                            <Input
                                type="number"
                                value={bpm}
                                onChange={(e) => handleBpmChange(Number(e.target.value))}
                                min={20}
                                max={300}
                                className="w-20 bg-gray-800 text-white"
                            />
                            <Button onClick={isPlaying ? stopMidi : playMidi} variant="outline" size="icon" className="bg-gray-800 text-pink-500 hover:bg-gray-700">
                                {isPlaying ? <Pause /> : <Play />}
                            </Button>
                        </div>

                        {midiData && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-teal-300">Configuración de pistas</h3>
                                {midiData.tracks.map((_, index) => (
                                    <Card key={index} className="bg-gray-800">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-pink-400">Pista {index + 1}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Select
                                                value={trackInstruments[index]}
                                                onValueChange={(value) => handleInstrumentChange(index, value)}
                                            >
                                                <SelectTrigger className="w-full bg-gray-700 text-white">
                                                    <SelectValue placeholder="Selecciona un instrumento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {instrumentOptions.map((instrument) => (
                                                        <SelectItem key={instrument} value={instrument}>
                                                            {instrument}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <EffectsControls
                                                effects={trackEffects[index]}
                                                onChange={(effect, value) => handleEffectChange(index, effect, value)}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

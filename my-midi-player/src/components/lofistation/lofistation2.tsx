
import React, { useState, useRef, useEffect } from 'react'
import { Upload, Play, Pause, SkipForward, SkipBack, Volume2, FileText } from 'lucide-react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

const NUM_CHANNELS = 16 // MIDI tiene 16 canales

export default function RetroMIDIReaderPlayer() {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [currentFileIndex, setCurrentFileIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(50)
    const [isLoading, setIsLoading] = useState(false)
    const [midiInfo, setMidiInfo] = useState<string | null>(null)
    const synths = useRef<Tone.PolySynth[]>([])
    const midiParts = useRef<Tone.Part[]>([])

    useEffect(() => {
        synths.current = Array.from({ length: NUM_CHANNELS }, () =>
            new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: 'square'
                },
                envelope: {
                    attack: 0.02,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 1
                }
            }).toDestination()
        )

        Tone.getDestination().volume.value = Tone.gainToDb(volume / 100)

        return () => {
            synths.current.forEach(synth => synth.dispose())
            midiParts.current.forEach(part => part.dispose())
        }
    }, [])

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).filter(file =>
                file.type === 'audio/midi' || file.name.endsWith('.mid') || file.name.endsWith('.midi')
            )
            setUploadedFiles(prevFiles => [...prevFiles, ...newFiles])
        }
    }

    const loadAndPlayMIDI = async (file: File) => {
        setIsLoading(true)
        const arrayBuffer = await file.arrayBuffer()
        const midi = new Midi(arrayBuffer)

        const now = Tone.now() + 0.5
        midiParts.current.forEach(part => part.dispose())
        midiParts.current = []

        midi.tracks.forEach((track, trackIndex) => {
            const synth = synths.current[trackIndex % NUM_CHANNELS]
            const part = new Tone.Part((time, note) => {
                synth.triggerAttackRelease(
                    note.name,
                    note.duration,
                    time,
                    note.velocity
                )
            }, track.notes).start(now)
            midiParts.current.push(part)
        })

        Tone.Transport.start(now)
        setIsPlaying(true)
        setIsLoading(false)
    }

    const handlePlayPause = async () => {
        if (uploadedFiles.length === 0) return

        await Tone.start()

        if (isPlaying) {
            Tone.Transport.pause()
            setIsPlaying(false)
        } else {
            if (Tone.Transport.state === 'paused') {
                Tone.Transport.start()
            } else {
                loadAndPlayMIDI(uploadedFiles[currentFileIndex])
            }
            setIsPlaying(true)
        }
    }

    const handleNext = () => {
        if (currentFileIndex < uploadedFiles.length - 1) {
            setCurrentFileIndex(currentFileIndex + 1)
            if (isPlaying) {
                Tone.Transport.stop()
                loadAndPlayMIDI(uploadedFiles[currentFileIndex + 1])
            }
        }
    }

    const handlePrevious = () => {
        if (currentFileIndex > 0) {
            setCurrentFileIndex(currentFileIndex - 1)
            if (isPlaying) {
                Tone.Transport.stop()
                loadAndPlayMIDI(uploadedFiles[currentFileIndex - 1])
            }
        }
    }

    const handleVolumeChange = (newVolume: number[]) => {
        const volumeValue = newVolume[0]
        setVolume(volumeValue)
        Tone.getDestination().volume.value = Tone.gainToDb(volumeValue / 100)
    }

    const readMIDIFile = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer()
        const midi = new Midi(arrayBuffer)

        let info = `Archivo MIDI: ${file.name}\n\n`
        info += `Duración: ${midi.duration.toFixed(2)} segundos\n`
        info += `Tempo: ${midi.header.tempos[0]?.bpm || 'No especificado'} BPM\n`
        info += `Compás: ${midi.header.timeSignatures[0]?.timeSignature || 'No especificado'}\n\n`

        midi.tracks.forEach((track, index) => {
            info += `Pista ${index + 1}: ${track.name || 'Sin nombre'}\n`
            info += `  Instrumento: ${track.instrument.name}\n`
            info += `  Notas: ${track.notes.length}\n`
            info += `  Canales utilizados: ${Array.from(new Set(track.notes.map(n => n.midi))).join(', ')}\n\n`
        })

        setMidiInfo(info)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6" style={{
                boxShadow: '0 0 0 10px #555, 0 0 0 20px #333',
                background: 'linear-gradient(145deg, #444, #222)',
            }}>
                <div className="bg-black p-6 rounded-2xl shadow-inner" style={{
                    border: '4px solid #666',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}>
                    <h1 className="text-3xl font-bold text-center text-yellow-400 mb-4" style={{ fontFamily: "'VT323', monospace" }}>90s MIDI Reader/Player</h1>

                    <div className="bg-green-900 p-4 rounded-xl mb-4 relative overflow-hidden" style={{
                        border: '2px solid #0f0',
                        boxShadow: 'inset 0 0 5px #0f0, 0 0 10px #0f0',
                    }}>
                        <div className="absolute inset-0 flex items-center overflow-hidden">
                            <p className="text-green-400 font-mono text-lg whitespace-nowrap animate-marquee">
                                {uploadedFiles[currentFileIndex]?.name || "No MIDI loaded - Insert your favorite 90s hit!"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 mb-4">
                        <Button onClick={handlePrevious} variant="outline" size="icon" className="rounded-full bg-gray-700 hover:bg-gray-600 border-2 border-gray-500">
                            <SkipBack className="h-4 w-4 text-yellow-400" />
                        </Button>
                        <Button onClick={handlePlayPause} variant="outline" size="icon" className="rounded-full bg-gray-700 hover:bg-gray-600 border-2 border-gray-500" disabled={isLoading}>
                            {isLoading ? (
                                <span className="animate-spin h-4 w-4 border-2 border-yellow-400 rounded-full border-t-transparent"></span>
                            ) : isPlaying ? (
                                <Pause className="h-4 w-4 text-yellow-400" />
                            ) : (
                                <Play className="h-4 w-4 text-yellow-400" />
                            )}
                        </Button>
                        <Button onClick={handleNext} variant="outline" size="icon" className="rounded-full bg-gray-700 hover:bg-gray-600 border-2 border-gray-500">
                            <SkipForward className="h-4 w-4 text-yellow-400" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
                        <Volume2 className="text-yellow-400 h-5 w-5" />
                        <Slider
                            value={[volume]}
                            onValueChange={handleVolumeChange}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="space-y-4 bg-gray-700 p-4 rounded-xl" style={{ border: '2px solid #888' }}>
                    <Label htmlFor="file-upload" className="text-yellow-400 text-lg font-semibold block" style={{ fontFamily: "'VT323', monospace" }}>
                        Upload Your 90s MIDI Hits
                    </Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".mid,.midi,audio/midi"
                            multiple
                            onChange={handleFileUpload}
                            className="text-sm text-yellow-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-900 file:text-yellow-400 hover:file:bg-purple-800"
                        />
                        <Button size="icon" className="rounded-full bg-purple-900 hover:bg-purple-800">
                            <Upload className="h-4 w-4 text-yellow-400" />
                        </Button>
                    </div>
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-xl" style={{ border: '2px solid #888' }}>
                        <h2 className="text-yellow-400 text-lg font-semibold mb-2" style={{ fontFamily: "'VT323', monospace" }}>90s Playlist:</h2>
                        <ul className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-gray-800">
                            {uploadedFiles.map((file, index) => (
                                <li
                                    key={index}
                                    className={`text-sm ${index === currentFileIndex ? 'text-green-400' : 'text-yellow-400'} cursor-pointer hover:text-green-300 flex justify-between items-center`}
                                >
                                    <span onClick={() => {
                                        setCurrentFileIndex(index)
                                        if (isPlaying) {
                                            Tone.Transport.stop()
                                            loadAndPlayMIDI(file)
                                        }
                                    }}>
                                        {file.name}
                                    </span>
                                    <Button
                                        onClick={() => readMIDIFile(file)}
                                        size="sm"
                                        variant="ghost"
                                        className="text-yellow-400 hover:text-green-400"
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {midiInfo && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-xl" style={{ border: '2px solid #888' }}>
                        <h2 className="text-yellow-400 text-lg font-semibold mb-2" style={{ fontFamily: "'VT323', monospace" }}>MIDI Info:</h2>
                        <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-gray-800">
                            {midiInfo}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
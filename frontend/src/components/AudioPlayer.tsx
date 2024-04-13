import React, { useState, useEffect, useRef } from "react";
import { Slider } from "@mui/material";
import { FaPause, FaPlay } from "react-icons/fa";
import { IoPlayBack, IoPlayForward } from "react-icons/io5";
import { formatTime } from "../utils";

interface Props {
    audioUrls: string[];
    audioDuration: number;
}

const AudioPlayer: React.FC<Props> = ({ audioUrls, audioDuration }) => {
    const JUMP_INTERVAL = 2;
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioIndex, setAudioIndex] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audioElement = audioRef.current;

        if (audioElement) {
            const updateTime = () => {
                setCurrentTime(audioElement.currentTime);
            };

            audioElement.addEventListener("timeupdate", updateTime);

            const endedHandler = () => {
                playNextAudio();
            };

            audioElement.addEventListener("ended", endedHandler);

            return () => {
                audioElement.removeEventListener("timeupdate", updateTime);
                audioElement.removeEventListener("ended", endedHandler);
            };
        }
    }, [audioIndex, audioUrls]);

    useEffect(() => {
        if (isPlaying) {
            const audioElement = audioRef.current;
            if (audioElement) {
                audioElement.src = audioUrls[audioIndex];
                audioElement.play().catch((error) => {
                    console.error("Error playing audio:", error);
                });
            }
        }
    }, [isPlaying, audioIndex, audioUrls]);

    const togglePlay = () => {
        const audioElement = audioRef.current;
        if (audioElement) {
            if (isPlaying) {
                audioElement.pause();
            } else {
                audioElement.play().catch((error) => {
                    console.error("Error playing audio:", error);
                });
            }
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressBar = (_event: Event, newValue: number | number[]) => {
        const newTime = typeof newValue === "number" ? newValue : newValue[0];
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            if (newTime >= audioRef.current.duration) {
                playNextAudio();
            } else if (newTime <= 0) {
                playPrevAudio();
            } else {
                setCurrentTime(newTime);
            }
        }
    };

    const fastForward = () => {
        if (audioRef.current) {
            if (
                audioRef.current.currentTime + JUMP_INTERVAL >=
                audioRef.current.duration
            ) {
                playNextAudio();
            } else {
                audioRef.current.currentTime += JUMP_INTERVAL;
            }
        }
    };

    const fastBackward = () => {
        if (audioRef.current) {
            if (audioRef.current.currentTime - JUMP_INTERVAL <= 0) {
                playPrevAudio();
            } else {
                audioRef.current.currentTime -= JUMP_INTERVAL;
            }
        }
    };

    const playPrevAudio = () => {
        if (audioIndex > 0) {
            setAudioIndex(audioIndex - 1);
        }
    };

    const playNextAudio = () => {
        if (audioIndex < audioUrls.length - 1) {
            setAudioIndex(audioIndex + 1);
        } else {
            setAudioIndex(0);
            setIsPlaying(false);
        }
    };

    return (
        <>
            <div className="slider_div">
                <audio
                    ref={audioRef}
                    onCanPlayThrough={() => {
                        if (isPlaying) {
                            audioRef.current?.play().catch((error) => {
                                console.error("Error playing audio:", error);
                            });
                        }
                    }}
                    onEnded={playNextAudio}
                    typeof="audio/wav"
                />
                <label>{formatTime(currentTime)}</label>
                <Slider
                    value={currentTime}
                    max={audioDuration}
                    step={0.01}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatTime(value)}
                    onChange={handleProgressBar}
                    aria-label="Default"
                />
                <label>{formatTime(audioDuration)}</label>
            </div>
            <div className="icons">
                <button type="button" onClick={fastBackward}>
                    <IoPlayBack color="rgb(59 130 246)" size={42} />
                </button>
                <button type="button" onClick={togglePlay}>
                    {isPlaying ? (
                        <FaPause color="rgb(59 130 246)" size={42} />
                    ) : (
                        <FaPlay color="rgb(59 130 246)" size={42} />
                    )}
                </button>
                <button type="button" onClick={fastForward}>
                    <IoPlayForward color="rgb(59 130 246)" size={42} />
                </button>
            </div>
        </>
    );
};

export default AudioPlayer;

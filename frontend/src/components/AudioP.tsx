import React, { useRef } from "react";
import { useFetchAudioRecording } from "../hooks/CustomFetchHooks";

interface Props {
    id: string;
}

const AudioP: React.FC<Props> = ({ id }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { isLoading, error, data } = useFetchAudioRecording(id);

    if (isLoading) {
        return <span className="container_label">Loading...</span>;
    }

    if (error) {
        return <span className="container_label">error: {error.message}</span>;
    }

    if (data) {
        const audioSrc = URL.createObjectURL(data);

        return (
            <div>
                <audio controls ref={audioRef}>
                    {/* Set the audio source */}
                    <source src={audioSrc} type="audio/wav" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }

    return "";
};

export default AudioP;

import { useContext, useEffect, useState } from "react";
import { MyContext } from "../MyContext";
import { formatTime } from "../utils";
import AudioP from "./AudioP";

const ChosenRecording: React.FC = () => {
    const { chosenRecording } = useContext(MyContext);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_key, setKey] = useState(0);

    useEffect(() => {
        // ensure component unmounting
        setKey((prevKey) => prevKey + 1);
    }, [chosenRecording]);

    if (!chosenRecording) {
        return (
            <div className="chosen_container">
                <span className="container_label">Chose Recording</span>
            </div>
        );
    }

    return (
        <div className="chosen_container">
            <span className="container_label">Chosen Recording</span>
            <div className="chosen">
                <div className="labels">
                    <label>
                        name: {chosenRecording.name || "Recording Name"}
                    </label>
                    <label>file size: {chosenRecording.fileSize}</label>
                    <label>
                        length:
                        {formatTime(chosenRecording.recordingLength / 1000) ||
                            "Recording Length"}
                    </label>
                </div>
                {/* <AudioPlayer
                    key={key}
                    audioUrls={data ?? []}
                    audioDuration={
                        parseInt(chosenRecording.recordingLength.toString()) /
                        1000
                    }
                /> */}
                <AudioP id={chosenRecording.id} />
            </div>
        </div>
    );
};

export default ChosenRecording;

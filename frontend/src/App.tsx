import "./App.css";
import ChosenRecording from "./components/ChosenRecording";
import RecordingList from "./components/RecordingList";
import RunningRecordings from "./components/RunningRecordings";
import { MyContext } from "./MyContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { RecordingMetadata } from "./interfaces";

function App() {
    const [chosenRecording, setChosenRecording] = useState<
        RecordingMetadata | undefined
    >(undefined);

    return (
        <>
            <ToastContainer />
            <MyContext.Provider value={{ chosenRecording, setChosenRecording }}>
                <RecordingList />
                <RunningRecordings />
                {/* <RunningRecording /> */}
                <ChosenRecording />
            </MyContext.Provider>
        </>
    );
}

export default App;

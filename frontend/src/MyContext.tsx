import { createContext, Dispatch, SetStateAction } from "react";
import { RecordingMetadata } from "./interfaces";

interface ContextType {
    chosenRecording: RecordingMetadata | undefined;
    setChosenRecording: Dispatch<SetStateAction<RecordingMetadata | undefined>>;
}

export const MyContext = createContext<ContextType>({
    chosenRecording: undefined,
    setChosenRecording: () => {},
});

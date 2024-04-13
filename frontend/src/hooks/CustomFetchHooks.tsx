import { useQuery } from "@tanstack/react-query";
import { recordingsFetch } from "../utils";
import { RecordingMetadata } from "../interfaces";

export const useFetchRecordings = () => {
    const { isLoading, error, data } = useQuery<RecordingMetadata[]>({
        queryKey: ["recordings"],
        queryFn: async () => {
            const response = await recordingsFetch.get("/recordings/");
            return response.data.data;
        },
    });

    return { isLoading, error, data };
};

export const useFetchRunningRecordings = () => {
    const { isLoading, error, data } = useQuery<RecordingMetadata[]>({
        queryKey: ["runningRecordings"],
        queryFn: async () => {
            const response = await recordingsFetch.get("/runningRecording/");
            return response.data.data;
        },
    });

    return { isLoading, error, data };
};

export const useFetchRecording = (obj?: RecordingMetadata) => {
    const { isLoading, error, data } = useQuery<string[]>({
        queryKey: obj ? ["recording", obj.id] : [],
        queryFn: async () => {
            const response = await recordingsFetch.get(
                `/recordings/${obj?.id}`
            );
            return response.data;
        },
    });

    return { isLoading, error, data };
};

export const useFetchAudioRecording = (id: string) => {
    const { isLoading, error, data } = useQuery<
        string,
        Error,
        Blob | MediaSource
    >({
        queryKey: ["audio", id],
        queryFn: async () => {
            const response = await recordingsFetch.get(
                `/recordings/object/${id}`,
                {
                    responseType: "blob",
                }
            );
            return response.data;
        },
    });

    return { isLoading, error, data };
};

import axios, { AxiosInstance } from "axios";
import { RecordingMetadata } from "./interfaces";

export const recordingsFetch: AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/v1",
});

export const formatTime = (seconds: number): string => {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const remainingSeconds: number = Math.floor(seconds % 60);

    const formattedTime: string = [hours, minutes, remainingSeconds]
        .map((unit) => (unit < 10 ? `0${unit}` : `${unit}`))
        .join(":");

    return formattedTime;
};

export const orderData = (
    value: number,
    data: RecordingMetadata[]
): RecordingMetadata[] => {
    if (!data) {
        return [];
    }

    const orderedData: RecordingMetadata[] = [...data];

    switch (value) {
        case 0:
            orderedData.sort((a, b) => a.date.getTime() - b.date.getTime());
            break;
        case 1:
            orderedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 2:
            orderedData.sort((a, b) => a.recordingLength - b.recordingLength);
            break;
    }

    return orderedData;
};

export const filterData = (
    value: string,
    data: RecordingMetadata[]
): RecordingMetadata[] => {
    if (!data) {
        return [];
    }

    const filteredData: RecordingMetadata[] = data.filter((recording) =>
        recording?.name?.toLowerCase().includes(value.toLowerCase())
    );

    return filteredData;
};

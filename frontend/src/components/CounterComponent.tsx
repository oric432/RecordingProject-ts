import React, { useState, useEffect } from "react";
import { formatTime } from "../utils";

interface Props {
    count: number;
}

const CounterComponent: React.FC<Props> = ({ count }) => {
    const [counter, setCounter] = useState<number>(count);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCounter((prevCounter) => prevCounter + 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return <label>{formatTime(counter)}</label>;
};

export default CounterComponent;

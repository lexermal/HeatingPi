import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { TEMPERATURE } from "../../utils/backendCalls";

let isLoaded = null;

export default function Temperature(props: { unit: string }): JSX.Element {
    const [getTemperature, { data }] = useLazyQuery(TEMPERATURE, { fetchPolicy: "cache-and-network" });

    useEffect(() => {
        isLoaded = true
        triggerOnlineCycle(() => getTemperature());

        // page unmount
        return function cleanup() {
            isLoaded = false
        };
    }, []);

    return <span>{data && (data.temperature + props.unit)}</span>;
}

function triggerOnlineCycle(fetching: () => void) {
    setTimeout(() => {
        if (isLoaded) {
            fetching();

            triggerOnlineCycle(fetching);
        }
    }, 2000)
}

import React from 'react';

import {getSchedule, getVessels} from './fetcher';
import {PromisePool} from './pool';

const MAX_POOL_SIZE = 3;

const App = function () {
    React.useEffect(() => {
        (async () => {
            const vessels = await getVessels();
            const schedules = await PromisePool(MAX_POOL_SIZE).all(
                vessels.map((vessel) => {
                    return function () {
                        return getSchedule(vessel.imo);
                    };
                })
            );
            console.log(schedules);
        })();
    }, []);

    return (
        <>
            <h1>Promise Pool Manager</h1>
            <p>Open the Network console to check how it's working</p>
        </>
    );
};

export default App;

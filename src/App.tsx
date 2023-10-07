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

    return <h1>Vite + React</h1>;
};

export default App;

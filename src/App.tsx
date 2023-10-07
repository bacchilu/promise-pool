import React from 'react';

import {getSchedule, getVessels} from './fetcher';

const MAX_POOL_SIZE = 3;

const PromisePool = (function <T>() {
    const pendings = [] as (() => Promise<T>)[];
    const results = [] as (T | undefined)[];

    const getConsumer = async function (size: number): Promise<void> {
        const index = size - pendings.length;
        const currentFactory = pendings.shift();
        if (currentFactory === undefined) return;
        results[index] = await currentFactory();
        return getConsumer(size);
    };

    return {
        all: function (promiseFactoryList: (() => Promise<T>)[]) {
            return new Promise((resolve: (t: T[]) => void) => {
                (async function () {
                    pendings.push(...promiseFactoryList);
                    results.push(...promiseFactoryList.map(() => undefined));

                    const promisesArray = [];
                    for (let i = 0; i < MAX_POOL_SIZE; ++i) promisesArray.push(getConsumer(promiseFactoryList.length));

                    await Promise.all(promisesArray);
                    resolve(results as T[]);
                })();
            });
        },
    };
})();

const App = function () {
    React.useEffect(() => {
        (async () => {
            const vessels = await getVessels();
            const schedules = await PromisePool.all(
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

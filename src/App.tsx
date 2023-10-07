import React from 'react';

import {Observer, getSchedule, getVessels} from './fetcher';
import {PromisePool} from './pool';

const MAX_POOL_SIZE = 3;

const App = function () {
    const [requestsInProgress, setRequestsInProgress] = React.useState(0);
    const [maxPoolSize, setMaxPoolSize] = React.useState(MAX_POOL_SIZE);
    React.useEffect(() => {
        const cb = function (data: number) {
            setRequestsInProgress(data);
        };

        Observer.register(cb);
        return function () {
            Observer.unregister(cb);
        };
    }, []);

    const onSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const vessels = await getVessels();
        console.log(maxPoolSize);
        const schedules = await PromisePool(maxPoolSize).all(
            vessels.map((vessel) => {
                return function () {
                    return getSchedule(vessel.imo);
                };
            })
        );
        console.log(schedules);
    };

    return (
        <>
            <h1>Promise Pool Manager</h1>
            <p>Open the Network console to check how it's working</p>
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label htmlFor="max_pool_size" className="form-label">
                        MAX POOL SIZE
                    </label>
                    <input
                        type="number"
                        min={1}
                        step={1}
                        className="form-control"
                        id="max_pool_size"
                        value={maxPoolSize}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setMaxPoolSize(+e.target.value);
                        }}
                    />
                    <div className="form-text">MAX POOL SIZE</div>
                </div>
                <button type="submit" className="btn btn-primary">
                    Start Fetching
                </button>
            </form>
            <h1 className="display-1">{requestsInProgress}</h1>
        </>
    );
};

export default App;

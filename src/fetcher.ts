import axios, {AxiosError} from 'axios';

export const Observer = (function () {
    let cbs = [] as ((arg: number) => void)[];

    return {
        register: function (cb: (arg: number) => void) {
            cbs = [...cbs, cb];
        },
        unregister: function (cb: (arg: number) => void) {
            cbs = cbs.filter((item) => item !== cb);
        },
        notifyAll: function (arg: number) {
            for (const cb of cbs) cb(arg);
        },
    };
})();

const AxiosInstance = (function () {
    let requestsInProgress = 0;

    const axiosInstance = axios.create();
    axiosInstance.interceptors.request.use((config) => {
        requestsInProgress++;
        Observer.notifyAll(requestsInProgress);
        return config;
    });

    axiosInstance.interceptors.response.use(
        (response) => {
            requestsInProgress--;
            Observer.notifyAll(requestsInProgress);
            return response;
        },
        (error) => {
            requestsInProgress--;
            Observer.notifyAll(requestsInProgress);
            return Promise.reject(error);
        }
    );

    return {value: axiosInstance, register: Observer.register, unregister: Observer.unregister};
})();

interface Vessel {
    imo: number;
    name: string;
}

interface Port {
    id: string;
    name: string;
}

interface PortCall {
    port: Port;
    arrival: Date;
    departure: Date;
    isOmitted: boolean;
}

interface ScheduleReturned {
    portCalls: {
        port: Port;
        arrival: string;
        departure: string;
        isOmitted: boolean;
    }[];
}

const parseSchedule = function (item: ScheduleReturned) {
    return item.portCalls.map(
        (pc) =>
            ({
                port: pc.port,
                arrival: new Date(pc.arrival),
                departure: new Date(pc.departure),
                isOmitted: pc.isOmitted,
            } as PortCall)
    ) as PortCall[];
};

export const getSchedule = async function (imo: number) {
    try {
        const res = await AxiosInstance.value.get<PortCall[]>(
            `https://import-coding-challenge-api.portchain.com/api/v2/schedule/${imo}`,
            {
                transformResponse: [
                    (data: string) => {
                        const parsedData = JSON.parse(data) as ScheduleReturned;
                        return parseSchedule(parsedData);
                    },
                ],
            }
        );
        return res.data;
    } catch (error) {
        throw (error as AxiosError).message;
    }
};

export const getVessels = async function () {
    try {
        const res = await AxiosInstance.value.get<Vessel[]>(
            'https://import-coding-challenge-api.portchain.com/api/v2/vessels'
        );
        return res.data;
    } catch (error) {
        throw (error as AxiosError).message;
    }
};

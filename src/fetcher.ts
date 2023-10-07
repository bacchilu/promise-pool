import axios, {AxiosError} from 'axios';

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
        const res = await axios.get<PortCall[]>(
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
        const res = await axios.get<Vessel[]>('https://import-coding-challenge-api.portchain.com/api/v2/vessels');
        return res.data;
    } catch (error) {
        throw (error as AxiosError).message;
    }
};

export const PromisePool = function <T>(MAX_POOL_SIZE: number) {
    const pendings = [] as (() => Promise<T>)[];
    const results = [] as (T | undefined)[];

    const getConsumer = async function (size: number): Promise<void> {
        const index = size - pendings.length;
        const currentFactory = pendings.shift();
        if (currentFactory === undefined) return;
        results[index] = await currentFactory();
        return await getConsumer(size);
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
};

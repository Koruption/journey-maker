namespace Journey {
    export class DataStream<T = any> {
        data = Array<T>();
        subs = Array<(data?: T) => void | Promise<void>>();
        on(sub: (data?: T) => void | Promise<void>) {
            this.subs.push(sub);
        }
        push(streamData: T) {
            this.data.push(streamData);
            this.subs.forEach(sub => sub(streamData))
        }
    }
    let outStream = new DataStream();
    let inStream = new DataStream();

    export namespace outputs {
        export const write = <T = any>() => {
            return (...args: T[]) => { outStream.push(args); }
        }
        // export const update = async (cb: (data?: any) => void | Promise<void>) => {
        //     outStream.on(cb);
        // }
        export const update = <T = any>() => {
            return (cb: (data?: T) => void | Promise<void>) => {
                outStream.on(cb);
            }
        }
    }

    export namespace inputs {
        export const write = <T = any>() => {
            return (...args: T[]) => { inStream.push(args); }
        }
        // export const update = async (cb: (data?: any) => void | Promise<void>) => {
        //     inStream.on(cb);
        // }
        export const update = <T = any>() => {
            return (cb: (data?: T) => void | Promise<void>) => {
                inStream.on(cb);
            }
        }
    }

    export let _start: () => void | Promise<void>;

    export const startup = async () => {
        // do engine setup
        // ...
        console.log('Staring Journey Engine.')
        await _start()
    };

    export const start = async (cb: () => void | Promise<void>) => {
        _start = cb;
    }

    export const streamOut = (...args: any[]) => {
        outStream.push(args);
    }

    export const streamIn = (...args: any[]) => {
        inStream.push(args)
    }


    export const renderer = <T = any>() => {
        outStream = new DataStream<T>();
        const write = inputs.write<T>();
        const update = outputs.update<T>();
        return { write, start, update }
    }
    export const controller = <T = any>() => {
        inStream = new DataStream<T>();
        const write = outputs.write<T>();
        const update = inputs.update<T>();
        return { write, start, update }
    }

    export function run(...components: (() => void)[]) {
        components.forEach(component => component());
        startup();
        let i = 0;
        let f = setInterval(() => {
            if (i >= 2) clearInterval(f)
            i += 1;
            outStream.push(`Data ${i}`)
        }, 3000);
    }
}

export function myRenderer() {
    const { start, update, write } = Journey.renderer<{ question: string, answer: string }>();
    let inputCounter = 0;
    start(() => {
        console.log('My Renderer Started!');
    })
    update(async (data) => {
        if (inputCounter >= 1) return;
        console.log(`Renderer updated with: ${data}`);
        write({ question: 'Why have you come here young wanderer?', answer: '...' })
        inputCounter += 1
    });
}

export function myController() {
    const { start, update, write } = Journey.controller<{ question: string, answer: string }>();
    let inputCounter = 0;
    start(() => {
        console.log(`Controller started!`)
    })
    update((data) => {
        if (inputCounter >= 1) return;
        console.log(`Controller updated with data: ${data}`)
        inputCounter += 1
        write({ question: '' })
    })
}

Journey.run(myRenderer, myController);
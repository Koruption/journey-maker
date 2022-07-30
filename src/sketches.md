```ts
// gets attached to out stream
// can write to input stream
export myRenderer = async () => {
  const { write, update, start } = renderer();
  start(() => {
    prompt({
      'Welcome to the world of grandor'
    })
  })

  // listen for changes in the out stream
  update(async (question) => {
      if (question.type === 'SELECT') {
        write(await select(data.question))
        return
      }
      // write to the input stream
    write(await prompt(data.question))
  })
  return render()
}

// gets attached to in stream
// can write to output stream
// export myController = async () => {
//   const { write, onUpdate } = engine()
//   // write to output stream
//   write({
//     question: 'Do you know the tale of Grandor The Great?', 
//     choices: ['yes', 'no']
//     })
//   // listen for changes on the in stream
//   onUpdate(data => {
    
//   })
//   return process({}, {})
// }

export myController = async () => {
  const { write, update, journey } = controller();

}

...

JourneyEngine.controllers.use()



// === working prototype ===

namespace Journey {
    export class DataStream {
        data = Array<any>();
        subs = Array<(data?: any) => void | Promise<void>>();
        on(sub: (data?: any) => void | Promise<void>) {
            this.subs.push(sub);
        }
        push(streamData: any) {
            this.data.push(streamData);
            this.subs.forEach(sub => sub(streamData))
        }
    }
    export const outStream = new DataStream();
    export const inStream = new DataStream();

    export namespace outputs {
        export const write = (...args: any[]) => { outStream.push(args); }
        export const update = async (cb: (data?: any) => void | Promise<void>) => {
            outStream.on(cb);
        } 
    }
    export namespace inputs {
        export const write = (...args: any[]) => { inStream.push(args); }
        export const update = async (cb: (data?: any) => void | Promise<void>) => {
            inStream.on(cb);
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

    
    export const renderer = () => {
        const write = inputs.write;
        const update = outputs.update;
        return { write, start, update }
    }
    export const controller = () => {
        const write = outputs.write;
        const update = inputs.update;
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
    const { start, update, write } = Journey.renderer();
    let inputCounter = 0;
    start(() => {
        console.log('My Renderer Started!');
    })
    update(async (data) => {
        if (inputCounter >= 1) return;
        console.log(`Renderer updated with: ${data}`);
        write('I', ' Recieved', ' The', ' Data', ['💖']);
        inputCounter += 1
    });
}

export function myController() {
    const { start, update, write } = Journey.controller();
    let inputCounter = 0;
    start(() => {
        console.log(`Controller started!`)
    })
    update((data) => {
        if (inputCounter >= 1) return;
        console.log(`Controller updated with data: ${data}`)
        inputCounter += 1
        write('This data came from the controller!')
    })
}

Journey.run(myRenderer, myController);



```

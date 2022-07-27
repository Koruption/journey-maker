import { Readable, Writable } from 'stream';

// // Reading the data 
// const inStream = new Readable({
//     read() { }

// });

// // Pushing the data to the stream
// let i = 0;
// setInterval(() => {
//     if (i != 10) {
//         inStream.push(JSON.stringify({ time: `${new Date().getTime()}` }));
//         i += 1;
//     }
//     else {
//         inStream.push(null);
//         clearInterval(this);
//     }
// }, 2000)

// inStream.on('data', (data: any) => { console.log(`${data}`) })


// const userInput = new Readable({
//     inputs =[];
//     read() { }
// });

class TerminalInput extends Readable {
    protected inputs: string[] = [];
    constructor(opts?: any) { super(opts) }
    _read() { }
    close() { this.push(null) }
    // end() { this.push(null) }
    put(question: { text: string, index: number }) {
        this.push(JSON.stringify(question))
        this.inputs.push(JSON.stringify(question))
    }
}

const input = new TerminalInput();
input.on('data', (data) => { console.log(`data ${data}`) })
input.on('end', () => { console.log('Stream Ended..') })
setInterval(() => {
    input.put({ text: 'Someone pushes you', index: 1 })
}, 1000)
input.put({ text: 'Someone pushes you', index: 1 })
input.put({ text: 'Someone pushes you', index: 2 })
input.put({ text: 'Someone pushes you', index: 4 })
setTimeout(() => {
    console.log('here')
    input.put({ text: 'Youve reached the cave', index: 3 })
}, 3000)
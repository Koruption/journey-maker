import { createWriteStream, writeFileSync, WriteStream } from "fs";
import path from "path";

export namespace Journey {
  export namespace utils {
    /**
     * `isQuestion` is a function that takes a parameter `data` and returns a boolean value that is true if
     * `data` is an instance of `Question` and false otherwise
     * @param {Question | any} data - Question | any
     * @returns A function that takes a parameter and returns a boolean.
     */
    export const isQuestion = (data: Question | any) => {
      return data instanceof Journey.Question
    }
    /**
     * `isNotQuestion` is a function that takes a `Question` or `any` and returns a boolean that is the
     * opposite of whether the data is an instance of `Question`
     * @param {Question | any} data - Question | any
     * @returns A function that takes a parameter and returns a boolean.
     */
    export const isNotQuestion = (data: Question | any) => {
      return !(data instanceof Journey.Question)
    }

    export namespace Logging {
      let logFileName = 'log-'.concat(new Date().toLocaleTimeString().replace(':', '-'));
      let logStream: WriteStream;
      export const start = async () => {
        // logStream = createWriteStream('logs.txt')
        logStream = createWriteStream(path.join('src', 'logs', `${logFileName}.txt`))
        await new Promise<void>((res, rej) => {
          logStream.on('open', () => res())
        })
        return
      }
      export const close = () => {
        logStream.close();
      }
      export const log = (...messages: any[]) => {
        messages.forEach(data => {
          data = typeof data != 'string' ? JSON.stringify(data) : data;
          logStream.write(`\n log (${new Date().toLocaleTimeString()}): ${data}`);
        })
      }
    }

    export namespace Timers {
      /**
       * `sleep` is a function that takes a number of milliseconds and returns a promise that resolves after
       * that number of milliseconds.
       * @param {number} time - number - The amount of time to sleep in milliseconds.
       * @returns Nothing.
       */
      export const sleep = async (time: number) => {
        await new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, time)
        })
        return
      }
      /**
       * `seconds` is a function that takes a number of seconds and returns the number of milliseconds
       * @param {number} seconds - number
       * @returns A function that takes a number and returns that number multiplied by 1000.
       */
      export const seconds = (seconds: number) => {
        return seconds * 1000
      }
      /**
       * `milliseconds` takes a number of milliseconds and returns the number of seconds
       * @param {number} milliseconds - number
       * @returns the value of milliseconds divided by 1000.
       */
      export const milliseconds = (milliseconds: number) => {
        return milliseconds / 1000
      }
    }

    export namespace rendering {
      export const clear = () => {
        console.clear()
      }
      export const blink = async (
        character: string,
        every: number = 800,
        nTimes: number = 3,
      ) => {
        const interval = await new Promise<void>((resolve, reject) => {
          let doWrite = true
          let iteration = 0
          const ir = setInterval(() => {
            if (iteration === nTimes) {
              clearInterval(ir)
              resolve()
            }
            doWrite ? process.stdout.write(character) : clear()
            iteration = doWrite ? iteration += 1 : iteration
            doWrite = !doWrite;
          }, every)
        })
        clear()
      }
      export namespace text {
        export const animate = async (texts: { text: string, timeout?: number }[]) => {
          for (let _text of texts) {
            _text.timeout ? await _animate(_text.text, _text.timeout) : await _animate(_text.text)
          }
        }
        export const _animate = async (text: string, timeout: number = 5000, every: number = 20) => {
          let i = 0;
          let j = 1;
          await new Promise<void>((res, rej) => {
            let interval = setInterval(() => {
              process.stdout.write(text.slice(i, i + j))
              i += 1;
            }, every)
            setTimeout(() => {
              clearInterval(interval)
              process.stdout.clearScreenDown()
              res();
            }, timeout)
          })
          Journey.utils.rendering.clear()
        }
      }
    }
  }

  export abstract class QuestionParser<T extends Question = Question> {
    configPath: string = configurationPath
    abstract parse(): T[] | Promise<T[]>
  }

  export class Question {
    id: string = ''
    readonly question: string = ''
    readonly text: string = ''
    readonly choices: string | number | string[] | number[] = ''
    readonly type: 'SELECT' | 'MULTISELECT' | 'INPUT' | '' = ''
    readonly meta: any
    constructor(question?: Partial<Question>) {
      question ? Object.assign(this, question) : null
    }
  }

  class Response {
    private _write = Journey.controller().write
    constructor(private _execute: boolean) { }
    write(qid: string | number): void
    write(qid: Question): void
    write(qid: Question | string | any): void {
      if (!this._execute) return
      if (typeof qid === 'string') {
        questions.setCurrent(questions.getIndex(qid))
        const question = questions.get(qid)
        if (question) this._write(question)
      }
      this._write(qid)
    }
  }

  export class Answer {
    meta: any
    question: Question
    _linkedQuestion?: Question
    selection: number = -1
    text: string = ''
    constructor(data: {
      question: Question
      selection?: number
      text?: string
      _linkedQuestion?: Question
      meta?: any
    }) {
      const { question, _linkedQuestion, meta } = data
      this.question = question
      this._linkedQuestion = _linkedQuestion
      this.meta = meta
      this.selection = data.selection ? data.selection : -1
      this.text = data.text ? data.text : ''
    }
    get linkedQuestion() {
      return this._linkedQuestion
    }
    choice(...choices: number[]) {
      return new Response(choices.some(c => c === this.selection))
    }
    choices(choices: number[]) {
      return new Response(choices.every(c => c === this.selection))
    }
    hasLinked() {
      return this.linkedQuestion != null && this._linkedQuestion != undefined
    }
  }

  export class Questions<
    T extends Question = Question,
    K extends Answer = Answer
    > {
    private questionMap: Map<
      string,
      { question: Question; subs: Array<(answer: K) => void | Promise<void>> }
    > = new Map<
      string,
      { question: Question; subs: Array<(answer: K) => void | Promise<void>> }
    >()
    private _list: T[] = []
    private _currentIndex: number = 0

    constructor() {
      inStream.on((data: K) => {
        this.trigger(data.question.id, data)
      })
    }

    setCurrent(index: number) {
      this._currentIndex = index
    }
    getCurrent() {
      return this._list[this._currentIndex]
    }

    next() {
      const nextIndx = this._currentIndex + 1
      this._currentIndex = nextIndx
      return this._list[nextIndx]
    }

    previous() {
      const prevIndx = this._currentIndex - 1
      this._currentIndex = prevIndx
      return this._list[prevIndx]
    }

    get list() {
      return this._list
    }

    initialize(questions: T[]) {
      this._list = questions
      this._list.forEach(q =>
        this.questionMap.set(q.id, { question: q, subs: [] })
      )
    }
    on(qid: string, cb: (answer: K) => void | Promise<void>): void
    on(qid: number, cb: (answer: K) => void | Promise<void>): void
    on(qid: number[], cb: (answer: K) => void | Promise<void>): void
    on(qid: string[], cb: (answer: K) => void | Promise<void>): void
    on(
      qid: string | number | string[] | number[],
      cb: (answer: K) => void | Promise<void>
    ) {
      if (typeof qid === 'string' || typeof qid === 'number') {
        qid = typeof qid === 'number' ? qid.toString() : qid
        if (this.questionMap.has(qid)) {
          this.questionMap.get(qid)?.subs.push(cb)
          return
        }
        throw new Error(
          `Question with qid: ${qid} could not be found in the questions map.`
        )
      }
      qid.forEach(id => {
        id = typeof id === 'number' ? id.toString() : id
        if (this.questionMap.has(id)) {
          this.questionMap.get(id)?.subs.push(cb)
          return
        }
        throw new Error(
          `Question with qid: ${id} could not be found in the questions map.`
        )
      })
    }

    onAny(cb: (answer: K) => void | Promise<void>) {
      this.questionMap.forEach((k, v) => {
        k.subs.push(cb)
      })
    }

    get(qid: string) {
      if (!this.questionMap.has(qid))
        throw new Error(
          `Question with qid: ${qid} could not be found in the questions map.`
        )
      return this.questionMap.get(qid)?.question
    }

    getIndex(qid: string) {
      if (!this.questionMap.has(qid))
        throw new Error(
          `Question with qid: ${qid} could not be found in the questions map.`
        )
      return this._list.findIndex(q => q.id === qid)
    }

    private trigger(qid: string, answer: K) {
      if (!this.questionMap.has(qid))
        throw new Error(
          `Question with qid: ${qid} could not be found in the questions map.`
        )
      if (this.questionMap.get(qid)?.subs.length === 0) {
        return
      }
      this.questionMap.get(qid)?.subs.forEach(sub => sub(answer))
    }
  }

  export class DataStream<T = any> {
    data: Array<T> = new Array<T>()
    subs: Array<(data?: T) => void | Promise<void>> = new Array<
      (data?: T) => void | Promise<void>
    >()
    on(sub: (data?: T) => void | Promise<void>) {
      this.subs.push(sub)
    }
    push(streamData: T) {
      this.data.push(streamData)
      this.subs.forEach(sub => {
        sub(streamData)
      })
    }
  }

  const outStream = new DataStream()
  const inStream = new DataStream()
  const starts = new Array<() => void | Promise<void>>()
  const questions = new Questions()
  const loggingDir: string = './logs/'
  let configurationPath = 'questions.yml'
  let _parser: QuestionParser;

  // Writes to terminal from controller
  export namespace outputs {
    export const write = <T extends Question = Question>() => {
      return (data: any | Question) => {
        // console.log('Writing from output')
        outStream.push(data)
      }
    }
  }

  // Writes to controller from terminal
  export namespace inputs {
    export const write = <T extends Answer = Answer>() => {
      return (data: T) => {
        inStream.push(data)
      }
    }
    export const update = <T extends Question = Question>() => {
      return (cb: (data?: T) => void | Promise<void>) => {
        outStream.on(cb)
      }
    }
  }

  export const startup = async () => {
    // do engine setup
    // ...
    //console.log('Staring Journey Engine.')
    await utils.Logging.start();
    utils.rendering.clear();
    for (let start of starts) {
      await start()
    }
  }

  export const start = async (cb: () => void | Promise<void>) => {
    starts.push(cb)
  }

  export const streamOut = (...args: any[]) => {
    outStream.push(args)
  }

  export const streamIn = (...args: any[]) => {
    inStream.push(args)
  }

  export const renderer = <
    T extends Answer = Answer,
    K extends Question = Question
  >() => {
    const write = inputs.write<T>()
    const update = inputs.update<K>()
    return { write, start, update, utils }
  }

  export const controller = <
    T extends Answer = Answer,
    K extends Question = Question
  >() => {
    const write = outputs.write<K>()
    // const update = outputs.update<T>();
    // return { write, start, update, questions }
    return { write, start, questions, utils }
  }

  export async function configure(parser: QuestionParser, _configPath?: string) {
    if (_configPath) configPath(_configPath)
    _parser = parser
  }

  export function configPath(fPath: string) {
    configurationPath = fPath
  }

  export async function run(...components: (() => void)[]) {
    questions.initialize(await _parser.parse())
    components.forEach(component => component())
    await startup()
  }
}

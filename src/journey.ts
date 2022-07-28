import { Readable } from 'stream'

export interface Question {
  id: string | number
  text: string
  type: 'INPUT' | 'CHOICE'
  choices: { text: string; selected: boolean }[]
  meta?: string[]
}

export const question = (
  text: string,
  choices?: { text: string; selected: boolean }[],
  opts?: {
    id?: string | number
    meta?: string[]
  }
): Question => {
  return {
    text: text,
    type: choices ? 'CHOICE' : 'INPUT',
    id: opts?.id ? opts.id : 'no-id',
    meta: opts?.meta ? opts.meta : [],
    choices: choices ? choices : []
  }
}

export const choices = (choices: string[]) => {
  return choices.map(choice => {
    return { text: choice, selected: false }
  })
}

export class Response {
  constructor (
    readonly validSender: boolean = false,
    readonly input: TerminalInput,
    public question?: Question
  ) {}
  send (question?: Question) {
    this.question = question ? question : this.question
    // console.log('sending response: ', data)
    JourneyEngine.instance().out(this)
  }
}

export class TerminalInput {
  constructor (
    public question: Question,
    public input: { choiceIndex?: number; text?: string }
  ) {}
  chosen (data: string | number) {
    return this.question.type == 'CHOICE' && this.input.choiceIndex === data
      ? new Response(true, this)
      : new Response(false, this)
  }
}

export class TerminalInputStream extends Readable {
  _read () {}
  serializer: ((question: TerminalInput) => string) | null = null
  put (question: TerminalInput) {
    const serialize =
      this.serializer != null
        ? this.serializer
        : (q: TerminalInput) => {
            return JSON.stringify(q)
          }
    this.push(serialize(question))
  }
}

export class TerminalOutputStream extends Readable {
  _read () {}
  serializer: ((response: Response) => string) | null = null
  put (response: Response) {
    const serialize =
      this.serializer != null
        ? this.serializer
        : (q: Response) => {
            return JSON.stringify(q)
          }
    this.push(serialize(response))
  }
}

export interface EngineMiddleware<T> {
  engine: JourneyEngine;
  init(): Promise<void> | void
  process(data: T): Promise<void> | void
  attachStream(...args: any[]): void;
}

export abstract class OutputMiddleware
  implements EngineMiddleware<Response> {
  private hasAttached: boolean = false;
  constructor (public engine: JourneyEngine) {}
  attachStream(outStream: TerminalOutputStream) {
    if (this.hasAttached) throw new Error(`This middleware has already attached to the engine.`);
    outStream.on('data', data =>
      this.process(this.asResponse(data))
    )
  }
  init (): Promise<void> | void {}
  asResponse (response: string) {
    const parsed = JSON.parse(response) as Response
    return new Response(parsed.validSender, parsed.input, parsed.question)
  }
  abstract process (response: Response): void | Promise<void>
}

export abstract class InputMiddleware
  implements EngineMiddleware<TerminalInput> {
    private hasAttached: boolean = false;
  constructor (public engine: JourneyEngine) {}

  attachStream(inStream: TerminalInputStream) {
    if (this.hasAttached) throw new Error('This has already attached to the engine.')
    inStream.on('data', data =>
      this.process(this.asInput(data))
    )
  }
  init (): Promise<void> | void {}
  asInput (input: string) {
    const parsed = JSON.parse(input) as TerminalInput
    return new TerminalInput(parsed.question, parsed.input)
  }
  abstract process (input: TerminalInput): Promise<void> | void
}

export class MiddlewareManager {
  private middleware = new Map<
    { new (...args: any[]): EngineMiddleware<any> },
    EngineMiddleware<any>
    >()
  constructor(private engine: JourneyEngine, private inStream: TerminalInputStream, private outStream: TerminalOutputStream) {}
  async use (middleware: { new (...args: any[]): EngineMiddleware<any> }) {
    if (this.middleware.has(middleware))
      throw new Error(
        `The middleware with constructor: ${middleware} has already been registered to the engine.`
      )
    const mInstance = new middleware(this.engine);
    mInstance instanceof InputMiddleware ? mInstance.attachStream(this.inStream) : mInstance.attachStream(this.outStream);
    await mInstance.init()
    this.middleware.set(middleware, mInstance)
  }
}

export abstract class QuestionParser {
  abstract parse(...args: any[]): Promise<Question[]> | Question[];
}

export class QuestionManager {
  private _questions: Question[] = [];
  private _currentQuestion: {q: Question | null, indx: number};
  get current() { return this.questions[this._currentQuestion?.indx] }
  get questions() { return this._questions;  }
  constructor(protected parser: QuestionParser) { 
    this._currentQuestion = { q: null, indx: -1 };
  }
  async configure(...args: any[]): Promise<void> {
    this._questions = await this.parser.parse(args);
  }
  get(qid: string | number) {
    return this._questions.find(q => q.id === qid )
  }
  next() {
    if (this._currentQuestion == undefined) {
      this._currentQuestion = { q: this._questions[0], indx: 0 };
      return this.current;
    }
    const newIndx = this._currentQuestion.indx + 1;
    if (newIndx > this._questions.length) throw new Error('Reached end of questions.')
    return this.setCurrentQuestion(newIndx)
  }

  private setCurrentQuestion(newIndx: number) {
    this._currentQuestion = { q: this._questions[newIndx], indx: newIndx }
    return this.current;
  }

  previous() {
    if (!this._currentQuestion?.indx) throw new Error('No new indx could be found in question manager.')
    const newIndx = this._currentQuestion.indx - 1;
    if (newIndx < 0) throw new Error('Reached beginning of questions.')
    return this.setCurrentQuestion(newIndx);
  }
  
  skip(by: number) {
    if (!this._currentQuestion?.indx) throw new Error('No new indx could be found in question manager.')
    const newIndx = this._currentQuestion.indx + by;
    if (newIndx > this._questions.length || newIndx < 0) throw new Error(`Skip question by ${by} is out of question range`);
    return this.setCurrentQuestion(newIndx);
  }
}

export class JourneyEngine {
  protected inStream: TerminalInputStream;
  protected outStream: TerminalOutputStream;
  private static _instance: JourneyEngine;

  middleware: MiddlewareManager;
  readonly questions: QuestionManager;

  constructor (parser: QuestionParser) {
    if (JourneyEngine._instance) throw new Error('Journey engine has already been instanced.')
    this.inStream = new TerminalInputStream()
    this.outStream = new TerminalOutputStream()
    this.middleware = new MiddlewareManager(this, this.inStream, this.outStream);
    this.questions = new QuestionManager(parser)
    JourneyEngine._instance = this
    return JourneyEngine._instance
  }
  static instance () {
    return JourneyEngine._instance
  }

  out (response: Response) {
    if (!response.validSender) return
    this.outStream.put(response)
  }
  in(input: TerminalInput) {
    this.inStream.put(input)
  }
  create () {
    return new Journey(this.inStream)
  }
}

export class Journey {
  protected qMap: Map<string | number, any[]> = new Map<string, any[]>()
  protected engine: JourneyEngine = JourneyEngine.instance()
  constructor(private inStream: TerminalInputStream) {
    this.inStream?.on('data', data => {
      const ioData = JSON.parse(data) as any
      const terminalInput = new TerminalInput(ioData.question, ioData.input)
      this.qMap
        .get(ioData.question.id)
        ?.forEach(f => f(terminalInput, new Response(true, terminalInput)))
    })
  }
  on (
    question: any,
    action: (answer: TerminalInput, response: Response) => void
  ) {
    if (!this.qMap.has(question)) {
      this.qMap.set(question, [action])
      return
    }
    this.qMap.get(question)?.push(action)
  }
}

export class SimpleOutMiddleware
  extends OutputMiddleware {
  process(response: Response): void | Promise<void> {
    console.log('Out middleware response received: ', response);
  }
}

export class SimpleInMiddleware
  extends InputMiddleware {
  process(input: TerminalInput): void | Promise<void> {
    console.log('Input middleware input received ', input)
  }
}

export class EngineInterface {
  constructor() {
    //JourneyEngine.instance().
  }
  start() {
    
  }
}
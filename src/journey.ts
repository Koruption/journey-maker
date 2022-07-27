import { Readable } from 'stream';

export interface Question {
  id: string | number;
  text: string;
  type: 'INPUT' | 'CHOICE',
  choices?: { text: string, selected: boolean }[];
  meta?: string[];
}

export const question = (text: string, choices?: { text: string, selected: boolean }[], opts?: {
  id?: string | number,
  meta?: string[]
}): Question => {
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
export class TerminalInput {
  constructor(public question: Question, public input: { choiceIndex?: number, text?: string }) { }
  chosen(data: string | number) {
    return this.question.type == 'CHOICE' && this.input.choiceIndex === data ? new Response(true, this) : new Response(false, this);
  }
}

export class TerminalInputStream extends Readable {
  _read() { }
  serializer: ((question: TerminalInput) => string) | null = null;
  put(question: TerminalInput) {
    const serialize = this.serializer != null ? this.serializer : (q: TerminalInput) => { return JSON.stringify(q) }
    // console.log('Putting data: ', serialize(question))
    this.push(serialize(question))
  }
}

export class TerminalOutputStream extends Readable {
  _read() { }
  serializer: ((response: Response) => string) | null = null;
  put(response: Response) {
    const serialize = this.serializer != null ? this.serializer : (q: Response) => { return JSON.stringify(q) }
    // console.log('Putting data: ', serialize(question))
    this.push(serialize(response))
  }
}

export class JourneyEngine {
  io: TerminalInputStream | null = null;
  outStream: TerminalOutputStream | null = null;
  private static _instance: JourneyEngine;
  constructor(stream?: TerminalInputStream, outStream?: TerminalOutputStream) {
    if (JourneyEngine._instance) return JourneyEngine._instance;
    this.io = stream ? stream : new TerminalInputStream();
    this.outStream = outStream ? outStream : new TerminalOutputStream();
    JourneyEngine._instance = this;
    return JourneyEngine._instance;
  }
  static instance() { return JourneyEngine._instance };
  out(response: Response) {
    if (!response.validSender) return;
    // otherwise output to console;
    // console.log('Engine outing response: ', response)
    this.outStream?.put(response);
  }
  create() { return new Journey() }
}
export class Response {

  constructor(readonly validSender: boolean = false, readonly input: TerminalInput, public question?: Question) { }
  send(question?: Question) {
    this.question = question ? question : this.question;
    // console.log('sending response: ', data)
    JourneyEngine.instance().out(this);
  }
}

export class Journey {
  protected qMap: Map<string | number, any[]> = new Map<string, any[]>();
  protected engine: JourneyEngine = JourneyEngine.instance();
  constructor() {
    this.engine.io?.on('data', (data) => {
      const ioData = JSON.parse(data) as any;
      const terminalInput = new TerminalInput(ioData.question, ioData.input);
      //console.log('input data stream received: ', ioData)
      this.qMap.get(ioData.question.id)?.forEach(f => f(terminalInput, new Response(true, terminalInput)));
    })
  }
  on(question: any, action: (answer: TerminalInput, response: Response) => void) {
    if (!this.qMap.has(question)) {
      this.qMap.set(question, [action]);
      return
    }
    this.qMap.get(question)?.push(action)
  }
}

const journey = new JourneyEngine().create();


journey.on('q1', (answer, response) => {
  console.log('answer: ', answer)
  // console.log('response: ', response)
  response.send(
    question(
      'A response 1',
      choices(['one', 'two'])
    ))
})

journey.on('q2', (answer, response) => {
  console.log('answer: ', answer)

  answer.chosen(1).send(question('A response 2 ~ wont send because this choice was not selected'))
  answer.chosen(2).send(question(`You have selected choice ${answer.input?.choiceIndex}`))
})

JourneyEngine.instance().io?.put(new TerminalInput(
  {
    id: 'q2',
    text: 'A fire breaks out in the tavern, what do you do?',
    choices: choices([
      'Run!',
      'Douse it with the nearest pint of grog',
      'Cast a random spell'
    ]),
    type: 'CHOICE'
  },
  { choiceIndex: 2 }
))

JourneyEngine.instance().outStream?.on('data', (data) => {
  console.log('Engine outData: ', JSON.parse(data));
})


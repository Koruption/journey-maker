// namespace journey {
//   const a = { as: 'someone' }
//   export const question = () => {
//     return {}
//   }
//   export const on = (q: string | typeof question, reaction: (answer: any, response: any) => void ) {
//     a.as
//   }
//   export class journey {

//     static on(q: string | typeof question, reaction: (answer: any, response: any) => void ) {
//       a.as
//     }
//   }
// }

export interface IQuestion {
  index: number;
  uid: string | number;
  choices?: string[]
  text: string;
  meta: string[];
}

export class Response {

  constructor(public question: IQuestion, public selected: boolean) {}
  send() { }
}

export interface IQuestionInput {
  text: string;
  choiceIndex?: number;
  choiceValue: string
  question: IQuestion,
  input?: string;
}

export class Answer {
  question: IQuestion;
  player: any;
  protected choices: Map<number | string, Response> = new Map<number | string, Response>();
  constructor(public selection: IQuestionInput) {
    this.question = selection.question;
    this.question.choices?.forEach((choice, index) => this.choices.set(index, new Response(selection.question, index === selection.choiceIndex)))
  }
  chosen(qName: string);
  chosen(qIndex: number);
  chosen(criteria: object);
  chosen(criteria?: object | number | string) {
    if (typeof criteria === 'string' || typeof criteria === 'number') { return this.choices.get(criteria) }
    Array.from(this.choices.values()).forEach(v => v.)
  }
}

export const question = (q: string, choices?: string[], ...meta: string[]): IQuestion => {
  return {
    text: q,
    uid: 'generate a uuid',
    index: 1, // TODO: change this later
    choices: choices,
    meta: meta
  }
}

export class JourneyMiddleware {
  use() {}
}

export class journey {
  protected static eventBus: Map<string | number, [reaction: (answer: any, response: any) => void]> 
  protected static answerHistory: Array<{ question: IQuestion, answer: Answer }> = []
  protected static _questionStack: Array<IQuestion> = new Array<IQuestion>();
  protected static _currentQuestion: IQuestion;
  protected static _currentAnswer: Answer;
  
  static get currentQuestion() { return journey._currentQuestion }
  static processNextQuestion() {
    journey._currentQuestion = this._questionStack[journey.currentQuestion.index + 1]
    journey.eventBus.get(journey.currentQuestion.index)?.forEach(r => r())
  }
  static getNextQuestion() {
    return this._questionStack[this._questionStack.length - 1]
  }

  static configure() {}


  static on(q: string, reaction: (answer: any, response: any) => void ) {
    //if (typeof q === 'string')
  }
}


//journey.on()

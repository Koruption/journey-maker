export class Question {
  id: string = ''
  readonly question: string = '';
  readonly choices: string | number | string[] | number[] = '';
  readonly type: 'SELECT' | 'MULTISELECT' | 'INPUT' | '' = '';
  constructor(question?: Partial<Question>) { question ? Object.assign(this, question) : null }
}

export class Answer {
  question: Question = new Question();
  write = Journey.controller().write;
  choice(...choices: number[]) {
    return this;
  }
  choices(choices: number[]) {
    return this;
  }
}

export function myController() {
  // const { start, update, write, questions } = Journey.controller<any>();
  const { start, write, questions } = Journey.controller<any>();
  let inputCounter = 0;
  start(async () => {
    console.log(`Controller started!`)
    // write('Some epic intro')
  })

  let engine: any;
  
  engine.on('q1', (answer: Answer) => {
    // answer.question.

    // choice 1 or 4 -> write
    answer.choice(1, 4).write(questions(3))
    // choice 2 & 3 -> write
    answer.choices([2, 3]).write(questions(3))
    // choice 5 -> write
    answer.choice(5).write(questions(3))
  })

  engine.on(['q1', 'q2'], (answer: any) => {
    answer.choice(1).write(questions(3))
  })
}
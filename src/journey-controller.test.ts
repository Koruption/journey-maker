import { Journey } from "./journey";

export function BasicController() {

  const { start, write, questions } = Journey.controller();

  start(async () => {
    console.log(`Controller started!`)
    write('Some epic intro')
    write(questions.getCurrent())
  })

  questions.on('q1', (answer) => {
    // choice 1 or 4 -> write
    answer.choice(1, 4).write(questions.next())
    // choice 2 & 3 -> write question 3
    answer.choices([2, 3]).write(3)
    // choice 5 -> write
    const linked = answer.linkedQuestion;
    if (linked) write(answer.linkedQuestion);
  })

  questions.on(['q1', 'q2'], (answer) => {

  })
}
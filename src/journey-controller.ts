import { Journey } from "./journey";

export function BasicController() {

  const { start, write, questions, utils } = Journey.controller();

  start(async () => {
    //console.log(`Controller started!`)
    write('Some epic intro')
    write(questions.getCurrent())
  })

  questions.onAny(async (answer) => {
    write(questions.next());
  })

  // questions.on('1', (answer) => {
  //   console.log('Question 1 responder called')
  //   //console.log(`Controller received answer: ${answer}`)
  //   const next = questions.next();
  //   console.log('next question: ', next)
  //   write(next)
  //   // choice 1 or 4 -> write
  //   answer.choice(1, 4).write(questions.next())
  //   // choice 2 & 3 -> write question 3
  //   answer.choices([2, 3]).write(3)
  //   // choice 5 -> write
  //   // const linked = answer.linkedQuestion;
  //   // if (linked) write(answer.linkedQuestion);
  // })

  // questions.on(['q1', 'q2'], (answer) => {

  // })
}
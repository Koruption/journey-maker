import { Journey } from "./journey";

const { prompt } = require('enquirer');
const { Select } = require('enquirer');

export function BasicRenderer() {
  const { start, update, write } = Journey.renderer();
  start(() => {
    console.log('My Renderer Started!');
  })
  update(async (question) => {
    // if (question?.type === 'INPUT') {
    //   write(await prompt({
    //     type: 'input',
    //     name: question.id,
    //     message: question.text
    //   }))
    // }
    write(await prompt({
      type: 'input',
      name: question?.id,
      message: question?.text
    }))
    console.log(`Renderer updated with: ${JSON.stringify(question)}`);
  });
}



// Journey.run(myRenderer, myController);
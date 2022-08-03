import { Journey } from "./journey";

const { prompt } = require('enquirer');
const { Prompt } = require('enquirer');
const { Select } = require('enquirer');

export function BasicRenderer() {
  const { start, update, write, utils } = Journey.renderer();
  start(async () => {
    // await utils.rendering.text.animate([
    //   { text: 'executing cybernetic process initialization.' },
    //   { text: 'checking data integrity.', timeout: 1000 },
    //   { text: '||||||||||||||||||||||||||||||||||||||||||||', timeout: 1000 },
    //   { text: 'data integrity has been verified.' },
    //   { text: 'initializing story sequences.' },
    //   { text: 'the story will begin now.', timeout: 2000 },
    // ])
  })
  update(async (question) => {
    if (Journey.utils.isNotQuestion(question)) {
      //console.log('Renderer Updating... ', question)
      return
    }
    let response;
    let answer;
    utils.Logging.log(question)
    // utils.rendering.image('landscape.jpg')
    utils.rendering.image('90sanime.gif')
    switch (question?.type) {
      case 'INPUT':
        response = await prompt({
          type: 'input',
          name: question?.id,
          message: question?.text
        });
        answer = new Journey.Answer({
          question: question,
          text: response[1]
        })
        break;
      case 'SELECT':
        response = await new Select({
          name: question?.id,
          message: question.text,
          limit: 1,
          choices: question?.choices,
          result(names: any) {
            return this.map(names);
          }
        }).run()
        utils.Logging.log(response)
        answer = new Journey.Answer({
          question: question,
          text: '',
          selection: response
        })
        // utils.Timers.sleep(2000)
        break;
      case 'MULTISELECT':
        response = await new Select({
          name: question?.id,
          message: question.text,
          choices: question?.choices,
          result(names: any) {
            return this.map(names);
          }
        }).run()
        utils.Logging.log(response)
        answer = new Journey.Answer({
          question: question,
          text: '',
          selection: response
        })
        break;
    }
    utils.rendering.clear()
    // await utils.rendering.blink('...')
    if (answer) write(answer)
  });
}
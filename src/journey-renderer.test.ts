import { Journey } from "./journey";

const { prompt } = require('enquirer');
const { Prompt } = require('enquirer');
const { Select } = require('enquirer');

export function BasicRenderer() {
  const { start, update, write, utils } = Journey.renderer();
  start(async () => {
    await utils.rendering.text.animate([
      { text: 'executing cybernetic process initialization.' },
      { text: 'checking data integrity.', timeout: 1000 },
      { text: '||||||||||||||||||||||||||||||||||||||||||||', timeout: 1000 },
      { text: 'data integrity has been verified.' },
      { text: 'initializing story sequences.' },
      { text: 'the story will begin now.', timeout: 2000 },
    ])
  })
  update(async (question) => {
    if (Journey.utils.isNotQuestion(question)) {
      //console.log('Renderer Updating... ', question)
      return
    }
    const r = await prompt({
      type: 'input',
      name: question?.id,
      message: question?.text
    });
    utils.rendering.clear()
    await utils.rendering.blink('...')
    const answer = new Journey.Answer({
      question: question as any,
      text: r[1]
    })
    write(answer)
  });
}
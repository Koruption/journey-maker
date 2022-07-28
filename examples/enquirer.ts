import { OutputMiddleware, Response, TerminalInput } from '../src/journey'
const { Select, Prompt } = require('enquirer')

export class EnquirerInterface extends OutputMiddleware {
  async process (response: Response) {
    const promptResponse  =
      await (response.question?.type === 'CHOICE'
        ? new Select({
            name: response.question?.id,
            message: response.question?.text,
            choices: response.question?.choices.map(choice => choice.text)
          })
        : new Prompt({
            name: response.question?.id,
            message: response.question?.text
        })).run()
    const input = { choiceIndex: response.question?.type === 'CHOICE' ? }
    this.engine.in(new TerminalInput(this.engine.questions.current, ))
  }
}

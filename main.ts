import {
  JourneyEngine,
  Journey,
  OutputMiddleware,
  Response,
  SimpleOutMiddleware,
  TerminalInput
} from './src/journey'
import { YAMLQuestionParser } from './src/parsers/yaml-question-parser'


(async () => {
  const engine = new JourneyEngine(new YAMLQuestionParser());
  const journey = engine.create();
  await engine.questions.configure('questions');


  engine.questions.next()

  engine.middleware.use(SimpleOutMiddleware)

  journey.on('Q1', (answer, response) => {
    response.send(engine.questions.get('Q3'))
  })
  
  engine.in(new TerminalInput(
    engine.questions.current,
    {
      choiceIndex: 2,
      text: engine.questions.current.choices[2].text
    }
  ))
})()

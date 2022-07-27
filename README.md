# Journey Maker
<figure>
<img src="https://get.wallhere.com/photo/pixel-art-castle-fantasy-art-clouds-dark-1929717.jpg" style="width: 100%">
<figcaption align = "center">
Image Credits - <a href="https://wallhere.com/en/wallpaper/1929717">wallhere.com</a>
</figcaption>
</figure>
A tool inspired by traditional I/O text based terminal games. Use it to easily create stories and branching narratives.

# Getting Started

```ts
const journey = JourneyEngine.create();
...

// when an input for question 1 is received, respond with question 3
journey.on('Q1', (answer, response) => {
  console.log(answer.player)
  response.send(engine.questions.get('Q3'))
})

// when input for question 3 is received, if user's choice is choice 1
// or choice 4, respond with question 6
journey.on('Q3', (answer, response) => {
  answer.chosen(1).send(engine.questions.get('Q6'))
  answer.chosen(4).send(engine.questions.get('Q6'))
}))

// push input data to the I/O stream
engine.in(
  new TerminalInput(engine.questions.current, {
    choiceIndex: 2,
    text: engine.questions.current.choices[2].text
  })
)
```

# Configuration
Aside from middleware, you can configure the engine to use any question parser you'd like. This can be done by inheriting from the `QuestionParser` class and implementing the `parse()` method. This method should return a list of `Question` objects. This gives creators the freedom to write questions in any format they'd like, so long as there is a parser which supports it.
```ts
// pass in the desired parser
const engine = new JourneyEngine(new YAMLQuestionParser())

// configure the engine w/questions from parsed file
await engine.questions.configure('questions')
```

# Middleware Support

The Journey Engine supports I/O middleware with an interface similar to Express.js. To add your own simply subclass the `InMiddleware` or `OutMiddleware` abstract base and implement the `process()` method.

```ts
export class SimpleOutMiddleware
  extends OutputMiddleware {
  process(response: Response): void | Promise<void> {
    console.log('Out middleware response received: ', response);
  }
}
...

engine.middleware.use(SimpleOutMiddleware)
```
This makes creating interfaces for your journey games a matter of attaching I/O middleware with your favorite terminal package, or writing one from scratch. 
# Hooking In

In order to build dynamic experiences with the engine you'll need to hook into the engine's I/O streams and respond to user input as you wish. There are a few ways to do this, the simplest is by instancing a `Journey` class which wraps the engine code and provides a simple interface for tapping into it's streams.

```ts

const journey = engine.create();
...

// when an input for question 1 is received, respond with question 3
journey.on('Q1', (answer, response) => {
  console.log(answer.player)
  response.send(engine.questions.get('Q3'))
})

// when input for question 3 is received, if user's choice is choice 1
// or choice 4, respond with question 6
journey.on('Q3', (answer, response) => {
  answer.chosen(1).send(engine.questions.get('Q6'))
  answer.chosen(4).send(engine.questions.get('Q6'))
}))
```

# Journey Maker
<figure>
<img src="https://get.wallhere.com/photo/pixel-art-castle-fantasy-art-clouds-dark-1929717.jpg" style="width: 100%">
<figcaption align = "center">
Image Credits - <a href="https://wallhere.com/en/wallpaper/1929717">wallhere.com</a>
</figcaption>
</figure>
A tool inspired by traditional text adventure games. Use it to easily create stories and branching narratives. 

# Overview
The goal of the engine is simple, make it exceptionally easy for writers to build cool, interactive text based games. It can be as simple, or complex as you want, but some assumptions have been made regarding what you are making. The 3 core parts of the engine are the controller, renderer, and your question set. Because Journey is primarily for text adventures, some liberties were taken regarding its design. A few features may seem redundant, or unnecessary, but were nonetheless included to lower the barrier for users.

# To-Dos
- [ ] Add support for command configuration
- [ ] Add support for command binding
- [ ] Add web based terminal renderer
- [ ] Add simple networking support with sockets
- [ ] Add engine configuration file support

# Quick Start
```ts
import { JourneyApp } from './src/bootstrap';

const app = JourneyApp.create()
app.run();
```
and if you want to use a custom engine setup, just pass some arguments to the `create()` method
```ts
import { JourneyApp } from './src/bootstrap';

const app = JourneyApp.create({
  parser: new MarkdownQuestionParser()
},
  myController(),
  myRenderer()
)
app.run();
```
# How it Works
In a nutshell, the engine uses a parser to parse your questions and transform it into a format the engine can use. From there, you can choose to use the default controller and renderer implementations, or you can write your own. Out of the box, the engine's default controller will send your questions to the terminal in a linear fashion (top-down). For a more dynamic experience, you will need to write your own controller and react to the questions dynamically, e.g., `if question(2).choice == 1 then send question(7)`. Currently there is only one question parser provided in the project. It will take a yaml file and convert it into a format the engine can use. To get something up and running just add a yaml file with your questions formatted similarly to the ones included in the project.

# Controllers
Controllers manage the dynamics of the experience. If a user does answers with this, do that. Capturing these sorts of dynamics is natural to do in code, the engine tries to make it as easy as possible to do so. Here's what a simple controller looks like.

```ts
import { Journey } from "./journey";

export function SimpleController() {
  // pull in the engine bindings
  const { start, write, questions, utils } = Journey.controller();

  start(async () => {
    write(`Controller started!`)
    write(questions.getCurrent())
  })
  // when any question is reached
  questions.onAny(async (answer) => {
    // send the next question (linear)
    write(questions.next());
  })
}
```
This is actually nearly identical to the default implementation provided in the engine. A more realistic controller with some dynamics would look like this.
```ts
import { Journey } from "./journey";

export function SimpleController() {
  // pull in the engine bindings
  const { start, write, questions, utils } = Journey.controller();

  start(async () => {
    write(`Controller started!`)
    write(questions.getCurrent())
  })

  // when question 1 is reached
  questions.on('1', (answer) => {
      // choice 1 or 4 -> write next question
      answer.choice(1, 4).write(questions.next())
      // choice 2 & 3 -> write question 3
      answer.choices([2, 3]).write(3)
    })

    // when questions 2 or 3 are reached
    questions.on(['2', '3'], (answer) => {
      // jump to question 12
      write('12')
    })
}
```

# MORE DOCS COMING SOON 🙏..

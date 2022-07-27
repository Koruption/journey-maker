# Q1

A fire lamp drops from the end table near your bed and your bed sheet catches the flame, what do you do?

# Answers

- Jump from the bed
- Throw more bedsheets over the flame
- Hide under the covers
- Scream out for help

```ts
// configure question set from yml
journey.questions.configure('src/questions.yml')

// configure question set from json
journey.questions.configure('src/questions.json')

// configure question set from txt 
journey.questions.configure('src/questions.txt')

// configure question set from code
journey.questions.configure([
  question(
    'You awake in a dark and barren cave. You hear the sound of merchants in the distance. Before you can stand and run for help you notice you are chained to the cave wall. What do you do?',
    choices([
      'Scream for help (this will surely awaken anyone in the cave)',
      'Attempt to pick the chain locks',
      'Pull against the chains in hopes of prying it from the wall',
      'Do nothing'
    ]),
    'any additional data you would like to display'
  )
])

journey.on('q1', (answer, response) => {
  if (answer.chosen(1).selected === true)
    response.send(
      question('Some question to ask'), 
      'src/assets/dungeon-1.gif',
      'whatever other text you\'d like')

  // if answer 1 is chosen then
  answer.chosen(1).respond(
    question('Some question to ask'), 
    'src/assets/dungeon-1.gif',
    'whatever other text you\'d like')

  // if answer 2 is chosen then
  answer.chosen(2).respond(
    question('Some question to ask'), 
    'src/assets/dungeon-1.gif',
    'whatever other text you\'d like')

  // if answer's value is equal to'
  answer.chosen({ value: 'Throw the goblet of fire'}).respond(
    question('Some question to ask'), 
    'src/assets/dungeon-1.gif',
    'whatever other text you\'d like')

  // regardless of choice, respond with
  answer.chosen().respond(
    question('Some question to ask'), 
    'src/assets/dungeon-1.gif',
    'whatever other text you\'d like')

  console.log(answer.question)
  // prints
  /**
   * {
   *  uid: nasd892-sn8df2-db7sdf8,
   *  index: 3,
   *  value: 'You come across a snow elf. What do you do?',
   *  choices: [
   *  {
   *    value: 'Throw the goblet of fire
   *  }, {}, {}, {}
   * ]
   * }
  */

  console.log(answer.player)
  // prints 
  /**
   * {
   *  name: Grandor The Great
   *  networking: {
   *    connectionType: local,
   *    players: 1,
   *    uid: 10msd9-smd8j2-88sdn8d
   *  },
   * meta: {}
   * }
   * 
   */


})
```

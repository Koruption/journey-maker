```ts
// gets attached to out stream
// can write to input stream
export myRenderer = async () => {
  const { write, update, start } = renderer();
  start(() => {
    prompt({
      'Welcome to the world of grandor'
    })
  })

  // listen for changes in the out stream
  update(async (question) => {
      if (question.type === 'SELECT') {
        write(await select(data.question))
        return
      }
      // write to the input stream
    write(await prompt(data.question))
  })
  return render()
}

// gets attached to in stream
// can write to output stream
// export myController = async () => {
//   const { write, onUpdate } = engine()
//   // write to output stream
//   write({
//     question: 'Do you know the tale of Grandor The Great?', 
//     choices: ['yes', 'no']
//     })
//   // listen for changes on the in stream
//   onUpdate(data => {
    
//   })
//   return process({}, {})
// }

export myController = async () => {
  const { write, update, journey } = controller();

}

...

JourneyEngine.controllers.use()

```

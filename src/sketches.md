```ts
// gets attached to out stream
// can write to input stream
export myRenderer = async () => {
  const { write, onUpdate } = engine()

  // write to the input stream
  write({ name: 'some name }, { rank: 1 })
  // listen for changes in the out stream
  onUpdate(data => {

  })
  return render()
}

// gets attached to in stream
// can write to output stream
export myController = async () => {
  const { write, onUpdate } = engine()
  // write to output stream
  write({
    question: 'Do you know the tale of Grandor The Great?', 
    choices: ['yes', 'no']
    })
  // listen for changes on the in stream
  onUpdate(data => {

  })
  return process({}, {})
}

```

export class JourneyBlock {
  question: string = '';
  choices: string[] = []
  constructor(data?: Partial<JourneyBlock>) { data ? Object.assign(this, data) : null }
}

export const block = (data?: Partial<JourneyBlock>) => {
  return new JourneyBlock(data);
}

export function myRenderer() {
  const { start, update, write } = Journey.renderer<JourneyBlock | any>();
  let inputCounter = 0;
  start(() => {
      console.log('My Renderer Started!');
  })
  update(async (data) => {
      if (inputCounter >= 1) return;
      console.log(`Renderer updated with: ${data}`);
      // write(block('Why have you come here young wanderer?'))
      write()
      inputCounter += 1
  });
}



// Journey.run(myRenderer, myController);
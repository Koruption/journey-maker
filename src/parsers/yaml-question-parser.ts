import fs from 'fs';
import YAML from 'yaml';
import { Journey } from '../journey';

export class YAMLQuestionParser extends Journey.QuestionParser {
  async parse(): Promise<Journey.Question[]> {
    const file = fs.readFileSync(this.configPath, 'utf-8');
    const parsed = YAML.parse(file);
    let questions: Journey.Question[] = []
    for (let q in parsed) {
      questions.push(new Journey.Question({
        id: q,
        text: parsed[q]['Question'],
        type: parsed[q]['Choices'] ? 'SELECT' : 'INPUT',
        choices: parsed[q]['Choices'] ? parsed[q]['Choices'] : [],
        meta: parsed[q]['Meta'] ? parsed[q]['Meta'] : []
      }))
    }
    await Journey.utils.Timers.sleep(5000);
    return questions;
  }
}

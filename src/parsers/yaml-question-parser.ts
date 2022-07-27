import { choices, Question, QuestionParser } from "../journey";
import fs from 'fs';
import YAML from 'yaml';

export class YAMLQuestionParser extends QuestionParser {
  parse(fPath: string): Question[] {
    const file = fs.readFileSync(`${fPath}.yml`, 'utf-8');
    const parsed = YAML.parse(file);
    let questions: Question[] = []
    for (let q in parsed) {
      questions.push({
        id: q,
        text: parsed[q]['Question'],
        type: parsed[q]['Choices'] ? 'CHOICE' : 'INPUT',
        choices: parsed[q]['Choices'] ? choices(parsed[q]['Choices']) : [],
        meta: parsed[q]['Meta'] ? parsed[q]['Meta'] : []
      })
    }
    return questions;
  }
}

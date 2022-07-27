import { YAMLQuestionParser } from "../src/parsers/yaml-question-parser"

it('Should parse a YAML File', async () => {
  const parser = new YAMLQuestionParser();
  expect(async () => {
    const parsedQuestions = await parser.parse('questions');
    console.log(parsedQuestions);
  })
})
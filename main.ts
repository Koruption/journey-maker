import { Journey } from "./src/journey";
import { BasicController } from "./src/journey-controller.test";
import { BasicRenderer } from "./src/journey-renderer.test";
import { YAMLQuestionParser } from "./src/parsers/yaml-question-parser";

Journey.configPath('questions_2.yml')
Journey.parser(new YAMLQuestionParser())
Journey.run(BasicController, BasicRenderer)
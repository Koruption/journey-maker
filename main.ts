import { JourneyApp } from './src/bootstrap';
import { Journey } from "./src/journey";
import { BasicController } from "./src/journey-controller";
import { BasicRenderer } from "./src/journey-renderer";
import { YAMLQuestionParser } from "./src/parsers/yaml-question-parser";

// Journey.parser(new YAMLQuestionParser())
// Journey.run(BasicRenderer, BasicController)
// Journey.configure(new YAMLQuestionParser())
// Journey.run()
JourneyApp.create()
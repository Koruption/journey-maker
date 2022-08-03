import { Journey } from "./journey";
import { BasicController } from "./journey-controller";
import { BasicRenderer } from "./journey-renderer";
import { YAMLQuestionParser } from "./parsers/yaml-question-parser";

export class JourneyApp {
  static create(config?: {
    parser: Journey.QuestionParser,
    configPath: string
  }, controller?: () => void, renderer?: () => void) {
    const _controller = controller ? controller : BasicController;
    const _renderer = renderer ? renderer : BasicRenderer;
    const parser = config.parser ? config.parser : new YAMLQuestionParser()
    config.configPath ? Journey.configure(parser, config.configPath) : Journey.configure(parser)
    return Journey.run(_controller, _renderer)
  }
}
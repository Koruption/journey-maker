import { Journey } from "./journey";
import { BasicController } from "./journey-controller";
import { BasicRenderer } from "./journey-renderer";
import { YAMLQuestionParser } from "./parsers/yaml-question-parser";

export class JourneyApp {
  static create(config?: {
    parser: Journey.QuestionParser,
    configPath?: string
  }, controller?: () => void, renderer?: () => void) {
    const _controller = controller ? controller : BasicController;
    const _renderer = renderer ? renderer : BasicRenderer;
    let parser, configPath;
    if (config) {
      parser = config.parser ? config.parser : new YAMLQuestionParser();
      configPath = config.configPath ? config.configPath : null;
      configPath ? Journey.configure(parser, configPath) : Journey.configure(parser);
    }
    else {
      parser = new YAMLQuestionParser();
      Journey.configure(parser)
      configPath = null;
    };
    return {
      controller: _controller,
      renderer: _renderer,
      parser: parser,
      configPath: configPath,
      run: () => {
        Journey.run(_renderer, _controller)
      }
    }
  }
}
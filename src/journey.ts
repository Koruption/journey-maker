import { YAMLQuestionParser } from "./parsers/yaml-question-parser";

export namespace Journey {

    export abstract class QuestionParser<T extends Question = Question> {
        configPath: string = configurationPath;
        abstract parse(): T[] | Promise<T[]>;
    }

    export class Question {
        id: string = ''
        readonly question: string = '';
        readonly text: string = '';
        readonly choices: string | number | string[] | number[] = '';
        readonly type: 'SELECT' | 'MULTISELECT' | 'INPUT' | '' = '';
        readonly meta: any;
        constructor(question?: Partial<Question>) { question ? Object.assign(this, question) : null }
    }

    class Response {
        private _write = Journey.controller().write;
        constructor(private _execute: boolean) { }
        write(qid: string | number): void;
        write(qid: Question): void;
        write(qid: Question | string | number | any): void {
            if (!this._execute) return
            if (typeof qid === 'string' || typeof qid === 'number') {
                questions.setCurrent(questions.getIndex(qid))
                const question = questions.get(qid);
                if (question) this._write(question);
            }
            this._write(qid);
        }
    }

    export class Answer {
        meta: any;
        question: Question;
        _linkedQuestion?: Question
        constructor(data: { question: Question, _linkedQuestion?: Question, meta?: any }) {
            const { question, _linkedQuestion, meta } = data;
            this.question = question;
            this._linkedQuestion = _linkedQuestion;
            this.meta = meta;
        }
        get linkedQuestion() { return this._linkedQuestion; }
        choice(...choices: number[]) {
            return new Response(true)
        }
        choices(choices: number[]) {
            return new Response(true);
        }
        hasLinked() { return this.linkedQuestion != null && this._linkedQuestion != undefined }
    }

    export class Questions<T extends Question = Question, K extends Answer = Answer> {
        private questionMap: Map<string | number, { question: Question, subs: Array<(answer: K) => void | Promise<void>> }> = new Map<string, { question: Question, subs: Array<(answer: K) => void | Promise<void>> }>();
        private _list: T[] = [];
        private _currentIndex: number = 0;

        setCurrent(index: number) { this._currentIndex = index; }
        getCurrent() { return this._list[this._currentIndex] }

        next() {
            const nextIndx = this._currentIndex + 1;
            return this._list.slice(
                this._currentIndex + 1, 1)[0]
        }

        previous() {
            const prevIndx = this._currentIndex + 1;
            return this._list.slice(
                this._currentIndex - 1, 1)[0]
        }

        get list() { return this._list };

        initialize(questions: T[]) {
            this._list = questions;
            this._list.forEach(q => this.questionMap.set(q.id, { question: q, subs: [] }));
        }
        on(qid: string, cb: (answer: K) => void | Promise<void>): void;
        on(qid: number, cb: (answer: K) => void | Promise<void>): void;
        on(qid: number[], cb: (answer: K) => void | Promise<void>): void;
        on(qid: string[], cb: (answer: K) => void | Promise<void>): void;
        on(qid: string | number | string[] | number[], cb: (answer: K) => void | Promise<void>) {
            if (typeof qid === 'string' || typeof qid === 'number') {
                if (!this.questionMap.has(qid) ? this.questionMap.get(qid)?.subs.push(cb) : null) throw new Error(`Question with qid: ${qid} could not be found in the questions map.`)
                return
            }
            qid.forEach(id => {
                if (!this.questionMap.has(id) ? this.questionMap.get(id)?.subs.push(cb) : null) throw new Error(`Question with qid: ${id} could not be found in the questions map.`)
            });
        }

        get(qid: string | number) {
            if (!this.questionMap.has(qid)) throw new Error(`Question with qid: ${qid} could not be found in the questions map.`)
            return this.questionMap.get(qid)?.question;
        }

        getIndex(qid: string | number) {
            if (!this.questionMap.has(qid)) throw new Error(`Question with qid: ${qid} could not be found in the questions map.`)
            return this._list.findIndex(q => q.id === qid)
        }

        trigger(qid: string | number, answer: K) {
            if (!this.questionMap.has(qid)) throw new Error(`Question with qid: ${qid} could not be found in the questions map.`)
            this.questionMap.get(qid)?.subs.forEach(sub => sub(answer));
        }
    }

    export class DataStream<T = any> {
        data = Array<T>();
        subs = Array<(data?: T) => void | Promise<void>>();
        on(sub: (data?: T) => void | Promise<void>) {
            this.subs.push(sub);
        }
        push(streamData: T) {
            this.data.push(streamData);
            this.subs.forEach(sub => sub(streamData))
        }
    }

    let outStream = new DataStream();
    let inStream = new DataStream();
    let starts = new Array<() => void | Promise<void>>();
    let questions = new Questions();
    let configurationPath = '';
    let _parser: QuestionParser;

    // Writes to terminal from controller
    export namespace outputs {
        export const write = <T extends Question = Question>() => {
            return (data: any | Question) => {
                outStream.push(data);
            }
        }
        export const update = <T extends Answer = Answer>() => {
            return (cb: (data?: T) => void | Promise<void>) => {
                outStream.on(cb);
            }
        }
    }

    // Writes to controller from terminal
    export namespace inputs {
        export const write = <T extends Answer = Answer>() => {
            return (...args: T[]) => {
                questions.trigger(args[0].question.id, args[0])
                //inStream.push(args);
            }
        }
        export const update = <T extends Question = Question>() => {
            return (cb: (data?: T) => void | Promise<void>) => {
                inStream.on(cb);
            }
        }
    }

    export const startup = async () => {
        // do engine setup
        // ...
        console.log('Staring Journey Engine.')
        Promise.all(starts.map(start => start()))
    };

    export const start = async (cb: () => void | Promise<void>) => {
        starts.push(cb);
    }

    export const streamOut = (...args: any[]) => {
        outStream.push(args);
    }

    export const streamIn = (...args: any[]) => {
        inStream.push(args)
    }

    export const renderer = <T extends Answer = Answer, K extends Question = Question>() => {
        outStream = new DataStream<T>();
        const write = inputs.write<T>();
        const update = inputs.update<K>();
        return { write, start, update }
    }

    export const controller = <T extends Answer = Answer, K extends Question = Question>() => {
        inStream = new DataStream<T>();
        const write = outputs.write<K>();
        const update = outputs.update<T>();
        return { write, start, update, questions }
    }

    export async function parser(parser: QuestionParser) {
        _parser = parser;
    }

    export function configPath(fPath: string) { configurationPath = fPath; }

    export async function run(...components: (() => void)[]) {
        questions.initialize(await _parser.parse())
        // console.log(questions.list);
        components.forEach(component => component());
        startup();
    }
}
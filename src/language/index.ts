import Interpreter from './interpreter';
import Parser from './parser';

export default function (format: string): void {
    new Interpreter(
        new Parser(format)
            .parse()
    ).interpret();
}
// @ts-nocheck

import { TokenType } from './TokenType';
import { Token } from './Token';

export default class Lexer {

    protected source: string;
    private pos: number;
    private line: number;
    private lineStart: number;
    public lookahead: any;
    private prev: any;

    constructor(source) {
        this.source = source;
        this.pos = 0;
        this.line = 1;
        this.lineStart = 0;
        this.lookahead = this.next();
        this.prev = null;
    }

    get column() {
        return this.pos - this.lineStart;
    }

    getKeyword(name) {
        switch (name) {
            case "import":
                return TokenType.IMPORT;
            case 'project':
                return TokenType.PROJECT;
            case 'tasks':
                return TokenType.TASKS;
            case 'condition':
                return TokenType.CONDITION;
            case 'command':
                return TokenType.COMMAND;
            case 'env':
                return TokenType.ENV;
            case 'blueprints':
                return TokenType.BLUEPRINTS;
            case 'commands':
                return TokenType.COMMANDS;
            case 'parameter':
                return TokenType.PARAMETER;
            case 'default':
                return TokenType.DEFAULT;
            case 'from':
                return TokenType.FROM;
        }

        return TokenType.IDENTIFIER;
    }

    end() {
        return this.lookahead.type === TokenType.END;
    }

    peek() {
        return this.lookahead;
    }

    peekRaw(steps = 0) {
        return this.source.charAt(this.pos + (1 + steps));
    }

    lex() {
        const prev = this.lookahead;
        this.lookahead = this.next();
        return prev;
    }

    next() {
        this.prev = this.lookahead;

        this.skipWhitespace();


        const line = this.line;
        const lineStart = this.lineStart;
        const token = this.scan();

        token.line = line;
        token.column = this.pos - lineStart;

        // If this token is a comment... we don't want to return it at all...
        return token.type === TokenType.COMMENT
            ? this.skipComment()
            : token;
    }

    skipComment() {
        while (this.source.charAt(this.pos) !== '\n') {
            ++this.pos
        }
        this.line++;
        this.lineStart = this.pos;
        return this.next();
    }

    scan() {
        if (this.pos >= this.source.length) {
            return { type: TokenType.END };
        }

        const ch = this.source.charAt(this.pos);
        switch (ch) {
            case '(':
                ++this.pos;
                return { type: TokenType.LPAREN };
            case ')':
                ++this.pos;
                return { type: TokenType.RPAREN };
            case '{':
                ++this.pos;
                return { type: TokenType.LBRACE };
            case '}':
                ++this.pos;
                return { type: TokenType.RBRACE };
            case '[':
                ++this.pos;
                return { type: TokenType.LSQUARE };
            case ']':
                ++this.pos;
                return { type: TokenType.RSQUARE };
            case '<':
                ++this.pos;
                return { type: TokenType.LT };
            case '>':
                ++this.pos;
                return { type: TokenType.GT };
            case '&':
                ++this.pos;
                return { type: TokenType.AMP };
            case ',':
                ++this.pos;
                return { type: TokenType.COMMA };
            case ':':
                ++this.pos;
                return { type: TokenType.COLON };
            case '`':
                if (this.peekRaw() === '`' && this.peekRaw(1) === '`') {
                    ++this.pos;
                    ++this.pos;
                    ++this.pos;
                    let value = this.scanString((ch) => {
                        if (ch === '`' && this.peekRaw() === '`' && this.peekRaw(1) === '`') {
                            ++this.pos;
                            ++this.pos;
                            return true;
                        }
                        return false;
                    });

                    return { type: TokenType.CONTENTS, value: value.value }
                }
            case '=':
                if (this.peekRaw() === '>') {
                    ++this.pos;
                    ++this.pos;
                    return { type: TokenType.ARROW };
                }
                ++this.pos;
                return { type: TokenType.EQUALS };
            case '?':
                ++this.pos;
                return { type: TokenType.QMARK };
            case '!':
                ++this.pos;
                return { type: TokenType.NOT };
            case '@':
                ++this.pos;
                return { type: TokenType.AT };
            case '#':
                ++this.pos;
                return { type: TokenType.COMMENT };
            case '~':
                ++this.pos;
                return { type: TokenType.TILD };
            case ';':
                ++this.pos;
                return { type: TokenType.SEMICOLON };
            case '+':
                ++this.pos;
                return { type: TokenType.PLUS };
            case '*':
                ++this.pos;
                return { type: TokenType.WILD };
            case '-':
                if (this.peekRaw() === '>') {
                    ++this.pos;
                    ++this.pos;
                    return { type: TokenType.CONVERT };
                }
                break;
            case '|':
                if (this.peekRaw() === '|') {
                    ++this.pos;
                    ++this.pos;
                    return { type: TokenType.OR };
                }
                break;

            case '/':
                ++this.pos;
                return { type: TokenType.SLASH };
        }

        if (
            ch === '_' ||
            ch === '$' ||
            ch === '.' ||
            ch === '-' ||
            ('a' <= ch && ch <= 'z') ||
            ('A' <= ch && ch <= 'Z')
        ) {
            return this.scanWord();
        }

        if ('0' <= ch && ch <= '9') {
            return this.scanNumber();
        }

        if (ch === '"') {
            return this.scanString();
        }
        console.log({ ch })
        throw this.createIllegal();
    }

    scanPunctuator() {
        const glyph = this.source.charAt(this.pos++);
        return { type: glyph };
    }

    scanWord() {
        const start = this.pos;
        this.pos++;

        while (this.pos < this.source.length) {
            let ch = this.source.charAt(this.pos);

            if (
                ch === '_' ||
                ch === '$' ||
                ch === '.' ||
                ch === '-' ||
                ('a' <= ch && ch <= 'z') ||
                ('A' <= ch && ch <= 'Z') ||
                ('0' <= ch && ch <= '9')
            ) {
                this.pos++;
            } else {
                break;
            }
        }
        const value = this.source.slice(start, this.pos);
        return { type: this.getKeyword(value), value };
    }

    scanNumber() {
        const start = this.pos;

        if (this.source.charAt(this.pos) === '-') {
            this.pos++;
        }

        this.skipInteger();

        if (this.source.charAt(this.pos) === '.') {
            this.pos++;
            this.skipInteger();
        }

        let ch = this.source.charAt(this.pos);
        if (ch === 'e' || ch === 'E') {
            this.pos++;

            ch = this.source.charAt(this.pos);

            if (ch === '+' || ch === '-') {
                this.pos++;
            }

            this.skipInteger();
        }

        const value = parseFloat(this.source.slice(start, this.pos));
        return { type: TokenType.NUMBER, value };
    }

    scanString(validation: (ch: string) => boolean = (ch: string) => ch === '"') {
        this.pos++;

        let value = '';
        while (this.pos < this.source.length) {
            let ch = this.source.charAt(this.pos);
            if (validation(ch)) {
                this.pos++;
                return { type: TokenType.STRING, value };
            }

            // if (ch === '\r' || ch === '\n') {
            //     break;
            // }

            value += ch;
            this.pos++;
        }

        throw this.createIllegal();
    }

    skipInteger() {
        const start = this.pos;

        while (this.pos < this.source.length) {
            let ch = this.source.charAt(this.pos);
            if ('0' <= ch && ch <= '9') {
                this.pos++;
            } else {
                break;
            }
        }

        if (this.pos - start === 0) {
            throw this.createIllegal();
        }
    }

    skipWhitespace() {
        while (this.pos < this.source.length) {
            let ch = this.source.charAt(this.pos);
            if (ch === ' ' || ch === '\t') {
                this.pos++;
            } else if (ch === '\r') {
                this.pos++;
                if (this.source.charAt(this.pos) === '\n') {
                    this.pos++;
                }
                this.line++;
                this.lineStart = this.pos;
            } else if (ch === '\n') {
                this.pos++;
                this.line++;
                this.lineStart = this.pos;
            } else {
                break;
            }
        }
    }

    createError(message) {
        return new SyntaxError(message + ` (${this.line}:${this.column})`);
    }

    createIllegal() {
        console.log({ pos: this.pos, len: this.source.length })
        return this.pos < this.source.length
            ? this.createError(`Unexpected ${this.source.charAt(this.pos)}`)
            : this.createError('Unexpected end of input');
    }

    createUnexpected(token) {
        switch (token.type.klass) {
            case Token.End:
                return this.createError('Unexpected end of input');
            case Token.NumberLiteral:
                return this.createError('Unexpected number');
            case Token.StringLiteral:
                return this.createError('Unexpected string');
            case Token.Identifier:
                return this.createError('Unexpected identifier');
            case Token.Keyword:
                return this.createError(`Unexpected token "${token.value}"`);
            case Token.Punctuator:
                return this.createError(`Unexpected token "${token.type.name}"`);
        }
    }
}
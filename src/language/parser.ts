// @ts-nocheck

import Lexer from './lexer';
import { TokenType } from './TokenType';
import { nanoid } from 'nanoid';

export default class Parser extends Lexer {

    match(type) {
        return this.lookahead.type === type;
    }

    eat(type) {
        if (this.match(type)) {
            return this.lex();
        }

        return null;
    }

    expect(type) {
        if (this.match(type)) {
            return this.lex();
        }
        throw this.createUnexpected(this.lookahead);
    }

    expectMany(...type) {
        let found;
        type.forEach((t) => {
            if (this.match(t)) {
                found = this.lex();
            }
        });

        if (!found) {
            throw this.createUnexpected(this.lookahead);
        } else {
            return found;
        }
    }

    peekIs(type) {
        return this.peek().type === type;
    }

    parse() {
        let result = {
            imports: [],
            tasks: [],
            blueprints: {},
            commands: {}
        };

        while (!this.end()) {
            switch (true) {
                case this.match(TokenType.IMPORT):
                    result['imports'].push(this.parseImport());
                    break;
                case this.match(TokenType.PROJECT):
                    result["project"] = this.parseProject();
                    break;
                case this.match(TokenType.TASKS):
                    result['tasks'] = this.parseTasksDefinition();
                    break;
                case this.match(TokenType.COMMANDS):
                    result['commands'] = this.parseCommands();
                    break;
                case this.match(TokenType.BLUEPRINTS):
                    result['blueprints'] = this.parseBlueprints();
                    break;
                default:
                    throw new Error(`WTF: ${this.lookahead}`)
            }

            if (this.end()) {
                return result;
            }
        }

    }

    parseImport() {
        this.expect(TokenType.IMPORT);
        // we are going to expect a single identifier.
        let importName = "";
        if (this.match(TokenType.IDENTIFIER)) {
            importName = this.parseIdentifier();
        }
        if (importName !== "")
            this.expect(TokenType.FROM);
        else
            importName = `--{${nanoid(5)}}--`
        // We expect a string for the location... this can either be a name or a url
        const importFrom = this.parseString();
        return { [importName]: importFrom };
    }

    parseProject() {
        // we are going to fill an object of information
        const info = {};
        this.expectMany(TokenType.PROJECT, TokenType.LBRACE);
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            info[this.parseIdentifier()] = this.parseString()
        }
        this.expect(TokenType.RBRACE);
        return info;
    }


    parseTasksDefinition() {
        const tasks = [];
        this.expectMany(TokenType.TASKS, TokenType.LBRACE);
        // Everything from here out is a task...
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            // We will get the task name, and run it through `parseTask`
            tasks.push(this.parseTask());
        }
        this.expect(TokenType.RBRACE);

        return tasks
    }

    parseTask() {
        const info = {
            name: this.parseString(),
            env: {},
            command: [],
            condition: []
        };

        this.expect(TokenType.LBRACE);
        while (!this.end() && !this.peekIs(TokenType.RBRACE)) {
            switch (true) {
                case this.match(TokenType.ENV):
                    info.env = this.parseEnv();
                    break;
                case this.match(TokenType.COMMAND):
                    info.command.push(this.parseCommand());
                    break
                case this.match(TokenType.CONDITION):
                    info.condition = this.parseCondition();
                    break;
                case this.match(TokenType.IDENTIFIER):
                    // We are going to check to see what the item after is.
                    info.command.push(this.parseValue())
                    break;
                default:
                    throw new Error('WOW')
            }
        }
        this.expect(TokenType.RBRACE);
        return info;
    }

    parseEnv() {
        const env = {};
        this.expectMany(TokenType.ENV, TokenType.LBRACE);
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            const identifier = this.parseIdentifier();
            const isSet = this.eat(TokenType.EQUALS);
            const val = this.parseValue();
            if (val.callee && isSet) {
                val.isSet = true
            }
            env[identifier] = val;
        }
        this.expect(TokenType.RBRACE);
        return env;
    }

    parseCondition() {
        const conditions = [];

        this.expectMany(TokenType.CONDITION, TokenType.LBRACE);
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            conditions.push(this.parseValue())
        }
        this.expect(TokenType.RBRACE);

        return conditions;
    }

    parseCommand() {
        const commands = [];

        this.expectMany(TokenType.COMMAND);
        // We will check to see if the next item is a Brace...
        // if it is... then we have lots of commands,
        // if not... it is a value.

        if (this.match(TokenType.LBRACE)) {
            this.expectMany(TokenType.COMMAND, TokenType.LBRACE);
            while (!this.end() && !this.match(TokenType.RBRACE)) {
                commands.push(this.parseValue());
            }
            this.expect(TokenType.RBRACE)
        } else {
            commands.push(this.parseValue())
        }

        return commands;
    }

    parseBlueprints() {
        const bluePrints = {};

        this.expectMany(TokenType.BLUEPRINTS, TokenType.LBRACE);
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            // We are going to get the string for each blueprint (name).
            // We will then get the value... the value can either be a URL string,
            // or it can be a definition.
            const name = this.parseString();
            if (this.eat(TokenType.EQUALS)) {
                // This is a URL
                bluePrints[name] = this.parseString();
                continue; // Nothing else to be done by this one.
            }

            bluePrints[name] = this.parseBlueprintDetails();
        }
        this.expect(TokenType.RBRACE);
        return bluePrints;
    }

    parseBlueprintDetails() {
        const details = {
            parameters: {},
            tasks: []
        }

        this.expect(TokenType.LBRACE);
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            // We are going to check to see if it is a parameter... if it is, we are going
            // to send it to the `parseParameter` function
            if (this.match(TokenType.PARAMETER)) {
                const parameter = this.parseParameter();
                details.parameters[parameter[0]] = parameter[1];
                continue;
            }

            if (this.match(TokenType.STRING)) {
                // This means it is a step definition.
                details.tasks.push(this.parseTask())
            }
        }
        this.expect(TokenType.RBRACE);
        return details;
    }

    parseParameter() {
        this.expect(TokenType.PARAMETER);
        const name = this.parseString();
        const details = {};
        if (this.eat(TokenType.COMMA)) {
            // There is more in this definition...
            if (this.match(TokenType.DEFAULT)) {
                this.expectMany(TokenType.DEFAULT, TokenType.COLON);
                details["default"] = this.parseString();
            }
        }

        return [name, details];
    }


    parseCommands() {
        let commands = {};
        this.expectMany(TokenType.COMMANDS, TokenType.LBRACE);
        while (!this.end() && !this.match(TokenType.RBRACE)) {
            const name = this.parseString();
            this.expect(TokenType.EQUALS);
            commands[name] = this.parseString();
        }
        this.expect(TokenType.RBRACE);
        return commands;
    }

    parseIdentifier() {
        const identifier = this.expect(TokenType.IDENTIFIER).value;
        if (this.match(TokenType.LPAREN)) {
            // We have a function call
            return { identifier, params: this.parseFunctionCall(), callee: true }
        } else if (this.match(TokenType.LBRACE)) {
            // We have a blueprint call.
            return { identifier, params: this.parseBlueprintCall(), bluePrint: true }
        }
        return identifier
    }

    parseString() {
        return this.expect(TokenType.STRING).value;
    }

    parseNumber() {
        return this.expectMany(TokenType.NUMBER, TokenType.ELLIPSIS).value;
    }

    parseContents() {
        return this.expect(TokenType.CONTENTS).value;
    }

    parseFunctionCall() {
        const params = [];
        this.expect(TokenType.LPAREN);
        while (!this.end() && !this.match(TokenType.RPAREN)) {
            this.eat(TokenType.COMMA);
            params.push(this.parseValue());
        }
        this.expect(TokenType.RPAREN);
        return params
    }

    parseBlueprintCall() {
        const params = {};
        this.expect(TokenType.LBRACE);
        while (!this.end() && !this.peekIs(TokenType.RBRACE)) {
            const identifier = this.parseIdentifier();
            this.expect(TokenType.EQUALS);
            params[identifier] = this.parseValue();
        }
        this.expect(TokenType.RBRACE);
        return params;
    }

    parseValue() {
        const functionToCall = ["Identifier", "String", "Number", "Contents"].filter((type) => {
            const tt = TokenType[type.toUpperCase()];
            return this.match(tt)
        })[0];
        return this[`parse${functionToCall}`]()
    }

    parseFieldList() {
        this.expect(TokenType.LBRACE);
        // before we begin... we are going to check to see if there is a query instead...
        // const params = this.eat(TokenType.LPAREN) ? this.parseParams() : null;

        const fields = [];
        let first = true;

        while (!this.match(TokenType.RBRACE) && !this.end()) {
            if (first) {
                first = false;
            } else {
                this.expect(TokenType.COMMA);
            }

            if (this.match(TokenType.AMP)) {
                // fields.push(this.parseReference());
            } else if (this.match(TokenType.AT)) {
                // fields.push(this.parseVar());
            } else if (this.match(TokenType.LPAREN)) {
                this.eat(TokenType.LPAREN);
                // let params = this.parseParams();
                let params = {};
                let inside = this.parseFieldList();
                inside.map((i) => {
                    fields.push({ ...i, params });
                });
            } else {
                fields.push(this.parseField());
            }
        }

        this.expect(TokenType.RBRACE);
        return fields;
    }
}
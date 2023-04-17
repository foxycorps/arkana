import { Token } from './Token';

export const TokenType = {
    // Special
    END: { klass: Token.End, name: 'end' },
    IDENTIFIER: { klass: Token.Identifier, name: 'identifier' },
    NUMBER: { klass: Token.NumberLiteral, name: 'number' },
    STRING: { klass: Token.StringLiteral, name: 'string' },

    // Punctuators
    LT: { klass: Token.Punctuator, name: '<' },
    GT: { klass: Token.Punctuator, name: '>' },
    LBRACE: { klass: Token.Punctuator, name: '{' },
    RBRACE: { klass: Token.Punctuator, name: '}' },
    LPAREN: { klass: Token.Punctuator, name: '(' },
    RPAREN: { klass: Token.Punctuator, name: ')' },
    LSQUARE: { klass: Token.Punctuator, name: '[' },
    RSQUARE: { klass: Token.Punctuator, name: ']' },
    COLON: { klass: Token.Punctuator, name: ':' },
    COMMA: { klass: Token.Punctuator, name: ',' },
    AMP: { klass: Token.Punctuator, name: '&' },
    AT: { klass: Token.Punctuator, name: '@' },
    QMARK: { klass: Token.Punctuator, name: '?' },
    NOT: { klass: Token.Punctuator, name: '!' },
    EQUALS: { klass: Token.Punctuator, name: '=' },
    TILD: { klass: Token.Punctuator, name: '~' },
    SEMICOLON: { klass: Token.Punctuator, name: ';' },
    PLUS: { klass: Token.Punctuator, name: '+' },
    WILD: { klass: Token.Punctuator, name: '*' },
    CONVERT: { klass: Token.Punctuator, name: '->' },
    ARROW: { klass: Token.Punctuator, name: "=>" },
    OR: { klass: Token.Punctuator, name: '||' },
    SLASH: { klass: Token.Punctuator, name: '/' },
    ELLIPSIS: { klass: Token.Punctuator, name: '...' },
    NEW_LINE: { klass: Token.Punctuator, name: "\n" },
    CONTENTS: { klass: Token.Punctuator, name: '```' },

    // Comments
    COMMENT: { klass: Token.Punctuator, name: '#' },

    // Keywords
    NULL: { klass: Token.Keyword, name: 'null' },
    TRUE: { klass: Token.Keyword, name: 'true' },
    FALSE: { klass: Token.Keyword, name: 'false' },
    AS: { klass: Token.Keyword, name: 'as' },
    IS: { klass: Token.Keyword, name: 'is' },
    SECURE: { klass: Token.Keyword, name: "secure" },

    STEP: { klass: Token.Keyword, name: "step" },
    TASKS: { klass: Token.Keyword, name: "tasks" },
    COMMAND: { klass: Token.Keyword, name: "command" },
    COMMANDS: { klass: Token.Keyword, name: "commands" },
    INCLUDE: { klass: Token.Keyword, name: "include" },
    IMPORT: { klass: Token.Keyword, name: "import" },
    PROJECT: { klass: Token.Keyword, name: "project" },
    VARIABLE: { klass: Token.Keyword, name: "variable" },
    TEMPLATE: { klass: Token.Keyword, name: 'template' },
    BLUEPRINTS: { klass: Token.Keyword, name: 'blueprints' },
    PARAMETER: { klass: Token.Keyword, name: 'parameter' },
    DEPENDENCIES: { klass: Token.Keyword, name: 'dependencies' },
    ENV: { klass: Token.Keyword, name: 'env' },
    CONDITION: { klass: Token.Keyword, name: 'condition' },
    DEFAULT: { klass: Token.Keyword, name: 'default' },
    FROM: { klass: Token.Keyword, name: 'from' }
};
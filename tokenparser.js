import { specer_parser } from "./utils.js";
import { init_lexer } from "./lexxing.js";
import { _debug } from "./lexxing.js";
import WebSocket from "ws";

var VAR_DEFINE_NAME = [];
var VAR_DEFINE_VALUE = [];

var PROTECTED_DEFINE_NAME = [];
var PROTECTED_DEFINE_VALUE = [];

var IMPORT_STACK = [];

var LEFT_BRACE_STACK = [];
var RIGHT_BRACE_STACK = [];
var BRACE_STACK = [];

var LOCAL_FUNCTION_PARAM_STACK = [];
var LOCAL_FUNCTION_DATA_STACK = [];
var LOCAL_FUNCTION_NAME_STACK = [];
var FUNCTION_TEMPORARY_DATA;

var CONDITIONAL_CONDITION_STACK = [];
var CONDITIONAL_STATEMENT_STACK = [];
var CONDITIONAL_STATEMENT_TEMPORARY_DATA;

function convert_string(DEF_CHAR_ARRAY_OP, i) {
    if (_debug === true) console.log("BehemothScript: Converting " + DEF_CHAR_ARRAY_OP[i] + " to integer");
    if (typeof DEF_CHAR_ARRAY_OP[i + 1] === "string" && DEF_CHAR_ARRAY_OP[i + 1] != " " && DEF_CHAR_ARRAY_OP[i + 1] != "-" && DEF_CHAR_ARRAY_OP[i + 1] != "x" && DEF_CHAR_ARRAY_OP[i + 1] != "+" && DEF_CHAR_ARRAY_OP[i + 1] != "*" && DEF_CHAR_ARRAY_OP[i + 1] != "/") {
        for (let j = 0; j < VAR_DEFINE_NAME.length; j++) {
            if (VAR_DEFINE_NAME[j] === DEF_CHAR_ARRAY_OP[i + 1]) {
                DEF_CHAR_ARRAY_OP[i + 1] = parseInt(VAR_DEFINE_VALUE[j]); 
                break;
            }
        }
        for (let i2 = 0; i2 < PROTECTED_DEFINE_NAME.length; i2++) {
            if (PROTECTED_DEFINE_NAME[i2] === DEF_CHAR_ARRAY_OP[i + 1]) {
                DEF_CHAR_ARRAY_OP[i + 1] = parseInt(PROTECTED_DEFINE_VALUE[i2]); 
                break;
            }
        }
    }
    return DEF_CHAR_ARRAY_OP;
}

function variable_mention_init(content, mentioned) {
}

function event_init(contents) {
    const typeof_event = contents.split("event")[1].split("{")[0].split(" ");
    const event_item = typeof_event[0].split("->");
    switch (event_item[0]) {
        case "websocket":
            if (VAR_DEFINE_NAME.includes(event_item[1])) {
                const urltarget = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(event_item[1])].substring(VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(event_item[1])].indexOf("("), VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(event_item[1])].indexOf(")"));
                if (event_item[2] === "receive") {
                    const websocket_init = new WebSocket(urltarget);
                }
            }
            break;
    }
}

function def_parser(contents, type) {
    if (contents.includes("/") && !contents.includes('"') || contents.includes("*") && !contents.includes('"') || contents.includes("-") && !contents.includes('"') || contents.includes("+") && !contents.includes('"')) {
        if (_debug === true) console.log("BehemothScript: Parsing math logic");
        var DEF_CHAR_ARRAY_OP = contents.split(" ");
        if (typeof DEF_CHAR_ARRAY_OP[0] === "string") {
            for (let i = 0; i < VAR_DEFINE_NAME.length; i++) {
                if (VAR_DEFINE_NAME[i] === DEF_CHAR_ARRAY_OP[0]) DEF_CHAR_ARRAY_OP[0] = parseInt(VAR_DEFINE_VALUE[i]); break;
            }
            for (let i = 0; i < PROTECTED_DEFINE_NAME.length; i++) {
                if (PROTECTED_DEFINE_NAME[i] === DEF_CHAR_ARRAY_OP[0]) DEF_CHAR_ARRAY_OP[0] = parseInt(PROTECTED_DEFINE_VALUE[i]); break;
            }
        }
        var basenum = parseInt(DEF_CHAR_ARRAY_OP[0]);
        var i;
        for (i = 0; i < DEF_CHAR_ARRAY_OP.length; i++) {
            if (typeof parseInt(DEF_CHAR_ARRAY_OP[i]) != 'number' && DEF_CHAR_ARRAY_OP[i] != " " && DEF_CHAR_ARRAY_OP[i] != "-" && DEF_CHAR_ARRAY_OP[i] != "x" && DEF_CHAR_ARRAY_OP[i] != "+" && DEF_CHAR_ARRAY_OP[i] != "*" && DEF_CHAR_ARRAY_OP[i] != "/") throw "ParserError: Unexpected token " + DEF_CHAR_ARRAY_OP[i]; else;
            switch (DEF_CHAR_ARRAY_OP[i]) {
                case "+":
                    convert_string(DEF_CHAR_ARRAY_OP, i);
                    basenum = basenum + parseInt(DEF_CHAR_ARRAY_OP[i + 1]);
                    break;
                case "-":
                    convert_string(DEF_CHAR_ARRAY_OP, i);
                    basenum = basenum - parseInt(DEF_CHAR_ARRAY_OP[i + 1]);
                    break;
                case "*":
                    convert_string(DEF_CHAR_ARRAY_OP, i);
                    basenum = basenum * parseInt(DEF_CHAR_ARRAY_OP[i + 1]);
                    break;
                case "x":
                    convert_string(DEF_CHAR_ARRAY_OP, i);
                    basenum = basenum * parseInt(DEF_CHAR_ARRAY_OP[i + 1]);
                    break;
                case "/":
                    convert_string(DEF_CHAR_ARRAY_OP, i);
                    basenum = basenum / parseInt(DEF_CHAR_ARRAY_OP[i + 1]);
                    break;
                default:
                    break;
            }
        }
        if (_debug === true) console.log("BehemothScript: Finished logical calculations");
        return basenum;
    } else if (contents.includes('"')) {
        if (_debug === true) console.log("BehemothScript: Parsing string declaration");
        var printftokens = contents;
        if (printftokens.split('",')[1] != undefined) {
        const stringVars = printftokens.split('",')[1].trim().split(",");
        var stringrawcontent = printftokens.substring(1, printftokens.length - stringVars.join(" ").length - 3);
        var rawcontent = printftokens.substring(1, printftokens.length - stringVars.join(" ").length - 3).split(" ");

        var defs = [];
        var indicpos = [];
        var dindicpos = [];
        var i;
        var finalstring = [];
        
        for (i = 0; i < stringVars.length; i++) defs.push(stringVars[i].trim());
        for (i = 0; i < rawcontent.length; i++) {
            if (rawcontent[i].includes("%s")) indicpos.push(i);
            if (rawcontent[i].includes("%d")) dindicpos.push(i);
        }
        if (_debug === true) console.log("BehemothScript: Referencing variables from string");
        for (i = 0; i < rawcontent.length; i++) {
            if (rawcontent[i].includes("%s")) {
                if (VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])] != undefined) {
                finalstring.push(rawcontent[i].replace("%s", VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])]).trim());
                } else if (PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])] != undefined) {
                finalstring.push(rawcontent[i].replace("%s", PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])].trim()));    
                } else if (defs[indicpos.indexOf(i)].trim() === "VAR_NAME_STACK" && IMPORT_STACK.includes("internals")) {
                finalstring.push(rawcontent[i].replace("%s", VAR_DEFINE_NAME.join()));
                } else if (defs[indicpos.indexOf(i)].trim() === "VAR_DEF_STACK" && IMPORT_STACK.includes("internals")) {
                finalstring.push(rawcontent[i].replace("%s", VAR_DEFINE_VALUE.join()));
                } else if (defs[indicpos.indexOf(i)].includes(".")) {
                    specer_parser(defs[indicpos.indexOf(i)]);
                }
            } else finalstring.push(rawcontent[i].trim());
        }
        return finalstring.join(" ").trim();
        } else {
        const stringBase = contents.split('"')[1];
        return stringBase;
        }
    } else if (contents.includes(".")) {
        specer_parser(contents);
    } else if (typeof parseInt(contents) === "number") {
        if (_debug === true) console.log("BehemothScript: Intializing integer definition");
        return contents;
    } else if (contents.startsWith("websocket") && IMPORT_STACK.includes("websocket")) {
        return contents
    } else if (undefined) {

    } else {
        if (_debug === true) console.log("BehemothScript: Searching for variable references");
        var INIT_VAL;
        var DATA_TYPE;
        for (let i = 0; i < VAR_DEFINE_NAME.length; i++) {
            if (contents.startsWith(VAR_DEFINE_NAME[i])) INIT_VAL = VAR_DEFINE_NAME[i]; DATA_TYPE = "VAR";
        }
        if (INIT_VAL === undefined) {
            for (let i = 0; i < PROTECTED_DEFINE_NAME.length; i++) {
                if (contents.startsWith(PROTECTED_DEFINE_NAME[i])) INIT_VAL = VAR_DEFINE_NAME[i]; DATA_TYPE = "PROTECTED";
            }
        }
        if (INIT_VAL === undefined) throw `ParserError: Undefined reference to '${contents}'`; else;
        if (DATA_TYPE === "VAR") finalstring = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(INIT_VAL)];
        else if (DATA_TYPE === "PROTECTED") finalstring = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(INIT_VAL)];
        return finalstring;
    }
}

function printf(contents) {
    const printftokens = contents.trim().split(" ").join(" ").substring(1, contents.trim().split(" ").join(" ").length);
    if (printftokens.split('",')[1] != undefined) {
        if (_debug === true) console.log("BehemothScript: Locating variable references");
        const stringVars = printftokens.split('",')[1].trim().split(",");
        var stringrawcontent = printftokens.substring(1, printftokens.length - stringVars.join(" ").length - 3);
        var rawcontent = printftokens.substring(1, printftokens.length - stringVars.join(" ").length - 3).split(" ");

        var defs = [];
        var indicpos = [];
        var dindicpos = [];
        var i;
        var finalstring = [];

        for (i = 0; i < stringVars.length; i++) defs.push(stringVars[i].trim());
        for (i = 0; i < rawcontent.length; i++) {
            if (rawcontent[i].includes("%s")) indicpos.push(i);
            if (rawcontent[i].includes("%d")) dindicpos.push(i);
        }
        for (i = 0; i < rawcontent.length; i++) {
            if (rawcontent[i].includes("%s")) {
                if (VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])] != undefined) {
                finalstring.push(rawcontent[i].replace("%s", VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])]).trim());
                } else if (PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])] != undefined) {
                finalstring.push(rawcontent[i].replace("%s", PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(defs[indicpos.indexOf(i)])].trim()));
                }
            } else finalstring.push(rawcontent[i].trim());
        }
        console.log(finalstring.join(" "));

    } else {
        if (_debug === true) console.log("BehemothScript: Intializing out with no variable references");
        const printcontent = printftokens.substring(1, printftokens.length - 1);
        if (printcontent.includes("%s")) throw "ParserError: Undefined reference to string"; else;
        if (printcontent.includes("%d")) throw "ParserError: Undefined reference to integer"; else;
        console.log(printcontent);
    }
}

function var_init(contents) {
    if (_debug === true) console.log("BehemothScript: Initializing variable");
    var name;
    var equals

    if (contents.split("var")[1].split("=")[0] != undefined && contents.includes("=")) {    
    name = contents.trim().split("var")[1].split("=")[0].trim();
    equals = def_parser(contents.trim().split("var")[1].split("=")[1].trim());
    } else {
        name = contents.trim().split(" ")[1].trim();
        equals = "%%UNDEFINED_VAR_VALUE%%";
    }
    if (_debug === true) console.log("BehemothScript: Pushing variable into stack");
    VAR_DEFINE_NAME.push(name);
    VAR_DEFINE_VALUE.push(equals);
}

function protected_init(contents) {
    if (_debug === true) console.log("BehemothScript: Initializng protected value");
    var name;
    var equals
    if (contents.split("protected")[1].split("=")[0] != undefined && contents.includes("=")) {    
    name = contents.trim().split("protected")[1].split("=")[0].trim();
    equals = def_parser(contents.trim().split("protected")[1].split("=")[1].trim());
    } else {
        name = contents.trim().split(" ")[1].trim();
        equals = "%%UNDEFINED_PROTECTED_VALUE%%";
    }

    if (PROTECTED_DEFINE_NAME.indexOf(name) > -1) throw "ParserError: Protected values can only be declared once"; else {
    if (_debug === true) console.log("BehemothScript: Pushing protected value into stack");
    PROTECTED_DEFINE_NAME.push(name);
    PROTECTED_DEFINE_VALUE.push(equals);
    }
}

function bracer(bracesF) {
    var braces = bracesF;
    var open = [];
    var close = [];
    for (let i = 0; braces.length > 0; i++) {
        if (braces[i] === undefined || braces.length === 0) break;
        else
        if (braces[i].startsWith("{")) {
            if (braces[i + 1].startsWith("}")) {
                var j = i + 1;
                open.push(braces[i]);
                close.push(braces[i + 1]);
                braces.splice(i, 1);
                braces.splice(j - 1, 1);
            }
        }
    }
    for (let i2 = 0; i2 < open.length; i2++) LEFT_BRACE_STACK.push(open[i2]);
    for (let i3 = 0; i3 < close.length; i3++) RIGHT_BRACE_STACK.push(close[i3]);
    var pair = [ open, close, braces ];
    return pair;
}

function bracer_master(fulldocument) {
    if (_debug === true) console.log("BehemothScript: Pairing curly braces");
    var BRACE_LIST = [];
    var BRACE_POS = [];

    const mapcb = fulldocument.join(" ").trim().split('');
    for (let i = 0; i < mapcb.length; i++) {
        if (mapcb[i] === "{") {
            BRACE_LIST.push("{:" + i); BRACE_POS.push(i);
        } else if (mapcb[i] === "}") {
            BRACE_LIST.push("}:" + i); BRACE_POS.push(i);
        }
    }
    var req = bracer(BRACE_LIST);
    var l = [ req[0] ];
    var r = [ req[1] ];
    var full = req[2];
    while (full.length > 1) {
        full = bracer(full)[2];
        l.push(bracer(full)[0]);
        r.push(bracer(full)[1]);
    }
}

//[ {, {, }, } ]
function locate_opening_bracket(content, fulldocument) {
    var count;
    var positionofbrace;
    var closingbrace;
    var contents = fulldocument.join(" ").slice(fulldocument.join(" ").indexOf(content), fulldocument.join(" ").length)
    if (fulldocument.join(" ").length >= contents.length) count = fulldocument.join(" ").length - contents.length + contents.indexOf("{");
    const pos = count;
    for (let i = 0; i < LEFT_BRACE_STACK.length; i++) {
        var posF = LEFT_BRACE_STACK[i].split(":")[1];
        if (parseInt(posF) === pos) {
            positionofbrace = pos;
            closingbrace = RIGHT_BRACE_STACK[i].split(":")[1];
        } 
    }
    return [ positionofbrace, closingbrace ];
}

function conditional_logic_manager(condition) {
    if (_debug === true) console.log("BehemothScript: Resolving conditional logic");
    if (condition.includes("<")) {
        const val1 = condition.split("<")[0].trim();
        const val2 = condition.split("<")[1].trim();
        if (typeof parseInt(val1) === "number" && typeof parseInt(val2) === "number") {
            if (val1 < val2) return true
            else if (val1 > val2 || val1 === val2) return false;
        } else if (VAR_DEFINE_NAME.includes(val1)) {
            const idval1 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val1)];
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)];
            if (idval1 < idval2) return true;
            else if (idval1 > idval2 || idval1 === idval2) return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)]
            if (idval1 < idval2) return true;
            else if (idval1 > idval2 || idval1 === idval2) return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        } else if (PROTECTED_DEFINE_NAME.includes(val1)) {
            const idval1 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val1)]
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)]
            if (idval1 < idval2) return true;
            else if (idval1 > idval2 || idval1 === idval2) return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)];
            if (idval1 < idval2) return true;
            else if (idval1 > idval2 || idval1 === idval2) return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        }
    } else if (condition.includes(">")) {
        const val1 = condition.split(">")[0].trim();
        const val2 = condition.split(">")[1].trim();
        if (typeof parseInt(val1) === "number" && typeof parseInt(val2) === "number") {
            if (val1 > val2) return true
            else if (val1 < val2 || val1 === val2) return false;
        } else if (VAR_DEFINE_NAME.includes(val1)) {
            const idval1 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val1)];
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)];
            if (idval1 > idval2) return true;
            else if (idval1 < idval2 || idval1 === idval2) return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)]
            if (idval1 > idval2) return true;
            else if (idval1 < idval2 || idval1 === idval2) return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        } else if (PROTECTED_DEFINE_NAME.includes(val1)) {
            const idval1 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val1)]
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)]
            if (idval1 > idval2) return true;
            else if (idval1 < idval2 || idval1 === idval2) return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)];
            if (idval1 > idval2) return true;
            else if (idval1 < idval2 || idval1 === idval2) return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        }
    } else if (condition.includes("===")) {
        const val1 = condition.split("===")[0].trim();
        const val2 = condition.split("===")[1].trim();
        if (typeof parseInt(val1) === "number" && typeof parseInt(val2) === "number") {
            if (val1 === val2) return true;
            else return false;
        } else if (VAR_DEFINE_NAME.includes(val1)) {
            const idval1 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val1)];
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)];
            if (idval1 === idval2) return true;
            else return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)]
            if (idval1 === idval2) return true;
            else return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        } else if (PROTECTED_DEFINE_NAME.includes(val1)) {
            const idval1 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val1)]
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)]
            if (idval1 === idval2) return true;
            else return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)];
            if (idval1 === idval2) return true;
            else return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        }
    } else if (condition.includes("==")) {
        const val1 = condition.split("==")[0].trim();
        const val2 = condition.split("==")[1].trim();
        if (typeof parseInt(val1) === "number" && typeof parseInt(val2) === "number") {
            if (val1 == val2) return true;
            else return false;
        } else if (VAR_DEFINE_NAME.includes(val1)) {
            const idval1 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val1)];
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)];
            if (idval1 == idval2) return true;
            else return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)]
            if (idval1 == idval2) return true;
            else return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        } else if (PROTECTED_DEFINE_NAME.includes(val1)) {
            const idval1 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val1)]
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)]
            if (idval1 == idval2) return true;
            else return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)];
            if (idval1 == idval2) return true;
            else return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        }
    } else if (condition.includes("=")) {
        const val1 = condition.split("=")[0].trim();
        const val2 = condition.split("=")[1].trim();
        if (typeof parseInt(val1) === "number" && typeof parseInt(val2) === "number") {
            if (val1 = val2) return true;
            else return false;
        } else if (VAR_DEFINE_NAME.includes(val1)) {
            const idval1 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val1)];
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)];
            if (idval1 = idval2) return true;
            else return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)]
            if (idval1 = idval2) return true;
            else return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        } else if (PROTECTED_DEFINE_NAME.includes(val1)) {
            const idval1 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val1)]
            if (PROTECTED_DEFINE_NAME.includes(val2)) {
            const idval2 = PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(val2)]
            if (idval1 = idval2) return true;
            else return false;
            } else if (VAR_DEFINE_NAME.includes(val2)) {
            const idval2 = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(val2)];
            if (idval1 = idval2) return true;
            else return false;
            } else throw `ParserError: Undefined reference to '${val2}'`;
        }
    }
}
// VAR < CONST, VAR < VAR, CONST < CONST, CONST < VAR
function if_statement_init(contents, fulldocument) {
    if (_debug === true) console.log("BehemothScript: Initializing conditional statement");
    const execution_data = fulldocument.join(" ").substring(locate_opening_bracket(contents, fulldocument)[0] + 1, locate_opening_bracket(contents, fulldocument)[1]).trim();
    if (contents.includes("{")) {
        const condition = contents.split("{")[0].split("if")[1].trim();
        if (!condition.includes("&&") && !condition.includes("||")) {
            var result = conditional_logic_manager(condition);
            CONDITIONAL_STATEMENT_TEMPORARY_DATA = execution_data.split(";").length;
            if (result === true) {
                CONDITIONAL_CONDITION_STACK.push(condition);
                CONDITIONAL_STATEMENT_STACK.push(execution_data);
                init_lexer(execution_data);
            }
        } else if (condition.includes("&&") && condition.includes("||")) {
            var CONTINUE_ORDER = [];
            const andgate = condition.split("&&");
            for (let i = 0; i < andgate.length; i++) {
                if (andgate[i].includes("||")) {
                    var orgate = andgate[i].split("||");
                    var CONDITIONS = [];
                    var CONTINUE_ORDER = [];
                    for (let i = 0; i < orgate.length; i++) {
                        if (conditional_logic_manager(orgate[i]) === undefined) throw "ParserError: Internal logic error";
                        if (conditional_logic_manager(orgate[i]) === false) CONDITIONS.push(false);
                        if (conditional_logic_manager(orgate[i]) === true) CONDITIONS.push(true);
                    }
                    if (CONDITIONS.includes(true)) {
                        CONTINUE_ORDER.push(true);
                    } else CONTINUE_ORDER.push(false);
                } else if (conditional_logic_manager(andgate[i]) === true) {
                    CONTINUE_ORDER.push(true);
                } else if (conditional_logic_manager(andgate[i]) === false) CONTINUE_ORDER.push(false);
            }
            if (!CONTINUE_ORDER.includes(false)) {
                CONDITIONAL_CONDITION_STACK.push(condition);
                CONDITIONAL_STATEMENT_STACK.push(execution_data);
                init_lexer(execution_data);
            }
        } else if (condition.includes("&&") && !condition.includes("||")) {
            const andgate = condition.split("&&");
            var CONTINUE_ORDER = [];
            for (let i = 0; i < andgate.length; i++) {
                if (conditional_logic_manager(andgate[i]) === undefined) throw "ParserError: Internal logic error";
                if (conditional_logic_manager(andgate[i]) === false) break; CONTINUE_ORDER.push(false);
            }
            if (!CONTINUE_ORDER.includes(false)) {
                CONDITIONAL_CONDITION_STACK.push(condition);
                CONDITIONAL_STATEMENT_STACK.push(execution_data);
                init_lexer(execution_data);
            }
        } else if (!condition.includes("&&") && condition.includes("||")) {
            const orgate = condition.split("||");
            var CONDITIONS = [];
            var CONTINUE_ORDER = [];
            for (let i = 0; i < orgate.length; i++) {
                if (conditional_logic_manager(orgate[i]) === undefined) throw "ParserError: Internal logic error";
                if (conditional_logic_manager(orgate[i]) === false) CONDITIONS.push(false);
                if (conditional_logic_manager(orgate[i]) === true) CONDITIONS.push(true);
            }
            if (CONDITIONS.includes(true)) {
                CONDITIONAL_CONDITION_STACK.push(condition);
                CONDITIONAL_STATEMENT_STACK.push(execution_data);
                init_lexer(execution_data);
            }
        }
    }
}

function function_init(contents, fulldocument, contentsF) {
    if (_debug === true) console.log("BehemothScript: Initializing function")
    const execution_data = fulldocument.join(" ").substring(locate_opening_bracket(contents, fulldocument)[0] + 1, locate_opening_bracket(contents, fulldocument)[1]).trim();
    const params = contents.substring(contents.indexOf("(") + 1, contents.indexOf(")"));
    const name = contents.split("define")[1].split("(")[0].trim();
    if (LOCAL_FUNCTION_NAME_STACK.includes(name)) throw "ParserError: Function already declared"; else
    if (_debug === true) console.log("BehemothScript: Pushing function into stack");
    LOCAL_FUNCTION_PARAM_STACK.push(params);
    LOCAL_FUNCTION_DATA_STACK.push(execution_data);
    LOCAL_FUNCTION_NAME_STACK.push(name);
    FUNCTION_TEMPORARY_DATA = execution_data.split(";").length;
}

function function_cleanup() {
    if (_debug === true) console.log("BehemothScript: Clearing short term function stack");
    return FUNCTION_TEMPORARY_DATA - 1;
}

function conditional_cleanup() {
    if (_debug === true) console.log("BehemothScript: Clearing short term conditional stack");
    return CONDITIONAL_STATEMENT_TEMPORARY_DATA - 1;
}

function function_void_params_init(contents) {
    
}

function function_call(contents) {
    if (_debug === true) console.log("BehemothScript: Executing function");
    var optional_args = 0;

    const function_name = contents.split("(")[0].trim();
    const function_arguments = contents.substring(contents.indexOf("("), contents.indexOf(")"));
    if (!function_arguments.length) {
        if (LOCAL_FUNCTION_PARAM_STACK[LOCAL_FUNCTION_NAME_STACK.indexOf(function_name)] === "void") {
            if (!LOCAL_FUNCTION_NAME_STACK.includes(contents.trim())) throw `ParserError: Function '${function_name}' does not exist`; else;
            if (LOCAL_FUNCTION_PARAM_STACK[LOCAL_FUNCTION_NAME_STACK.indexOf(contents.trim())] !== "void") throw "Error: This function accepts arguments, 0 supplied"; else;
            const function_data = LOCAL_FUNCTION_DATA_STACK[LOCAL_FUNCTION_NAME_STACK.indexOf(contents.trim())];
            init_lexer(function_data);
        } else throw "ParserError: Insufficient arguments supplied to function " + function_name;
    } else {
    if (!LOCAL_FUNCTION_NAME_STACK.includes(function_name)) throw `ParserError: Function '${function_name}' does not exist`; else;
    const function_params = LOCAL_FUNCTION_PARAM_STACK[LOCAL_FUNCTION_NAME_STACK.indexOf(function_name)].split(",");
    if (LOCAL_FUNCTION_PARAM_STACK[LOCAL_FUNCTION_NAME_STACK.indexOf(function_name)] === "void") throw "Error: This function does not accept any arguments"; else;
    const function_data = LOCAL_FUNCTION_DATA_STACK[LOCAL_FUNCTION_NAME_STACK.indexOf(function_name)];
    for (let i = 0; i < function_params.length; i++) {
        VAR_DEFINE_NAME.push(function_params[i]);
        VAR_DEFINE_VALUE.push(function_arguments.split(",")[i]);
        if (function_params[i].startsWith("*")) optional_args.push(function_params[i]);
    }
    const expected_args = function_params.length - optional_args.length;
    const given_args = function_arguments.split(",").length;
    const scoped_variables = VAR_DEFINE_NAME.slice(VAR_DEFINE_NAME.indexOf(function_params[0]), VAR_DEFINE_NAME.length);
    if (expected_args > given_args) throw `ParserError: Insufficient arguments, '${function_name}' expects ${expected_args} arguments yet ${given_args} are given`;
    else if (expected_args < given_args) throw `ParserError: Too many arguments supplied, '${function_name}' expects ${expected_args} arguments but ${given_args} are given`;
    else 
    init_lexer(function_data);
    //cleanup
    if (_debug === true) console.log("BehemothScript: Clearing unnecessary function execution data");
    for (let i = 0; i < function_params.length; i++) {
        VAR_DEFINE_NAME.splice(VAR_DEFINE_NAME.indexOf(function_params[i]), 1);
        VAR_DEFINE_VALUE.splice(VAR_DEFINE_NAME.indexOf(function_params[i]), 1);
    } for (let i = 0; i < scoped_variables; i++) {
        VAR_DEFINE_NAME.splice(VAR_DEFINE_NAME.indexOf(scoped_variables[i]), 1);
        VAR_DEFINE_VALUE.splice(VAR_DEFINE_NAME.indexOf(scoped_variables[i]), 1);
    }
}
}

export { printf };
export { var_init }
export { protected_init };
export { function_init };
export { variable_mention_init };
export { function_void_params_init };

export { def_parser };
export { bracer_master };
export { function_call };
export { function_cleanup };
export { conditional_cleanup };

export { if_statement_init };

export { VAR_DEFINE_NAME };
export { VAR_DEFINE_VALUE };

export { PROTECTED_DEFINE_NAME };
export { PROTECTED_DEFINE_VALUE };

export { LOCAL_FUNCTION_DATA_STACK };
export { LOCAL_FUNCTION_PARAM_STACK };
export { LOCAL_FUNCTION_NAME_STACK };
export { FUNCTION_TEMPORARY_DATA };

export { CONDITIONAL_STATEMENT_TEMPORARY_DATA };

export { IMPORT_STACK };

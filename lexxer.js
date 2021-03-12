import fs from "fs";

import { LOCAL_FUNCTION_PARAM_STACK, printf } from "./tokenparser.js";
import { var_init } from "./tokenparser.js";
import { protected_init } from "./tokenparser.js";
import { function_init } from "./tokenparser.js";
import { function_void_params_init } from "./tokenparser.js";
import { if_statement_init } from "./tokenparser.js";
import { variable_mention_init } from "./tokenparser.js";

import { def_parser } from "./tokenparser.js";
import { final_scanner } from "./utils.js";
import { import_handler } from "./utils.js";
import { bracer_master } from "./tokenparser.js";
import { function_call } from "./tokenparser.js";
import { function_cleanup } from "./tokenparser.js";
import { conditional_cleanup } from "./tokenparser.js";

import { PROTECTED_DEFINE_NAME } from "./tokenparser.js";
import { PROTECTED_DEFINE_VALUE } from "./tokenparser.js";

import { VAR_DEFINE_NAME } from "./tokenparser.js";
import { VAR_DEFINE_VALUE } from "./tokenparser.js";

import { IMPORT_STACK } from "./tokenparser.js";

import { CONDITIONAL_STATEMENT_TEMPORARY_DATA } from "./tokenparser.js";

import { LOCAL_FUNCTION_NAME_STACK } from "./tokenparser.js";
import { FUNCTION_TEMPORARY_DATA } from "./tokenparser.js";
const _debug = false;
async function init_lexer(...contentsF) {
    if (_debug === true) console.log("BehemothScript: Initialized lexer");
    bracer_master(contentsF);
    var fullcontent = contentsF;
    var contents = fullcontent.join(" ").trim().split(";");
    var i;
    for (i = 0; i < contents.length; i++) {
        if (contents[i].trim().startsWith('f"')) {
            //init print
            printf(contents[i]);
        } else if (contents[i].trim().startsWith("var")) {
            //init var
            var_init(contents[i]);
        } else if (contents[i].trim().startsWith("protected")) {
            //init protected
            protected_init(contents[i]);
        } else if (contents[i].trim().startsWith("define")) {
            //init functions
            function_init(contents[i], contentsF, fullcontent);
            i = i + function_cleanup();
        } else if (PROTECTED_DEFINE_NAME.includes(contents[i].trim().split("=")[0].trim())) {
            //define a pre declared protected value
            if (PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(contents[i].trim().split("=")[0].trim())] === "%%UNDEFINED_PROTECTED_VALUE%%") {
                PROTECTED_DEFINE_VALUE[PROTECTED_DEFINE_NAME.indexOf(contents[i].trim().split("=")[0].trim())] = def_parser(contents[i].trim().split("=")[1].trim());
            } else throw "ParserError: Protected values definitions are unchangeable";
        } else if (VAR_DEFINE_NAME.includes(contents[i].trim().split("=")[0].trim())) {
            //define a pre declared var
            VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(contents[i].trim().split("=")[0].trim())] = def_parser(contents[i].trim().split("=")[1].trim());
        } else if (contents[i].trim().startsWith("#import")) {
            //init import
            import_handler(contents[i]);
        } else if (LOCAL_FUNCTION_NAME_STACK.includes(contents[i].split('(')[0].trim())) {
            //function calls
            function_call(contents[i]);
        } else if (contents[i].trim().startsWith("if")) {
            //init conditions
            if_statement_init(contents[i], contentsF);
            i = i + conditional_cleanup();
        } else if (VAR_DEFINE_NAME.includes(contents[i]) || PROTECTED_DEFINE_NAME.includes(contents[i])) {
            //variable calls
            if (VAR_DEFINE_NAME.includes(contents[i])) variable_mention_init(contents[i], "VAR");
            else if (PROTECTED_DEFINE_NAME.includes(contents[i])) variable_mention_init(contents[i], "PROTECTED");
        } 
    }
    //Checks for unused variables and such
    final_scanner();
}

const data = fs.readFileSync('./testing.txt', 'utf8').replace( /[\r\n]+/gm, " " ); 
init_lexer(data);

export { init_lexer };
export { _debug };

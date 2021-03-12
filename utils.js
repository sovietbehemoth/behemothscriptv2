import { def_parser } from "./tokenparser.js";
import { _debug } from "./lexxing.js";

import { PROTECTED_DEFINE_NAME } from "./tokenparser.js";
import { PROTECTED_DEFINE_VALUE } from "./tokenparser.js";
import { VAR_DEFINE_NAME } from "./tokenparser.js";
import { VAR_DEFINE_VALUE } from "./tokenparser.js";
import { IMPORT_STACK } from "./tokenparser.js"

function specer_parser(contents) {
    if (_debug === true) console.log("BehemothScript: Identifying references");
    const specer = contents.split(".");
    var final_value;
    for (let i = 1; i < specer.length; i++) {
        if (VAR_DEFINE_NAME.includes(specer[0])) {
           const val = VAR_DEFINE_VALUE[VAR_DEFINE_NAME.indexOf(specer[0])];
           final_value = val;
           if (val === "%%UNDEFINED_VAR_VALUE%%") throw `ParserError: var '${specer[0]}' is undefined`; else;     
           if (specer[i].startsWith("startswith")) {  
                const targetval = specer[i].substring(specer[i].indexOf("(") + 1, specer[i].lastIndexOf(")"));
                const parsed_value = def_parser(targetval);
                
           }
        }
    }
}

function final_scanner() {
    if (_debug === true) console.log("BehemothScript: Scanning for inconsistencies");
    for (let i = 0; i < VAR_DEFINE_VALUE.length; i++) {
        if (VAR_DEFINE_VALUE[i] === "%%UNDEFINED_VAR_VALUE%%") console.warn(`ParserWarning: var '${VAR_DEFINE_NAME[i]}' is declared but never defined`);        
    }
    for (let i = 0; i < PROTECTED_DEFINE_VALUE.length; i++) {
        if (PROTECTED_DEFINE_VALUE[i] === "%%UNDEFINED_PROTECTED_VALUE%%") console.warn(`ParserWarning: protected '${PROTECTED_DEFINE_NAME[i]}' is declared but never defined`);
    }
    if (_debug === true) console.log("BehemothScript: Finished execution of code");
}

function import_handler(contents) {
    if (_debug === true) console.log("BehemothScript: Pushing item to imported stack");
    const import_request = contents.split("#import")[1].trim();
    IMPORT_STACK.push(import_request);
}

export { specer_parser };
export { final_scanner };
export { import_handler };

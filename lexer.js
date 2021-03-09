import { isWorker } from "cluster";
import fs from "fs";

const LEFT_PAREN = "(";
const RIGHT_PAREN = ")";
const SEMI_COLON = ";";
const FULL_COLON = ":";
const COMMA = ",";
const CURLY_LEFT_BRACE = "{";
const CURLY_RIGHT_BRACE = "}";
const STRING_INDICATOR = `"`;

function syntax_varname(token) {
    var i;
    var tokenarray = token.split('');
    for (i = 0; i < token.length; i++) {
        switch (tokenarray[i]) {
            case "a":
                break;
            case "b":
                break;
            case "c":
                break;
            case "d":
                break;
            case "e":
                break;
            case "f":
                break;
            case "g":
                break;
            case "h":
                break;
            case "i":
                break;
            case "j":
                break;
            case "k":
                break;
            case "l":
                break;
            case "m":
                break;
            case "n":
                break;
            case "o":
                break;
            case "p":
                break;
            case "q":
                break;
            case "r":
                break;
            case "s":
                break;
            case "t":
                break;
            case "u":
                break;
            case "v":
                break;
            case "w":
                break;
            case "x":
                break;
            case "y":
                break;
            case "z":
                break;
            case "A":
                break;
            case "B":
                break;
            case "C":
                break;
            case "D":
                break;
            case "E":
                break;
            case "F":
                break;
            case "G":
                break;
            case "H":
                break;
            case "I":
                break;
            case "J":
                break;
            case "K":
                break;
            case "L":
                break;
            case "M":
                break;
            case "N":
                break;
            case "O":
                break;
            case "P":
                break;
            case "Q":
                break;
            case "R":
                break;
            case "S":
                break;
            case "T":
                break;
            case "U":
                break;
            case "V":
                break;
            case "W":
                break;
            case "X":
                break;
            case "Y":
                break;
            case "Z":
                break;
            case "1":
                break;
            case "2":
                break;
            case "3":
                break;
            case "4":
                break;
            case "5":
                break;
            case "6":
                break;
            case "7":
                break;
            case "8":
                break;
            case "9":
                break;
            case "0":
                break;
            default:
                throw `ParserError: Unexpected token '${tokenarray[i]}'`;
                break;
        }
    }
}

var VAR_DEF_NAME = [];
var VAR_DEF_VALUE = [];

var IF_STATEMENT_PUSH_CONTENTS = [];
var IF_STATEMENT_POS = [];

function init_lexer(...contentF) {
    const contents = contentF.join(" ");
    const tokenarray = contents.split(" ");
    var i;
    for (i = 0; i < tokenarray.length; i++) {
        console.log(tokenarray[i])
        if (tokenarray[i] != undefined && tokenarray[i] != ' ')
        if (tokenarray[i].startsWith("if")) {
            var splitarrayindexxing = tokenarray.slice(i, tokenarray.length);
            var findsemicolon = splitarrayindexxing.find(element => element.indexOf("{") > -1);
            var ifstatement = splitarrayindexxing.slice(i, splitarrayindexxing.indexOf(findsemicolon)).slice(1, splitarrayindexxing.slice(i, splitarrayindexxing.indexOf(findsemicolon)).length);
            var thendo = splitarrayindexxing.slice(splitarrayindexxing.indexOf(findsemicolon), splitarrayindexxing.indexOf(splitarrayindexxing.find(element => element.indexOf("}") > -1)));
            if (ifstatement.indexOf(">") > -1) {
                var firstoperator = parseInt(ifstatement.join(" ").split(">")[0].trim());
                var secondoperator = parseInt(ifstatement.join(" ").split(">")[1].trim());
                if (firstoperator > secondoperator && typeof firstoperator === 'number' && typeof secondoperator === 'number') {
                    var thendo_formatted = thendo.slice(1, thendo.length).join(" ").trim();
                    var i0; for (i0 = 0; i0 < thendo_formatted.length; i0++) IF_STATEMENT_PUSH_CONTENTS.push(thendo_formatted[i0]);
                    i = ifstatement.length+i+1+thendo.length;
                    init_lexer(thendo_formatted)
                } else i=ifstatement.length+i+1+thendo.length                
            } else if (ifstatement.indexOf("<") > -1) {
                var firstoperator = parseInt(ifstatement.join(" ").split("<")[0].trim());
                var secondoperator = parseInt(ifstatement.join(" ").split("<")[1].trim());
                if (firstoperator < secondoperator && typeof firstoperator === 'number' && typeof secondoperator === 'number') {
                    var thendo_formatted = thendo.slice(1, thendo.length).join(" ").trim();
                    i=ifstatement.length+i+1+thendo.length
                    init_lexer(thendo_formatted)
                } else i=ifstatement.length+i+1+thendo.length
            }
        } else if (tokenarray[i].startsWith("var")) {
            var splitarrayindexxing = tokenarray.slice(i, tokenarray.indexOf(tokenarray.find(element => element.indexOf(";") > -1)) + 1);
            var varName = splitarrayindexxing[0];
            //syntax_varname(varName);
            VAR_DEF_NAME.push(varName);
            if (splitarrayindexxing[2].trim() != "=") throw "ParserError: Expected '='"; else;
            var locateEqOperator = splitarrayindexxing.join(" ").split("=")[1].split(" ");
            var iq;
            var defval = [];
            for (iq = 1; iq < locateEqOperator.length; iq++) {
                if (locateEqOperator[1].includes('"')) {
                    if (locateEqOperator[iq].includes('"') && locateEqOperator[iq].split('"')[1] != '') {
                        defval.push(locateEqOperator[i].split('"')[1])
                    } else if (locateEqOperator[iq].includes('"') && locateEqOperator[iq].split('"')[0] != '') {
                        defval.push(locateEqOperator[i].split('"')[0]);
                    } else defval.push(locateEqOperator[i]);
                }
            }
            VAR_DEF_VALUE.push(defval.join(" "));
        } else if (tokenarray[i].startsWith('f"')) {
            var splitarrayindexxing = tokenarray.slice(i, tokenarray.indexOf(tokenarray.find(element => element.indexOf(";") > -1)) + 1);
            console.log(splitarrayindexxing)
            var endingstring
            var stringcontents = [];
            var varRef = [];
            var i2;
            for (i2 = 0; i2 < splitarrayindexxing.length; i2++) {
                if (splitarrayindexxing[i2].startsWith('f"')) {
                    stringcontents.push(splitarrayindexxing[i2].split('f"')[1]);
                } else if (splitarrayindexxing[i].indexOf('"') > -1) {
                    stringcontents.push(splitarrayindexxing[i2].split('"')[0]);
                    if (splitarrayindexxing[i2].split('"')[0] === "%s") {
                        varRef.push("STRING");
                    } else if (splitarrayindexxing[i2].split('"')[0] === "%d") {
                        varRef.push("INTEGER");
                    }
                    endingstring = splitarrayindexxing.slice(i2, splitarrayindexxing.length);
                    break;
                } else if (splitarrayindexxing[i2] === "%s") {
                    console.log(i2)
                    varRef.push("STRING");
                } else if (splitarrayindexxing[i2] === "%d") {
                    varRef.push("INTEGER");
                } else stringcontents.push(splitarrayindexxing[i2]);
            }
            if (varRef.length != 0) {
                if (!endingstring.join(" ").includes(",")) throw "ParserError: Undefined references to " + varRef.join(); else;
                var refs = endingstring.join(" ").split(",");
                var i3;
                var defs = [];
                for (i3 = 1; i3 < refs.length; i3++) {
                    if (VAR_DEF_NAME.includes(refs[i].trim())) {
                        defs.push(VAR_DEF_VALUE[VAR_DEF_NAME.indexOf(refs[i])])
                    } 
                }
                var i4;
                var replaceablestring = stringcontents;
                for (i4 = 0; i4 < splitarrayindexxing.length; i4++) {
                    if (splitarrayindexxing[i4] === "%s") {
                        if (typeof defs[i4] === "string") {
                            replaceablestring.replace(splitarrayindexxing[i4], defs[i4])
                        }
                        if (splitarrayindexxing[i4].includes('"')) break;
                    } 
                    if (splitarrayindexxing[i4].includes('"')) break;
                }
                console.log(replaceablestring);
            } else console.log(stringcontents.join(" ").split('"')[0]);        
        } else;
    }
}

const data = fs.readFileSync('./testing.txt', 'utf8').replace( /[\r\n]+/gm, " " ); 
init_lexer(data);

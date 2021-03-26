/* 
 Yes this is bad practise but it was the most practacle way to handle this
 */
Array.prototype.peek = function() {
  if (this.length == 0) return null
  
  let value = this.pop()
  this.push(value)
  return value
}

// Variable that controls the console output level
let debug = false

// List of variables we can keep adding to without repeats
const VARLIST = new Set()

// Type definitions
const TYPE = {
  VAR   :  debug ? 'variable'      : 0,
  OP    :  debug ? 'operator'      : 1,
  OPEN  :  debug ? '(perenthesis'  : 2,
  CLOSE :  debug ? 'perenthesis)'  : 3,
}

// Opcode definitions for performance/maintainablity
const OPCODE = {
  NOT :  debug ? 'not' : 100,
  AND :  debug ? 'and' : 101,
  OR  :  debug ? 'or'  : 102,
  IF  :  debug ? 'if'  : 103,
  IFF :  debug ? 'iff' : 104,
}

// Definitions for operator meanings
const DEF = {
  NOT : (n) => 1 - n,
  AND : (a, b) => a && b,
  OR  : (a, b) => a || b,
  IF  : (a, b) => DEF.OR(DEF.NOT(a), b),
  IFF : (a, b) => DEF.AND(DEF.IF(a, b), DEF.IF(b, a)),
}

// Class for each token
class Token {
  constructor(type, value) {
    this.type = type
    this.value = value
    //this.precedence = 0

    if (this.type == TYPE.OP) {
      switch(this.value) {
        case OPCODE.NOT:
          this.precedence = 5
          break
        
        case OPCODE.AND:
          this.precedence = 4
          break

        case OPCODE.OR:
          this.precedence = 3
          break

        case OPCODE.IF: 
          this.precedence = 2
          break
        
        case OPCODE.IFF:
          this.precedence = 2
          break
        // Doesnt need a default because error checking happens before this step
        default:
          break
      }
    }

    if (this.type == TYPE.OPEN || this.type == TYPE.CLOSE) this.precedence = -1

    if (this.type == TYPE.VAR) {
      VARLIST.add(this.value)
    }
  }
}

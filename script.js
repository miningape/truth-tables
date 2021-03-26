let test = 'not(myval iff other)'

// Lexer splits the test into chunks to be analysed
const lexer = ( str ) => {
  let lexerRegex = /\\s*(and|not|or|if|iff)*?\\s*|[A-Za-z]+|[()]{1}/g

  return str.match( lexerRegex )  
}

// Tokenizer makes tokens from the lexes
const tokenizer = (lexeme) => {
  let vars = '[A-Za-z]+'
  let operators = ['and', 'or', 'not', 'if', 'iff'];
  let specOps = `^\\s*(${operators.join('|')})\\s*$`

  let varsRegex = new RegExp('^'+vars+'$', 'g')
  let opsRegex = new RegExp(specOps, 'gi')
  let perenRegex = /[()]/g

  tokens = []

  lexeme.forEach( lex => {
    // JS makes you reset the regex otherwise it fucks up because it starts searching at last index and calling regex moves the last index
    varsRegex.lastIndex = 0
    opsRegex.lastIndex = 0
    perenRegex.lastIndex = 0

    switch( true ) {
      case opsRegex.test(lex):
        if (debug) console.log(`Detected Symbol "${lex}": operator`)
        // Reset regex
        opsRegex.lastIndex = 0
        let value = opsRegex.exec(lex)[1].toUpperCase()
        tokens.push( new Token(TYPE.OP, OPCODE[value]) )
        break;
      
      case perenRegex.test(lex):
        let perenType = lex == '(' ?  TYPE.OPEN : TYPE.CLOSE
        if (debug) console.log(`Detected Symbol "${lex}": ${perenType}`)
        tokens.push( new Token( perenType, lex) )
        break;
      
      case varsRegex.test(lex):
        if (debug) console.log(`Detected Symbol "${lex}": variable`)
        tokens.push( new Token(TYPE.VAR, lex) )
        break;

      default:
        if (lex.endsWith(']')) throw(`"${lex}" is not recognised as an operator, the only accepted operators are [and], [or], whitespace is allowed but no other characters`)
        else throw(`"${lex}" is not recognised at all, try reformatting`)
        break;
    }
  } )

  if (debug) console.log('\ntokenised form:\n', tokens)
  return tokens
} 

// Shunting yard algorithm
const astGen = ( tokens ) => {
  if (tokens.length == 0) throw('no text')
  
  operatorS = []
  output = []

  tokens.forEach(token => {
    switch (token.type) {
      case TYPE.VAR: 
        output.push(token)
        break
      
      case TYPE.OP:
        while (operatorS.peek()?.precedence >= token.precedence) {
          output.push(operatorS.pop())
        }
        operatorS.push(token)
        break
      
      case TYPE.OPEN:
        operatorS.push(token)
        break
      
      case TYPE.CLOSE:
        while ( operatorS.peek().type != TYPE.OPEN ) {
          output.push(operatorS.pop())
        }
        operatorS.pop()
        break
    }
  })


  while (operatorS.length > 0) {
    output.push(operatorS.pop())
  }

  if (debug) console.log('\npostfix tokens:\n', output)
  return output
}

// interpret without using eval :)
const combinationGen = ( ) => {
  // Generate all combinations of values
  // turn set into array
  let varArr = [...VARLIST]

  // We will test all combination format {ab} => 00, 01, 10, 11... This is essentially counting in binary, and the number of digits is the number of variables
  let combinationArray = []

  let combinations = 2 ** varArr.length
  for (let i = 0; i < combinations; i++) {
    let binary = i.toString(2).padStart(varArr.length, 0).split('')
    let combinationObject = {}

    varArr.forEach( (key, i) => {
      combinationObject[key] = +binary[i] || 0
    } )

    combinationArray.push( combinationObject )
  }

  if (debug) console.log('\nThe combinations:', combinationArray)

  return combinationArray
}

const interpret = (ast, combinations) => {
  let resultArray = []
  combinations.forEach( option => {
    let stack = []
    ast.forEach( token => {
      switch(token.type) {
        case TYPE.VAR:
          stack.push( option[token.value] )
          break

        case TYPE.OP:
          // yesyes switch inside switch is bad semantics, but i think it gives a more elegant solution in this case
          switch (token.value) {
            case OPCODE.NOT: 
              // Invert top of stack
              let temp = stack.pop()
              stack.push( DEF.NOT(temp) )
              break

            case OPCODE.AND:
              // AND op on top 2 elements extract 2nd first because it is ontop of 1st
              elem2 = stack.pop()
              elem1 = stack.pop()
              stack.push( DEF.AND(elem1, elem2) )
              break;
            
            case OPCODE.OR:
              // pop top 2 and combine with or
              elem2 = stack.pop()
              elem1 = stack.pop()
              stack.push( DEF.OR(elem1, elem2) )
              break

            case OPCODE.IF: 
              // pop top 2 and combine
              elem2 = stack.pop()
              elem1 = stack.pop()
              stack.push( DEF.IF(elem1, elem2) )
              break

            case OPCODE.IFF: 
              // pop top 2 and combine
              elem2 = stack.pop()
              elem1 = stack.pop()
              stack.push( DEF.IFF(elem1, elem2) )
              break
            default: break;
          }

          break
        
        default:
          break;
      }
    })
    resultArray.push(stack.pop())
  })

  return resultArray
}

const run = ( logicStr ) => {
  lexemes = lexer(logicStr)
  tokens  = tokenizer(lexemes)
  ast     = astGen(tokens)
  combList= combinationGen() // Must be run after tokenization as that function generates the values needed for this
  results = interpret( ast, combList )

  let table = []
  combList.forEach( (combination, i) => {
    combination.value = results[i]
    table.push( combination )
  } )

  return table
}

// main for testing
(function main(){
  /* l = lexer(test)
  t = tokenizer(l)
  a = astGen(t)
  c = combinationGen(a)
  r = interpret(a, c)
  console.log(r, c) */
  v = run( test )
  console.log(v)
})()

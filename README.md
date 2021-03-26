# truth-tables
I have always been kinda interested in logical operators/gates. While doing a course on logic and discrete math I often used [this site](https://web.stanford.edu/class/cs103/tools/truth-table-tool/). Here I want to create a very similar thing but with more updated UI and my own logic truth table generator.

# Roadmap / todo
- [x] build a basic logic table generator
- [ ] polish the generator (more symbols/alternative ways of writing)
- [ ] make nice looking frontend for the website
- [ ] make it so error messages are displayed nicely
- [ ] make it so every keypress evaluates the code
- [ ] host 

# Implementation
It does not use eval, while ive heard its "evil" i dont think it would be in this circumstance because the input is so highly processed, but i built my own postfix interpreter because i thought it would be a fun challenge (turns out to be slightly faster too :) ).

It uses lexical analysis to detect the tokens, followed by tokenization to format those tokens to be more useful. I then generate an AST from this by using the shunting yard algorithm. A list of all the variables gets turned into a list of all the combinations of values these variables can take (1 variable can take the value of T(1) or F(0), 2 can take the values TT, TF, FT, FF). The AST and combination list are used to interpret the results for each combination of values.

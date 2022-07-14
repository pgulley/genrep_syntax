README.md

It's a syntax game.
Alissa has written out an interesting set of rules, which resemble a generative lexicon. 
So FIRST I am going to impliment this idea in raw js. 

Essentially, we are 'growing' a syntax tree which describes a sequence of chords. 
So we need to get some virtual instruments working in the browser with midi.
Then we need to impliment this syntax tree thing- should be pretty simple IMO

Alissa has the actual grammar written out in a spreadsheet that I will import. 

The grammar itself describes motion in chord-space. There are three rules, each of which offers two choices for a child node. 

They're always of the form A -> AB or A-> BA

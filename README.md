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


====================

Ability to Demo the chord before you choose it- 
	and / or hear a single branch in isolation
	Different instrument for demo 

Option to edit previous levels / chop off leaves / mute branches

In general: The UI requirements need to be thought out more fully- what affordances does each node / leaf need, and how do we pack them all in
in a user friendly way?

Modal "Choice" Menu

Reactivity: Light Up a chord while it plays

Tree should look like a tree swaying/growing/glowing/etc

Art that doesn't look like code art- some whimsy and texture would be nice, ultimately. 

Line down the centre of the root branch to indicate 'balance'

An OG feature still missing: Re-order the branches

Paige: Measures of 'balanced-ness' or of 'orderliness' ?



DONE:
	Fixed Rule, now works as intended
	Grow Random Tree
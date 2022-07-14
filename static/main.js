MIDIREADY = false

MIDI.loadPlugin({
	soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
    instrument: "drawbar_organ", // or the instrument code 1 (aka the default)
    onsuccess: function() { 
    		var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDIREADY = true	
			MIDI.programChange(0,16,0)
			MIDI.setVolume(0, 127);
			//MIDI.noteOn(0, note, velocity, delay);
			//MIDI.noteOff(0, note, delay + 5.75);
			console.log("you should have heard something by now")
			seq = RandomTree(7).getLeaves()
			console.log(seq)
			seq = seq.split(", ")
			playSequence(seq, 2)
		}
    	
});


function playChord(chord, start, duration){
	chord_word = chord_spellings[chord]
	midichord = chord_word.map(function(c){return MIDI.keyToNote[c]})
	MIDI.chordOn(0, midichord, 127, start)
	MIDI.chordOff(0, midichord, start+duration)
}

function playSequence(seq, duration){
	for(i in seq){
		c = seq[i]

		playChord(c, duration*i, duration)
	}

}


chord_rules = {
	"C": {"c": ["F", "G"], "m": ["Am", "Em"], "s": ["Bdim", "Dm"]}, 
	"Dm": {"c": ["Am", "G"], "m": ["Bdim", "F"], "s": ["Em", "C"]}, 
	"Em": {"c": ["Bdim", "Am"], "m": ["C", "G"], "s": ["F", "Dm"]}, 
	"F": {"c": ["C", "Bdim"], "m": ["Am", "Dm"], "s": ["G", "Em"]}, 
	"G": {"c": ["C", "Dm"], "m": ["Bdim", "Em"], "s": ["Am", "F"]}, 
	"Am": {"c": ["Em", "Dm"], "m": ["F", "C"], "s": ["G", "Bdim"]}, 
	"Bdim": {"c": ["Em", "F"], "m": ["Dm", "G"], "s": ["C", "Am"]}
}

chord_spellings = {
	"C":['C4','E4','G4'],
	"Dm":['D4','F4','A4'],
	"Em":['E4','G4','B4'],
	"F":['F4','A4','C4'],
	"G":['G4','B4','D4'],
	"Am":['A4','C4','E4'],
	"Bdim":['B4','D4','F4']
}


var nodeActions = {
	///This is just to demo how growing the tree functions- ultimately these choices are user driven
	getRandomChildren: function(){
		if(this.children == null){
			options = chord_rules[this.chord][this.rule]
			choice = options[Math.floor(Math.random()*2)]
			//Ok so the existing chord always goes to the side it's already on
			if(this.side == "R" || this.side == "root"){
				this.children = {'L':createNode(choice, "L", this.rule), 'R':createNode(this.chord, "R", this.rule)}
			}
			else{
				this.children = {'L':createNode(this.chord, "L", this.rule), 'R':createNode(choice, "R", this.rule)}
			}
		}
	},

	//just navigate the tree and get the 'leaf' sequence
	getLeaves: function(){
		if(this.children == null){
			return this.chord
		}
		else{
			return `${this.children["L"].getLeaves()}, ${this.children["R"].getLeaves()}`
		}
	},

	//grow a balanced tree of a given depth 
	growTree: function(depth){
		if(depth > 0){
			this.getRandomChildren()
			this.children["L"].growTree(depth-1)
			this.children["R"].growTree(depth-1)
		}
	}
}

//create a node- root node has one unique behavior otherwise we just make a random function choice
function createNode(chord, side, exclude_rule){
	if(side == "root"){
		rule = "c"
	}
	else{
		rule_choices = ["c", "m", "s"]
		if(exclude_rule){

			//Little machine to remove the parent rule from the options for a child rule
			//hypothetically reducing the likelihood of repeating things
			rule_choices.splice(rule_choices.indexOf(exclude_rule),1)
		}

		var rule = rule_choices[Math.floor(Math.random()*rule_choices.length)];
	}

	let node = Object.create(nodeActions)
	node.chord = chord
	node.rule = rule
	node.side = side
	node.children = null	
	return node
}



//get a random balanced tree of a given depth
function RandomTree(depth){
	tree = createNode("C", "root")
	tree.growTree(depth)
	return tree
}


//seq1 = RandomTree(3).getLeaves()
//seq2 = RandomTree(4).getLeaves()
//seq3 = RandomTree(7).getLeaves()

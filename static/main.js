const { createApp } = Vue

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
			//seq = RandomTree(3).getLeaves()

			//seq = seq.split(", ")
			//playSequence(seq, 2)
		}
    	
});


lineOptions = {
	startPlug:"behind",
	endPlug:"behind",
	color:"green",
	path:"straight",
	size:2,
	startSocket:'bottom',
	endSocket:'top'
}


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

// {root:{function:[option1,option2], ...} ...}
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

lines = []

var nodeActions = {
	///This is just to demo how growing the tree functions- ultimately these choices are user driven
	getRandomChildren: function(){
		if(this.children == null){
			options = chord_rules[this.chord][this.rule]
			choice = options[Math.floor(Math.random()*2)]

			this.addChild(choice)
		}
	},

	//just navigate the tree and get the 'leaf' sequence
	getLeaves: function(){
		if(this.muted){
			return "mute"
		}
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
	},
	addChild: function(choice){
		
		if(this.children == null){
			
			if(this.limb == "root"){
				this.children = {
					'L':createNode(choice, "L", this.rule, 'L', this.depth+1, this.id+'L'), 
					'R':createNode(this.chord, "R", this.rule, 'R', this.depth+1, this.id+'R')}
			}
			else if(this.limb == "R"){
				this.children = {
					'L':createNode(choice, "L", this.rule, this.limb, this.depth+1, this.id+'L'), 
					'R':createNode(this.chord, "R", this.rule, this.limb, this.depth+1, this.id+'R')}
			}
			else{
				this.children = {
					'L':createNode(this.chord, "L", this.rule, this.limb, this.depth+1, this.id+'L'),
					'R':createNode(choice, "R", this.rule, this.limb, this.depth+1, this.id+'R')}
			}

		}

	},
	isLeaf:function(){
		return this.children == null
	},
	toggleMuted:function(){
		this.propogateMute(!this.muted)
	},
	propogateMute:function(isMuted){
		this.muted = isMuted
		if(!this.isLeaf()){
			this.children.L.propogateMute(isMuted)
			this.children.R.propogateMute(isMuted)
		}
	},
	getSelected: function(){
		if(this.selected){
			return this
		}
		else if (this.children == null){
			return null
		}
		else{
			l = this.children.L.getSelected()
			r = this.children.R.getSelected()
			
			if(l!=null){
				return l
			}
			else if(r!=null){
				return r
			}
			else{
				return null
			}
		}
	},
	deselectChildren: function(){
		this.selected = false
		if(this.children != null){
			this.children.L.deselectChildren()
			this.children.R.deselectChildren()
		}
	},
	drawBranch(){
		if(!this.isLeaf()){
			this.leftLine = new LeaderLine(
				document.getElementById(this.id),
				document.getElementById(this.id+"L"),
				lineOptions)

			this.rightLine = new LeaderLine(
				document.getElementById(this.id), 
				document.getElementById(this.id+"R"),
				lineOptions)
			this.children.L.drawBranch()
			this.children.R.drawBranch()
		}
	},
	eraseBranches(){
		if(!this.isLeaf()){
			this.leftLine ? this.leftLine.remove():null
			this.rightLine ? this.rightLine.remove():null
			this.children.L.eraseBranches()
			this.children.R.eraseBranches()
		}
	}
}

//create a node- root node has one unique behavior otherwise we just make a random function choice
function createNode(chord, side, exclude_rule, limb, depth, id){
	if(limb==null){
		limb = "root"
	}
	if(depth == null){
		depth = 0
	}
	if(side == "root"){
		rule = "c"
	}
	if(id == null){
		id = "R"
	}
	else{
		rule_choices = ["c", "m", "s"]
		if(exclude_rule){
			//Little machine to remove the parent rule from the options for a child rule
			//hypothetically reducing the likelihood of repeating chords
			rule_choices.splice(rule_choices.indexOf(exclude_rule),1)
		}

		var rule = rule_choices[Math.floor(Math.random()*rule_choices.length)];
	}

	let node = Object.create(nodeActions)
	node.id = id
	node.depth = depth
	node.limb = limb
	node.chord = chord
	node.rule = rule
	node.side = side
	node.options = chord_rules[chord][rule]
	node.children = null
	node.selected = false
	node.muted = false
	node.leftLine = null
	node.rightLine = null
	return node
}

//get a random balanced tree of a given depth
function RandomTree(depth){
	tree = createNode("C", "root")
	tree.growTree(depth)
	return tree
}

//above this it just works ya

createApp({
	template:`
		<div class="main">
			<button @click="playSeq()"> Play Sequence</button> 
			<button @click="resetTree()"> Reset Tree </button>
			<button @click="randomTree()"> Grow Random Tree </button>
			
			<select v-model="depth">
				<option disabled value="">of Depth</option>
    			<option>1</option>
			    <option>2</option>
    			<option>3</option>
    			<option>4</option>

			</select>
	
		<div class="tree_root node"> 

			<Node :node="root_node"  @child-selected="childSelected($event)" @tree-change="treeChange()"/>
			
		</div>
		<div class="bottomBar">
			<div class="modalMenu">
				<div v-if="selected != null">
					Node:
					{{this.selected.chord}}
					<button @click.stop="selected.toggleMuted()"> Toggle Mute Branch </button> 
					<div v-if='selected.isLeaf()'>
						<div class="options"> 
							Add chord to {{selected.limb=="L"?'right':'left'}} side
							<button class="child_opt" @click.stop="selected.addChild(selected.options[0]);" >
								{{selected.options[0]}}
							</button>
							<button class="child_opt" @click.stop="selected.addChild(selected.options[1]);" >
								{{selected.options[1]}}
							</button>
						</div>
					</div>
					<div v-if="!selected.isLeaf()">
						placeholder
					</div>
				
				</div>
			</div>	
		</div>
		</div>
	`,
    data() {
      return {
        root_node:RandomTree(0),
        depth:0,
        selected:null
    	}
	},
	methods:{
		playSeq(){
			//get the sequence of unmuted leaves
			seq = this.root_node.getLeaves()
			seq = seq.split(", ")
			seq = seq.filter(function(i){return i!="mute"})
			playSequence(seq, 2)
		},
		resetTree(){
			//reset to a single node tree
			this.root_node.eraseBranches()
			this.root_node=RandomTree(0)
			this.selected=null
		},
		randomTree(){
			//generate a random tree of a given depth
			this.root_node.eraseBranches()
			this.root_node=RandomTree(this.depth)
		},
		childSelected(child){
			//the top level of the selection 'bubbling' toggle
			this.selected=child
		},
		drawTree(){
			this.root_node.eraseBranches()

			this.root_node.drawBranch()

		},
		treeChange(){
			this.drawTree()
		}
	}
}).component("Node",{
  	props:['node'],
  	template:`
  		<div class="node" :class="{ isLeaf: isLeaf(), 
  									isSelected: this.node.selected,
  									isMuted:this.node.muted }" @click.stop="toggleSelected()"> 

  			<div class="chordName" :id="this.node.id"> {{node.chord}} </div>

			<div v-if='isLeaf()' class="LEAFoptions"> 
				<button class="child_opt" @click.stop="spawnChildren(0)" >
					{{node.options[0]}}
				</button>
				<button class="child_opt" @click.stop="spawnChildren(1)" >
					{{node.options[1]}}
				</button>
			</div>

			<div v-else> 
				<Node :node="leftChild()" @child-selected="childSelected(0, $event)" @tree-change="treeChange($event)"/>
				<Node :node="rightChild()" @child-selected="childSelected(1, $event)" @tree-change="treeChange($event)"/>
			</div>
		</div>`,
  	mounted:function(){
  		this.$emit("tree-change", null)
  	},
  	methods: {
		isLeaf:function(){
			return this.node.children == null
		},
		leftChild:function(){
			return this.node.children.L
		},
		rightChild:function(){
			return this.node.children.R
		},
		spawnChildren:function(option){
			this.node.addChild(this.node.options[option])
			this.$emit("tree-change")
			console.log('tree change?')
		},
		toggleSelected:function(){
			this.node.selected = !this.node.selected

			this.$emit("child-selected", this.node.selected?this.node:null)

			if(! this.isLeaf()){
				this.rightChild().deselectChildren()
				this.leftChild().deselectChildren()
			}
			
		},
		childSelected:function(side, child){
			this.$emit("child-selected", child)
			this.node.selected = false
			if(side==0){
				this.rightChild().deselectChildren()
			}
			else{
				this.leftChild().deselectChildren()
			}
		},
		treeChange:function(){
			//this is just a bubbler
			this.$emit("tree-change")
		}

	}
}).mount('#chordtree')




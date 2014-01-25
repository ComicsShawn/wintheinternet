/* ********************
FIGHT
***********************/
function startBattle(e,mdata){
	e.preventDefault();
	b.append("<div id='wti_battle'></div>");
	var spd = 4000;
	if(debug) spd = 1000;
	
	console.log('BATTLE START');
	console.log(mdata);
	

	//let's make a battle system!
	//hooray!
	var bSystem;

	var wb = $('#wti_battle');
	var h = $(window).height();
	$.get(chrome.extension.getURL("com/battleArena.html"), function(data){
		//Pull down the battle screen, then load the data from the html
		wb.css('top','-'+h+'px').css('display','block')
		.animate({ top: "0" },spd, 
			function(){ 
				//Hide all the goodies on the page
				hideAll();
				//Load Arena
				wb.html(data);
				//Add Monster
				$('#enemy').attr("src",chrome.extension.getURL("img/monsters/"+mdata['img']));
				$('#enemyName').html(mdata['name']);

				//setup battle system
				bSystem = new BattleSystem(mdata, $("#msg-area"));
				$("#btnAttack").click(function() { bSystem.doAction("attack") });
			});
	});
	console.log("Enemy Player Loaded.");
}

function BattleSystem(mData, mArea) {

	//dis moster data
	//the m is for monster
	this.monsterData = mData;
	this.messageArea = mArea;

	this.extraMonsterData = {
		guarding: false
	};

	this.extraPlayerData = {
		guarding: false
	}; // status stuff

	//utility function to both add a message and scroll the log down
	this.messageArea.postBattleMethod = function(message) {
		this.append(message);
		this.scrollTop( this.prop('scrollHeight') )
	}

	//turn swapping
	this.curTurn = "player";

	//stupid fix
	var me = this;

	this.playerWins = function () {
		me.messageArea.postBattleMethod("Well dang, you showed " + me.monsterData.name +  " who's the boss");
	}

	function monsterWins(messageArea) {
		me.messageArea.postBattleMethod("You let that " + me.monsterData.name + " beat you up!");
	}

	//checks the battle state and stuff
	this.checkState = function() {
		if(me.monsterData.hp <= 0) {
			me.playerWins();
			return;
		}

		if( CharHP <= 0 ) {
			me.monsterWins();
			return;
		}

		if(me.curTurn == "monster") {
			me.monsterTurn();
		}
	}

	//Well, the monster needs to be able to do some things too, you kno
	this.monsterTurn = function() {
		var selectedChoice = Math.random();
		
		if(selectedChoice < .5) {
			me.mAttack();
		} else {
			me.mDefend();
		}

		me.curTurn = "player";
	}

	this.mAttack = function() {
		var diff = me.monsterData.atk - $("#characterDEF").html();
		var newHP = CharHP() - diff;
		CharHP(newHP);
		me.messageArea.postBattleMethod("<div>"+ me.monsterData.name + " hits for a rad " + diff + " damage!</div>");

		
	}

	this.mDefend = function() {
		me.extraMonsterData.guarding = true;
		me.messageArea.postBattleMethod("<div>"+ me.monsterData.name + " curls up into a little ball.</div>");

	}

	/*
		Dem dere actions
	*/

	//this acts as a router to other functions, so we can do any stuff around them as well..
	// like cleanup and set current turn
	this.doAction = function(action) {

		if(action=="attack") {
			me.attack();
		}

		me.curTurn = "monster";
		me.checkState();
	}

	this.attack = function() {
		var diff = $("#characterATK").html() - me.monsterData.def;
		me.monsterData.hp -= diff;

		console.log(me.messageArea);
		me.messageArea.postBattleMethod("<div>You attack for an awkward " + diff + " damage!</div>");
	}

	this.defend = function() {

	}


}


function CharHP(desiredHP) {
	if(!desiredHP) {
		//getter
		return $("#characterHealth > .progress > .progress-bar").attr("aria-valuenow");
	} else {
		//setter
		console.log(desiredHP);
		var currentHP = (desiredHP/$("#cHPM").html())*100;
		$("#characterHealth > .progress > .progress-bar").attr("aria-valuenow",desiredHP).css("width", currentHP+"%")
		$("#cHP").html(desiredHP);
	}
}
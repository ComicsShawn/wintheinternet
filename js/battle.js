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
				bSystem = new BattleSystem(mdata, $("#msg-area"), wb);
				$("#btnAttack").click(function() { bSystem.doAction("attack") });
				$("#btnDefend").click(function() { bSystem.doAction("defend") });
				$("#btnBattleRun").click(function() { bSystem.doAction("run") });
				$("#btnBattlePray").click(function() { bSystem.doAction("pray") });
			});
	});
	console.log("Enemy Player Loaded.");
}

function BuildBattleOut() {
	$('#wti_battle').animate(
				{ top: - $(window).height()+"px" },
				1000, 
				function(){
					this.remove();
				}
	);
}

function BattleSystem(mData, mArea, bDiv) {

	//dis moster data
	//the m is for monster
	this.monsterData = mData;
	this.messageArea = mArea;
	this.battleDiv = bDiv;

	this.battleOver = false;

	this.extraMonsterData = {
		guard: 1
	};

	this.extraPlayerData = {
		guard: 1
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
		me.messageArea.postBattleMethod("<div>Well dang, you showed " + me.monsterData.name +  " who's the boss</div>");
		me.messageArea.postBattleMethod("<div>You gained <strong>" + me.monsterData.experience + "</strong> experience!</div>")
		
		AddEXP(me.monsterData.experience, me.messageArea)

		me.messageArea.postBattleMethod("<div><button type='button' class='btn btn-success btn-sm' id='btnBattleExit'>Leave battle forever</button></div>")
		
		$("#btnBattleExit").click( function() {
			
		});
	}

	function monsterWins(messageArea) {
		me.messageArea.postBattleMethod("You let that " + me.monsterData.name + " beat you up!");
	}

	//checks the battle state and stuff
	this.checkState = function() {
		if(me.monsterData.hp <= 0) {
			me.playerWins();
			me.battleOver = true;
			return;
		}

		if( CharHP <= 0 ) {
			me.monsterWins();
			me.battleOver = true;
			return;
		}

		if(me.curTurn == "monster") {
			me.monsterTurn();
		}
	}

	//Well, the monster needs to be able to do some things too, you kno
	this.monsterTurn = function() {
		var selectedChoice = Math.random();

		//guard reset
		this.extraMonsterData.guard = 1;
		
		if(selectedChoice < .5) {
			me.mAttack();
		} else {
			me.mDefend();
		}

		me.curTurn = "player";
	}

	this.mAttack = function() {
		var diff = me.monsterData.atk - Math.floor( $("#cDEF").html() * me.extraPlayerData.guard );
		if(diff < 0) diff = 0;
		var newHP = CharHP() - diff;
		CharHP(newHP);
		me.messageArea.postBattleMethod("<div>"+ me.monsterData.name + " hits for a rad " + diff + " damage!</div>");

		
	}

	this.mDefend = function() {
		me.extraMonsterData.guard = 1.5;
		me.messageArea.postBattleMethod("<div>"+ me.monsterData.name + " curls up into a little ball.</div>");

	}

	/*
		Dem dere actions
	*/

	//this acts as a router to other functions, so we can do any stuff around them as well..
	// like cleanup and set current turn
	this.doAction = function(action) {

		if( !me.battleOver ) {
			//guard reset
			me.extraPlayerData.guard = 1;

			if(action=="attack") {
				me.attack();
			} else if (action == "defend") {
				me.defend();
			} else if(action == "run") {
				if( me.run() ) return;
			}

			me.curTurn = "monster";
			me.checkState();
		}
	}

	this.run = function() {
		if(Math.random() < .95) {
			me.battleOver = true;
			BuildBattleOut();
			return true;
		} else {
			me.messageArea.postBattleMethod("<div>You started to run away, but started hiccuping in fear, bringing you to a halt");
			return false;
		}
	}

	this.attack = function() {
		
		console.log( $("#cATK").html(), me.monsterData.def)
		var diff = $("#cATK").html() - Math.floor( me.monsterData.def * me.extraMonsterData.guard );
		
		if(diff < 0) diff = 0;
		me.monsterData.hp -= diff;

		console.log(me.messageArea);
		me.messageArea.postBattleMethod("<div>You attack for an awkward " + diff + " damage!</div>");
	}

	this.defend = function() {
		this.extraPlayerData.guard = 1.5;
		me.messageArea.postBattleMethod("<div>You cower in a handy corner");
	}


}

function AddEXP(amt, messageArea) {

	var curEXP = parseInt( $("#cXP").html() );

	curEXP += amt;

	var xpPercentage = (curEXP/$("#cXPM").html())*100;
	$("#cXPB").attr("aria-valuenow",curEXP).css("width", xpPercentage+"%");

	if(curEXP > $("#cXPM").html()) {
		//levelled up
		var overflow = curEXP - $("#cXPM").html();
		curEXP = overflow;
		$("#characterLevel").html( parseInt( $("#characterLevel").html() ) + 1 );

		if(messageArea) {
			messageArea.postBattleMethod("<div>Aw man, you leveled up! Good work.</div>");
		}
	}
	$("#cXP").html(curEXP);
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
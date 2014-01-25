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

	//first we need the player datar
	var playerData;
	$.getJSON(chrome.extension.getURL('data/player.json'),function(data){
		console.log(data);
		playerData = data;
	})

	//then we make a battle system with the player UND moster data
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

function playerWins() {

}

function monsterWins() {

}

function BattleSystem(mData, mArea) {

	//dis moster data
	//the m is for monster
	this.monsterData = mData;
	this.messageArea = mArea;

	this.curTurn = "player";

	//stupid fix
	var me = this;

	//checks the battle state and stuff
	this.checkState = function() {
		if(me.monsterData.hp <= 0) {
			playerWins();
		}

		if(me.curState = "monster") {
			me.monsterTurn();
		}
	}

	//Well, the monster needs to be able to do some things too, you kno
	this.monsterTurn = function() {

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

		me.curState = "monster";
		me.checkState();
	}

	this.attack = function() {
		var diff = $("#characterATK").html() - me.monsterData.def;
		me.monsterData.hp -= diff;

		console.log(me.messageArea);
		me.messageArea.append("<div>You attack for an awkward " + diff + " damage!</div>");
	}

	this.defend = function() {

	}


}
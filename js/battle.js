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
	var bSystem = new BattleSystem(playerData, mdata);


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

				$("#btnAttack").click(bSystem.attack);
			});
	});
	console.log("Enemy Player Loaded.");


}

function BattleSystem(pData, mData) {

	//dis moster data
	//the m is for monster
	this.monsterData = mData;

	//player data ref
	this.playerData = pData;

	console.log("Will it blend");

	console.log(this.playerData, this.monsterData)

	/*
		Dem dere actions
	*/
	this.attack = function() {
		var diff = this.playerData.atk - this.monsterData.def;
		this.monsterData.hp -= diff;
		console.log(this.monsterData.hp)
	}

	this.defend = function() {

	}
}
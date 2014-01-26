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
	
	/*if(mdata == "grumpy"){
		mdata = {
        "name": "Grumpy Cat",
        "id": "grumpy",
        "img": "grumpy-cat/grumpy_cat_stand.png",
        "hp": 55,
        "mp": 15,
        "atk": 12,
        "def": 4,
        "spd": 40,
        "mag": 6,
        "experience": 100,
        "specials": [
            {
                "name": "Evade",
                "boost": "atk",
                "amount": "50%"
            }
        ]
        };
	}
*/
	//let's make a battle system!
	//hooray!
	var bSystem, pData;

	var wb = $('#wti_battle');
	var h = $(window).height();
	
	$.get(chrome.extension.getURL("com/battleArena.html"), function(data){
		//Pull down the battle screen, then load the data from the html
		wb.css('top','-'+h+'px').css('display','block')
		.animate({ top: "0" },spd, 
			function(){ 
				//Hide all the goodies on the page
				hideAll();
				//Queue the tunes
				if(mdata['name']=="Grumpy Cat")
					playSound('BG','finalBoss');
				else
					playSound('BG','battleTheme');
				//Load Arena
				wb.html(data);
				//Add Monster
				$('#enemy').attr("src",chrome.extension.getURL("img/monsters/"+mdata['img']));
				$('#enemy').attr("rel",mdata['name']);
				$('#enemyName').html(mdata['name']);


				//setup UI
				//hide specials menu
				$("#specialBattleMenu").hide();
				$("#magicBattleMenu").hide();

				$.ajax({
					url: chrome.extension.getURL('data/player.json'),
					dataType: 'json',
					contentType: "application/json; charset=utf-8",
					success: function (data) {
						pData = data;
						console.log(pData);
						//adding the specials into the speeecial div
						var specialDiv = $("#battleSpecials");
						specialDiv.append("<li class='special' data-id='-1'><a href='#'>Back</a></li>");
						for( var i =0; i < pData.specials.length; i++) {
							console.log(  pData.specials[i].name );
							specialDiv.append("<li class='special' data-toggle='tooltip' title data-original-title='"+pData.specials[i].descrip+"' data-id='"+i+"'><a href='#'>"+ pData.specials[i].name +"</a></li>");
						}

						$(".special").click(function() {
							if( $(this).data("id") == -1 ) ReturnMainMenu();
							else bSystem.doAction("special", pData.specials[ $(this).data("id") ] );
						}).tooltip();

						//put the magics into the magic div
						var magicDiv = $("#battleMagic");
						magicDiv.append("<li class='magic' data-id='-1'><a href='#'>Back</a></li>");
						for( var i =0; i < pData.magic.length; i++) {
							console.log(  pData.magic[i].name );
							magicDiv.append("<li class='magic' data-toggle='tooltip' title data-original-title='"+pData.magic[i].descrip+"' data-id='"+i+"'><a href='#'>"+ pData.magic[i].name +"</a></li>");
						}

						$(".magic").click(function() {
							if( $(this).data("id") == -1 ) ReturnMainMenu();
							else {
								if(CharMP() >= pData.magic[ $(this).data("id") ].cost) {
									bSystem.doAction("magic", pData.magic[ $(this).data("id") ] )
								}
							};
						}).tooltip();
					}
				});

				//setup battle system
				bSystem = new BattleSystem(mdata, $("#msg-area"), wb);
				$("#btnAttack").click(function() { bSystem.doAction("attack") });
				$("#btnDefend").click(function() { bSystem.doAction("defend") });
				$("#btnBattleRun").click(function() { bSystem.doAction("run") });
				$("#btnBattlePray").click(function() { bSystem.doAction("pray") });

				$("#btnBattleSpecial").click(function() { 
					$("#mainBattleMenu").hide();
					$("#specialBattleMenu").show();
				})

				$("#btnBattleMagic").click(function() { 
					$("#mainBattleMenu").hide();
					$("#magicBattleMenu").show();
				});
				
			}
		);

	});

	console.log("Enemy Player Loaded.");
}

function ReturnMainMenu() {
	$("#mainBattleMenu").show();
	$("#specialBattleMenu").hide();
	$("#magicBattleMenu").hide();
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

function FlashBG(col) {

	col = col || "rgba(255,255,255, 1)";

	$('#wti_battle').css("background-color", col)
	$('#wti_battle').animate({
      backgroundColor: 'rgba(0,0,0,0.7)'
    }, 2100);
}

function BattleSystem(mData, mArea, bDiv) {

	//dis moster data
	//the m is for monster
	this.monsterData = mData;
	this.messageArea = mArea;
	this.battleDiv = bDiv;

	this.battleOver = false;

	this.extraMonsterData = {
		guard: 1,
		statChanges: {
			atk: 0, def: 0
		}
	};

	this.extraPlayerData = {
		guard: 1,
		statChanges: {
			atk: 0, def: 0
		}
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
		playSound("BG","victory");
		me.messageArea.postBattleMethod("<div>Well dang, you showed " + me.monsterData.name +  " who's the boss</div>");
		me.messageArea.postBattleMethod("<div>You gained <strong>" + me.monsterData.experience + "</strong> experience!</div>");
	
		
		if($('#enemyName').html()=="2"){
			
			setTimeout(function(){
				me.messageArea.postBattleMethod("<div>HRRRRRRRGH.  Well.... I underestimated you.  I have bad news for you, though....</div>")
			},1800);
			setTimeout(function(){
				me.messageArea.postBattleMethod("<div>It seems as though your potion.... is in another castle....</div>")
			},3800);
			setTimeout(function(){
				me.messageArea.postBattleMethod("<div>HYAHH HA HA HA HA..... urrrrk.</div>")
			},4800);
			/*setTimeout(
				function(){ 
				}),
				}),
				1000);
			setTimeout(
				function(){ me.messageArea.postBattleMethod("<div>It seems as though your potion.... is in another castle....</div>");}),
				1000);;
			setTimeout(
				function(){ me.messageArea.postBattleMethod("<div>HYAHH HA HA HA HA..... urrrrk.</div>");}),
				1000);*/
		}
		
		AddEXP(me.monsterData.experience, me.messageArea)

		me.messageArea.postBattleMethod("<div><button type='button' class='btn btn-success btn-sm' id='btnBattleExit'>Leave battle forever</button></div>")
		
		$('#enemy').animate(
				{ opacity: 0 },
				1400, 
				function(){
				//	this.remove();
				}
		);

		$("#btnBattleExit").click( function() {
			saveStats();
			BuildBattleOut();
			stopSound('BG');
			if($('#enemy').attr("rel")=="Dragon")
				lastBoss();
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
		
		if(selectedChoice > .2) {
			me.mAttack();
		} else {
			me.mDefend();
		}

		me.curTurn = "player";
	}

	this.mAttack = function() {
		var fear = Math.random();
		if($("#enemy").attr("rel")=="Dragon")
			playSound("FX","dragon");
		if($("#enemy").attr("rel")=="Grumpy Cat")
			if(fear<.5){ playSound("FX","meow"); }else {playSound("FX","lemeow"); }
		
		$("#action-area").addClass('rumble');
		FlashBG();
		move('action-area',-200, 200, -200,200);
		var fullAttack = me.monsterData.atk + Math.floor( Math.random() * (me.monsterData.atk / 3));
		var fullDefense = Math.floor( $("#cDEF").html() * me.extraPlayerData.guard ) + me.extraPlayerData.statChanges.def;
		var diff = fullAttack - fullDefense;
		if(diff < 0) diff = 0;
		var newHP = CharHP() - diff;
		CharHP(newHP);
		me.messageArea.postBattleMethod("<div>"+ me.monsterData.name + " hits for a rad " + diff + " damage!</div>");
		
		if($("#enemy").attr("rel")=="Dragon" && fear < .3){
			me.messageArea.postBattleMethod("<div>The Dragon's fierce power has left you shaking in fear!</div>")
			setTimeout(function(){ $("#action-area").removeClass('rumble')},8500);
		}else{
			setTimeout(function(){ $("#action-area").removeClass('rumble')},500);
		}
	}

	this.mDefend = function() {
		me.extraMonsterData.guard = 1.5;
		me.messageArea.postBattleMethod("<div>"+ me.monsterData.name + " curls up into a little ball.</div>");
	}

	this.togglePlayerScreen = function(){
		$('.battleScreen').toggleClass('wti-hide');
	}
	
	/*
		Dem dere actions
	*/

	//this acts as a router to other functions, so we can do any stuff around them as well..
	// like cleanup and set current turn
	this.doAction = function(action, args) {
		//Bad place.  Got in a rush.
		if($('#enemyName').html()=="1"){
			me.messageArea.postBattleMethod("<div>You call those muscles?  Please.  You're embarrassing yourself.  You can't beat me.</div>");
			$('#enemyName').html("2");
		}else if($('#enemyName').html()=="Dragon"){
			me.messageArea.postBattleMethod("<div>Why did you come here?  Was it to gain immortality through the secret Internet potion?  No matter.  You will be done soon.</div>");
			$('#enemyName').html("1");
		} 
		me.togglePlayerScreen();
		if( !me.battleOver ) {
			//guard reset
			me.extraPlayerData.guard = 1;

			console.log(args)

			if(action=="attack") {
				me.attack();
			} else if (action == "defend") {
				me.defend();
			} else if(action == "run") {
				if( me.run() ) return;
			} else if(action =="pray") {
				me.messageArea.postBattleMethod("<div>You pray, and nothing happens. What did you think this was, Earthbound?</div>");
			} else if(action == "special") {
				me.processSpecial(args);
			} else if(action == "magic") {
				me.processMagic(args);
			}
			
			setTimeout(function(){
				me.curTurn = "monster";
				me.checkState();
				me.togglePlayerScreen();
			},2800);
		}
	}

	this.run = function() {
		if(Math.random() < .95) {
			me.battleOver = true;
			playSound("BG","victory");
			BuildBattleOut("BG");
			return true;
		} else {
			me.messageArea.postBattleMethod("<div>You started to run away, but started hiccuping in fear, bringing you to a halt</div>");
			return false;
		}
	}

	this.attack = function() {
		//Should load in sword from Player data, ideally
		playSound("FX","sword");
		//Kluge.  So sue me.
		$("#enemy").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		console.log( $("#cATK").html(), me.monsterData.def)
		var pAtck = parseInt( $("#cATK").html() )
		var fullAttack = pAtck + Math.floor( Math.random() * (pAtck /3)) + parseInt( me.extraPlayerData.statChanges.atk );
		var fullDefense =  Math.floor( me.monsterData.def * me.extraMonsterData.guard );
		var diff = fullAttack - fullDefense;
		
		if(diff < 0) diff = 0;
		me.monsterData.hp -= diff;

		console.log(me.messageArea);
		me.messageArea.postBattleMethod("<div>You attack for an awkward " + diff + " damage!</div>");
	}

	this.defend = function() {
		this.extraPlayerData.guard = 1.5;
		me.messageArea.postBattleMethod("<div>You cower in a handy corner");
	}

	this.processSpecial = function(args) {
		console.log(args);

		for(var i = 0; i < args.effects.length; i++) {
			var curEffect = args.effects[i];

			if(curEffect.type == "statchange") {
				//lazy make
				if(!me.extraPlayerData.statChanges[curEffect.value]) me.extraPlayerData.statChanges[curEffect.value] = 0;
				me.extraPlayerData.statChanges[curEffect.value] += curEffect.amount;
			}			
		}

		var message = args.activationMessage.replace("%m", me.monsterData.name);
		me.messageArea.postBattleMethod("<div>"+message+"</div>")

		ReturnMainMenu();
	}

	this.processMagic = function(args) {

		//sub MP amount
		var mugic = parseInt( CharMP() );
		mugic -= args.cost;
		console.log(mugic);
		CharMP( mugic );

		var message = args.activationMessage.replace("%m", me.monsterData.name);

		for(var i = 0; i < args.effects.length; i++) {
			var curEffect = args.effects[i];

			if(curEffect.type == "heal") {
				//lazy make
				var pHP = parseInt( CharHP() );
				pHP += parseInt( curEffect.amount );
				CharHP(pHP);
			} else if (curEffect.type == "attack") {
				var pAtck = parseInt( $("#cMAG").html() )
				var fullAttack = pAtck * curEffect.amount;
				var fullDefense =  Math.floor( (me.monsterData.def * me.extraMonsterData.guard) / 3 ) + Math.floor( me.monsterData.mag / 3);
				var diff = fullAttack - fullDefense;

				if(diff < 0) diff = 0;
				me.monsterData.hp -= diff;

				message = message.replace("%d", diff);
			}
		}

		
		me.messageArea.postBattleMethod("<div>"+message+"</div>")

		ReturnMainMenu();
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
	if(desiredHP === undefined) {
		//getter
		return $("#characterHealth > .progress > .progress-bar").attr("aria-valuenow");
	} else {
		//setter
		var currentHP = (desiredHP/$("#cHPM").html())*100;
		$("#characterHealth > .progress > .progress-bar").attr("aria-valuenow",desiredHP).css("width", currentHP+"%")
		$("#cHP").html(desiredHP);
	}
}

function CharMP(desiredMP) {

	if(desiredMP === undefined) {
		//getter
		return $("#characterMana > .progress > .progress-bar").attr("aria-valuenow");
	} else {
		//setter
		var currentMP = (desiredMP/$("#cMPM").html())*100;
		console.log(currentMP)
		$("#characterMana > .progress > .progress-bar").attr("aria-valuenow",desiredMP).css("width", currentMP+"%")
		$("#cMP").html(desiredMP);
	}
}

function move(id, step1, step2, step3,step4) {
    $('#'+id).animate({left: '+=' + step1, }, 1000, function() {
        $(this).animate({ top: '+=' + step2,}, 1000, function() {
        	$(this).animate({top: '+=' + step3,}, 1000, function() {
				$(this).animate({left: '-=' + step4}, 1000);
			});
        });
    });   
}
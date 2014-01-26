debug = true;
b = $('body');
var h = $(document).height();

//Scroll distance tracker data
s = '';
var lastScrollTop = 0,st,direction,startScroll=0,toHandler,endScroll=0,xpScroll=0;
var maxXP = h/1000;

/* ******************
Function to hide all the miscellaneous goodies on the screen
*********************/
function hideAll(){
	$('.m_monster').hide();
}

/* *************
FUNCTION TO GIVE XP FOR SCROLLING
****************/
function addScrollXP(s){
	adjustProgressBar('XP','+',1);
}

/* *******************
Function to load all character stats, including img, health, items, etc
*********************/
function loadStats(){
	console.log("Load player character");
	
	// First, try to load the player from the local storage
	var player = "";
	chrome.storage.sync.get('player', function(result){
        player = result['player'];
        
        // Looks like this is the first initialization. Grab from JSON file
		if(jQuery.isEmptyObject(player)){
			alert("Loaded from File");
			$.ajax({
			  url: chrome.extension.getURL('data/player.json'),
			  dataType: 'json',
			  contentType: "application/json; charset=utf-8",
			  success: function (data) {
				console.log("RETURN PLAYER DATA");
				console.log(data);
				chrome.storage.sync.set({'player':data});
				displayStats(data);
			  }, 
			  error: function (data) {
					console.log("Player Load Failed");
					console.log(msg);
				} 
			});  
		}else{
			displayStats(player);
		}
    });
}

function displayStats(player){
	// Initialize stats from Local Storage
	var pimg = player["img"];
	var currentHP = (player["hp"]/player["maxhp"])*100;
	var currentMP = (player["mp"]/player["maxmp"])*100;
	var currentXP = (player["xp"]/player["maxxp"])*100;
	var currentCB = (player["cb"]/player["maxcb"])*100;
	
	$("#characterName").html(player["name"]);
	$("#characterLevel").html(player["level"]);
	$("#characterClass").html(player["class"]);
	
	/* Hit Point Bars */
	$("#cHP").html(player["hp"]);
	$("#cHPM").html(player["maxhp"]);
	$("#characterHealth > .progress > .progress-bar").attr("aria-valuenow",player["hp"]).attr("aria-valuemax",player["maxhp"]).css("width",currentHP+"%");
	$("#cMP").html(player["mp"]);
	$("#cMPM").html(player["maxmp"]);
	$("#characterMana > .progress > .progress-bar").attr("aria-valuenow",player["mp"]).attr("aria-valuemax",player["maxmp"]).css("width",currentMP+"%");
	$("#cXP").html(player["xp"]);
	$("#cXPM").html(player["maxxp"]);
	$("#characterExperience > .progress > .progress-bar").attr("aria-valuenow",player["xp"]).attr("aria-valuemax",player["maxxp"]).css("width",currentXP+"%");
	$("#cCB").html(player["cb"]);
	$("#cCBM").html(player["maxcb"]);
	$("#characterCoinbits > .progress > .progress-bar").attr("aria-valuenow",player["CB"]).attr("aria-valuemax",player["maxCB"]).css("width",currentCB+"%");
	
	/* Character Stats */
	$("#cATK").html(player["atk"]);
	$("#cMAG").html(player["mag"]);
	$("#cDEF").html(player["def"]);
	$("#cSPD").html(player["spd"]);
	
	/* Character Equipment */
	if(player["equipment"]["ar"]["image"]==undefined) player["equipment"]["ar"]["image"] = 'none.gif';
	if(player["equipment"]["lh"]["image"]==undefined) player["equipment"]["lh"]["image"] = 'none.gif';
	if(player["equipment"]["rh"]["image"]==undefined) player["equipment"]["rh"]["image"] = 'none.gif';
	$("#characterAR > a > img").attr('src',chrome.extension.getURL("img/items/"+player["equipment"]["ar"]["image"]));
	$("#characterLH > a > img").attr('src',chrome.extension.getURL("img/items/"+player["equipment"]["lh"]["image"]));
	$("#characterRH > a > img").attr('src',chrome.extension.getURL("img/items/"+player["equipment"]["rh"]["image"]));
	
	/* Position Over Avatar */
	if(player["equipment"]["ar"]["layer"]==undefined) player["equipment"]["ar"]["layer"] = 'none.gif';
	if(player["equipment"]["lh"]["layer"]==undefined) player["equipment"]["lh"]["layer"] = 'none.gif';
	if(player["equipment"]["rh"]["layer"]==undefined) player["equipment"]["rh"]["layer"] = 'none.gif';
	$("#ARL").attr('src',chrome.extension.getURL("img/items/"+player["equipment"]["ar"]["layer"]));
	$("#LHL").attr('src',chrome.extension.getURL("img/items/"+player["equipment"]["lh"]["layer"]));
	$("#RHL").attr('src',chrome.extension.getURL("img/items/"+player["equipment"]["rh"]["layer"]));
	
	/* Character Items */
	for (var i = 0; i < player["items"].length; ++i){
		console.log("Loading Item "+i);
		console.log(player["items"][i]);
		var p = '';
		switch(i){
			case 0:
			case 4:
				p = 'right';
				break;
			case 3:
			case 7:
				p = 'left';
				break;
			default:
				p = 'top';
				break;
		}
		$("#charItem-"+i+" > button")
			.prop("disabled",false)
			.attr("id",player["items"][i]["id"])
			.html("<img player-placement='"+p+"' player-original-title='"+player["items"][i]["name"]+"<br/>"+player["items"][i]["descrip"]+"' class='img-responsive tip' src='"+chrome.extension.getURL("img/items/"+player["items"][i]["image"])+"'/>");
	}
	//Bind Item Use
	$('#characterItems .item').click(function(e){ useItem(e,$(this).attr('id'),$(this).parent('div').attr('rel')); });
	//Initialize Tooltips
	$('.tip').tooltip({html:true,container:'#wti_panel'});
	
	$("#character").attr('src',chrome.extension.getURL("img/sprites/"+pimg));
	$("#avatar > img").attr('src',chrome.extension.getURL("img/sprites/"+pimg));	

	//hide specials menu
	$("specialBattleMenu").hide();
}

function saveStats(){
	chrome.storage.sync.get('player', function(result){
        player = result['player'];
		player["xp"]=$("#cXP").html();
		player["hp"]=$("#cHP").html();
		player["mp"]=$("#cMP").html();
		player["cb"]=$("#cCB").html();
		
		chrome.storage.sync.set({'player':player},function(){ alert("Progress Saved"); });
    });
}

function destroyStats(){
	var r=confirm("This will delete the data from local storage.  You Sure?");
	if (r==true)
	  {
		chrome.storage.sync.clear();
	  }
}

/* *******************
Function to load all Monster Stats
*********************/
function loadMonster(id){
	console.log("LOAD MONSTER: "+id);
	
	//Monster ID will be generated. Must be unique
	var mid = id;
	
	 $.getJSON(chrome.extension.getURL('data/monsters.json'),function(data){
		 console.log("RETURN DATA");
		 console.log(data);
		
		var mdata = data[id][0];
		//Monster class has the monster style
		var mclass = 'm_'+mid;
		//Monster HTML
		var monster = '<div id="'+mid+'" class="m_monster '+mclass+'"><a href="#"><img src="" class="img-responsive"></a></div>';
		//Loaded x position
		var mx = '120';
		//Loaded y position
		var my = '300';
		//Monster img
		var mi = "img/monsters/"+mdata['img'];
		
		//Load the monster container
		b.append(monster);
		//Load monster image
		$('#'+mid+' > a > img').attr("src",chrome.extension.getURL(mi));
		
console.log(mdata);

		//Position monster
		var monster = $('#'+mid);
		monster.css('top',my+'px').css('left',mx+'px');
		animateMonster(monster);
		monster.bind('click',function(e){ startBattle(e,mdata); });
    });  
}

function loadQuest(name,d,p){
	console.log("Loading new quest...."+name);
	
	$.ajax({
	  url: chrome.extension.getURL('quests/'+name+'/quest.json'),
	  dataType: 'json',
	  contentType: "application/json; charset=utf-8",
	  success: function (data) {
		console.log("RETURN QUEST DATA");
		console.log(data);
		//Get the quest from this specific domain
		var quest = data[0]["steps"][d][p];
		$.get(chrome.extension.getURL("quests/"+name+"/"+quest["number"]+".html"), function(data){
			switch(quest["type"]){
				case "position":
					b.append("<div id='quest-wrap'><div>");
					$("#quest-wrap").html(data).css("position","absolute").css("top",quest["y"]).css("left",quest["x"]);
					break;
				default:
					$('#'+quest["targetID"]).html(data);
			}
			//Load an image if there is one
			if(quest["img"]!="") 
				$("#"+quest["img"]).attr("src",chrome.extension.getURL("quests/"+name+"/"+quest["imgpath"]));
			//Bind action buttons
			$('.talk').click(function(e){ openDialog(e,name,quest); });
			$('.knock').click(function(e){ $("#npc").attr("src",chrome.extension.getURL("quests/"+name+"/"+quest["npcpath"])).removeClass("wti-hide"); openDialog(e,name,quest); });
	
		});
	  }, 
	  error: function (data) {
			console.log("Quest Load Failed");
			console.log(data);
		} 
	});  
}

function openDialog(e,name,quest){
	e.preventDefault();
	b.append("<div id='dialog'></div>");
	
	$.get(chrome.extension.getURL("com/dialog.html"), function(data){
		$('#dialog').html(data);
		$.ajax({
			  url: chrome.extension.getURL("quests/"+name+"/"+quest["number"]+".dialog.json"),
			  dataType: 'json',
			  contentType: "application/json; charset=utf-8",
			  success: function (dialog) {
				console.log("RETURN QUEST DIALOG");
				console.log(dialog);
				var count = 0;
				var completeType = 0;
				var nxt = '<ul id="dialogTree" class="unstyled">';
				//Get the dialog for this quest
				for (var i = 0; i < dialog.length; ++i){
					nxt += '<li>';
					if(dialog[i]["who"]=="")
						nxt += "<em>"+dialog[i]["said"]+"</em>";
					else if(dialog[i]["option"]!=undefined){
						nxt += "<strong>"+dialog[i]["who"]+"</strong>: ";
						for (var x = 0; x < dialog[i]["option"].length; ++x){
							nxt += "<button class='btn btn-default'>"+dialog[i]["option"][x]["label"]+"</button>";
						}
					}else{
						completeType = dialog[i]["type"];
						nxt += "<strong>"+dialog[i]["who"]+"</strong>: "+dialog[i]["said"];	
						switch(completeType){
							case 'accept':
								nxt += "<br/><button id='acceptQuest' class='btn btn-success'>Accept Quest</button>" +
									"<button class='btn btn-danger'>Deny Quest</button>";
								break;
							case 'proceed':
								nxt += "<br/><button id='completeTask' class='btn btn-success'>Complete Task</button>";
								break;
							default:
								break;
						}
					}
					nxt += '</li>';
					count++;
				}
				nxt += '</ul>';
				$("#msgs").html(nxt);
				$("#dialog-next").click(function(e){
					if(count==1){
						$('#dialog').remove();
					}else{
						e.preventDefault();
						$("#dialogTree > li:first-child").animate({marginTop: '-=170px'});
					}
					count--;
					if(count==1)
						$(this).find('.fa').removeClass('fa-chevron-down').addClass('fa-times');
				});
				
				switch(completeType){
					case 'accept':
						$("#acceptQuest").click(function(e){ acceptQuest(e,name); });
						break;
					case 'proceed':
						$("#completeTask").click(function(e){ completeTask(e,name); });
						break;
					default:
						//Do nothing.  Must have been a red herring.
						break;
				}
			  }, 
			  error: function (data) {
					console.log("Player Load Failed");
					console.log(msg);
				} 
			});  
	});
}

/* Add questions to acceptance queue */
function acceptQuest(e,name){
	e.preventDefault();
	logMessage("Brave hero!  You have taken on a new quest!","success","herolog");
	chrome.storage.sync.get('quests', function(result){
        quests = result['quests'];
        // Looks like this is the first initialization. Grab from JSON file
		if(jQuery.isEmptyObject(quests)){
			$.ajax({
			  url: chrome.extension.getURL('quests/'+name+'/quest.json'),
			  dataType: 'json',
			  contentType: "application/json; charset=utf-8",
			  success: function (data) {
				chrome.storage.sync.set({'quests':data},function(){
					refreshQuestList(name);
					$("#dialog").remove();
				});
			  }, 
			  error: function (data) {
					console.log("Player Load Failed");
					console.log(msg);
				} 
			});  
		}else{
			alert("Already had the quest");
		}
	});
}

function completeTask(e,name){
	e.preventDefault();
	//Need to build a better way to access quest data while on a quest page
	logMessage("That guy was weird. At least I have a new clue.","success","herolog");
	chrome.storage.sync.get('quests', function(result){
        quests = result['quests'];
        // Looks like this is the first initialization. Grab from JSON file
		if(jQuery.isEmptyObject(quests)){
			alert("Bug.  They shouldn't be able to get here"); 
		}else{
			chrome.storage.sync.get('quests', function(result){
				quests = result['quests'];
				quests[name] = { 'nextStep':1 };
				chrome.storage.sync.set({'quests':quests},function(){
					$("#dialog").remove();
				});
			});
		}
	});
}

function loadTreasure(words){
	
}

/* Add questions to acceptance queue */
function refreshQuestList(){
	chrome.storage.sync.get('quests', function(result){
        quests = result['quests'];
        
		if(!jQuery.isEmptyObject(quests)){
			for (var i = 0; i < quests.length; ++i){
				logMessage(quests[i]["name"],"normal","questlog");
			}
		}
	});
}

function logMessage(msg,type,dest){
	$("#"+dest+" > ul").append("<li class='text-"+type+"'>"+msg+"</li>");	
}

function checkUrl(){
	var domain = window.location.hostname;
	var pathname = window.location.pathname;
	var hash = window.location.hash;
	var w = /www\./;
	domain = domain.replace(w,'');
	switch(domain){
		case 'stackoverflow.com':
			loadMonster('hornedelf');
			break;
		case 'google.com':
			if(hash=="")
				loadQuest('sickjohnny',domain,pathname);
			else{
				loadMonster('hornedelf');
				loadTreasure('pina colada');
				loadTreasure('extension');
			}
			break;
		case 'octopusjuice.com':
			loadQuest('sickjohnny',domain,pathname);
			loadMonster('hornedelf');
			break;
		default:
			break;
	}
}

function bindActions(){
	/* Bind the Actions */
	$('#wti-hop').click(function(e){
		e.preventDefault();
		$('#wti_panel').toggleClass("active");  
		$('#iconrow .fa').toggleClass("fa-chevron-left fa-chevron-right");
	});
	$('#wti-save').click(function(e){ e.preventDefault(); saveStats(); });
	$('#wti-destroy').click(function(e){ e.preventDefault(); destroyStats(); });
	$('#wti-audio').clickToggle(function() {   
			$(this).children("i").removeClass("fa-volume-down").addClass("fa-volume-up");
			stopSound("ALL");
		},
		function() {
			$(this).children("i").removeClass("fa-volume-up").addClass("fa-volume-down");
			playSound("ALL");
		}
	);
	
	/* tClouds - Cursor Bind */
	var mX = 0;
	var img;
	//^[\w,\s-]+\.[A-Za-z]{3}$
	var re = /\-[a-z]{2}\./;
	var av = $('#avatar > img');
	$(document).mousemove(function(e) {
		img = av.attr('src');
		if(img != undefined){
			if(e.pageX < mX){
				img = img.replace(re,"-lt.");
				av.attr('src',img);
			}else if(e.pageX > mX){
				img = img.replace(re,"-rt.");
				av.attr('src',img);
			}else{
				img = img.replace(re,"-fr.");
				av.attr('src',img);
			}
		}
		mX = e.pageX;
		av.offset({
			left: e.pageX,
			top: e.pageY + 20
		});
	});
	
	/* Scroll Functions */
	var dir = dist = '';
	var xpMark = Math.floor(h / 1000);
	var lastUp = 0;
	$(document).scroll(function(){
		var dir = detectScrollDirection(); //Located in utils
		if(dir=="down"){
			console.log("Going Down");
			if (startScroll==0) {
				startScroll = $(window).scrollTop();
			} else {
				endScroll = $(window).scrollTop();
			}
		}
		dist = (endScroll-startScroll);
		console.log("Total Distance: "+dist+ " Height:"+h+" XPScroll:"+xpScroll);
		if(xpScroll<h&&endScroll!=0){
			if(Math.floor(h/xpScroll)>(lastUp*1000)){
				addScrollXP(dist);
				lastUp++;
			}
			xpScroll += parseInt(dist);
			startScroll = endScroll;
		}
	});
}

$(document).ready(function(){
	b.append("<div id='wti_panel'></div><div id='avatar'><img class='img-responsive'/></div>");
	var p = $('#wti_panel');
	$.ajax({
	  url: chrome.extension.getURL("com/characterSheet.html"),
	  dataType: 'html',
	  success: function (data) {
		p.html(data);
		loadStats();
		checkUrl();
		refreshQuestList();
		bindActions();
	  }, 
	  error: function (data) {
			console.log("Player Load Failed");
			console.log(msg);
		} 
	});  
	//Initialize Tooltips
	$('.tip').tooltip();
});

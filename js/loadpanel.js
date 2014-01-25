debug = true;
b = $('body');

/* ******************
Function to hide all the miscellaneous goodies on the screen
*********************/
function hideAll(){
	$('.m_monster').hide();
}

/* *******************
Function to load all character stats, including img, health, items, etc
*********************/
function loadStats(){
	console.log("Load player character");
	
	$.ajax({
	  url: chrome.extension.getURL('data/player.json'),
	  dataType: 'json',
	  contentType: "application/json; charset=utf-8",
	  success: function (data) {
		console.log("RETURN PLAYER DATA");
		console.log(data);
		var pimg = data['img'];
		var currentHP = (data['hp']/data['maxhp'])*100;
		var currentMP = (data['mp']/data['maxmp'])*100;
		var currentXP = (data['hp']/data['maxhp'])*100;
		
		$("#characterName").html(data['name']);
		$("#characterLevel").html(data['level']);
		$("#characterClass").html(data['class']);
		
		/* Hit Point Bars */
		$("#cHP").html(data['hp']);
		$("#cHPM").html(data['maxhp']);
		$("#characterHealth > .progress > .progress-bar").attr("aria-valuenow",data["hp"]).attr("aria-valuemax",data["maxhp"]).css("width",currentHP+"%");
		$("#cMP").html(data['mp']);
		$("#cMPM").html(data['maxmp']);
		$("#characterMana > .progress > .progress-bar").attr("aria-valuenow",data["mp"]).attr("aria-valuemax",data["maxmp"]).css("width",currentMP+"%");
		$("#cXP").html(data['xp']);
		$("#cXPM").html(data['maxxp']);
		$("#characterExperience > .progress > .progress-bar").attr("aria-valuenow",data["xp"]).attr("aria-valuemax",data["maxxp"]).css("width",currentXP+"%");
		
		/* Character Stats */
		$("#characterATK").html(data['atk']);
		$("#characterMAG").html(data['mag']);
		$("#characterDEF").html(data['def']);
		$("#characterSPD").html(data['spd']);
		
		/* Character Equipment */
		$("#characterAR > a > img").attr('src',chrome.extension.getURL("img/items/"+data['equipment']['ar']['image']));
		$("#characterLH > a > img").attr('src',chrome.extension.getURL("img/items/"+data['equipment']['lh']['image']));
		$("#characterRH > a > img").attr('src',chrome.extension.getURL("img/items/"+data['equipment']['rh']['image']));
		$("#ARL").attr('src',chrome.extension.getURL("img/items/"+data['equipment']['ar']['layer']));
		$("#LHL").attr('src',chrome.extension.getURL("img/items/"+data['equipment']['lh']['layer']));
		$("#RHL").attr('src',chrome.extension.getURL("img/items/"+data['equipment']['rh']['layer']));
		
		/* Character Items */
		for (var i = 0; i < data["items"].length; ++i){
			console.log("Loading Item "+i);
			console.log(data["items"][i]);
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
				.html("<img data-placement='"+p+"' data-original-title='"+data["items"][i]["name"]+"<br/>"+data["items"][i]["descrip"]+"' class='img-responsive tip' src='"+chrome.extension.getURL("img/items/"+data["items"][i]["image"])+"'/>");
		}
		//Initialize Tooltips
		$('.tip').tooltip({html:true,container:'#wti_panel'});
		$("#character").attr('src',chrome.extension.getURL("img/sprites/"+pimg));	
	  	  
	  }, 
	  error: function (data) {
			console.log("Player Load Failed");
			console.log(msg);
		} 
	});  
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
		
		//Position monster
		var monster = $('#'+mid);
		monster.css('top',my+'px').css('left',mx+'px');
		animateMonster(monster);
		monster.bind('click',function(e){ startBattle(e,mdata); });
    });  
}

function loadQuest(name){

}

function checkUrl(){
	var domain = window.location.hostname;
	var pathname = window.location.pathname;
	switch(domain){
		case 'stackoverflow.com':
			loadMonster('hornedelf');
			break;
		default:
			break;
	}
}

function bindBtns(){
	$('#hop').click(function(){ 
		$('#wti_panel').toggleClass("active");  
		$('#iconrow .fa').toggleClass("fa-chevron-left fa-chevron-right");
	});
}

$(document).ready(function(){
	b.append("<div id='wti_panel'></div>");
	var p = $('#wti_panel');
	$.get(chrome.extension.getURL("com/characterSheet.html"), function(data){
		p.html(data);
		loadStats();
		bindBtns();
		checkUrl();
	});
	//Initialize Tooltips
	$('.tip').tooltip();
});

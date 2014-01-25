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
	$("#character").attr('src',chrome.extension.getURL("img/sprites/default.gif"));	
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
});

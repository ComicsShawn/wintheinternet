var audiolist = {
	//Themes
	"battleTheme":chrome.extension.getURL("audio/themes/BattleLoopN.wav"),
	//Battle Sound FX
	"sword":chrome.extension.getURL("audio/fx/WTI-Sword-Hit2.wav")
}

var stopMusic = document.createElement('input');
stopMusic.setAttribute("val",0);
// In bg.js
 var audioElementBG = document.createElement('audio');
 audioElementBG.setAttribute("id", "background");
 audioElementBG.setAttribute("preload", "auto");
 audioElementBG.setAttribute("loop", "true");
 audioElementBG.setAttribute("volume", "0.4");
 audioElementBG.autobuffer = true;
 
 var audioElementFX = document.createElement('audio');
 audioElementFX.setAttribute("id", "fx");
 audioElementFX.setAttribute("preload", "auto");
 audioElementFX.setAttribute("loop", "false");
 audioElementFX.autobuffer = true;

//Create blank source elements 
audioElementBG.appendChild(createSource("battleTheme",""));
audioElementFX.appendChild(createSource("sword",""));
 
function createSource(file,w){
	/*if(w=="BG")
		audioElementBG.removeChild('source');
	else if(w=="FX")
		audioElementFX.removeChild('source');*/
	
	var source = document.createElement('source');
	source.type= 'audio/wav';
	if(file!="")
		source.src= audiolist[file];
	return source;
}
 

 chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "play"){
      	  if(request.type=="BG"){
      	  	  //audioElementBG.appendChild(createSource(request.sound,"BG"));
			  audioElementBG.load;
			  audioElementBG.volume=.4;
			  if(stopMusic.getAttribute("val")!=1)
			  	  audioElementBG.play();
		  }else if(request.type=="ALL"){
		  	  audioElementBG.play();
			  stopMusic.setAttribute("val",1);
		  }else{
      	  	  //audioElementFX.appendChild(createSource(request.sound,"FX"));
			  audioElementFX.load;
			  audioElementFX.volume=1;
			  audioElementFX.removeAttribute("loop");
			  if(stopMusic.getAttribute("val")!=1)
			  	  audioElementFX.play();
		  }
      }else{
      	  if(request.type=="BG"){
			  audioElementBG.pause();
		  }else if(request.type=="ALL"){
			  audioElementBG.pause();
			  audioElementFX.pause();
			  stopMusic.setAttribute("val",1);
		  }else{
			  audioElementFX.pause();
		  }
      }
});

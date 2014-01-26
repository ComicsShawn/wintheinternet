(function($) {
    $.fn.clickToggle = function(func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(function() {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
}(jQuery));

function playSound(t,s,l) {
  chrome.extension.sendMessage({action: "play",type:t,sound:s,level:l})
}

function stopSound(t) {
  chrome.extension.sendMessage({action: "stop",type:t})
}

// Generates random new position
function makeNewPosition(height,width){
    // Get viewport dimensions (remove the dimension of the div)
    var h = $(document).height() - height;
    var w = $(window).width() - width - ($(window).width()*.15);
    
    var nh = Math.floor(Math.random() * h);
    var nw = Math.floor(Math.random() * w);
    
    return [nh,nw];    
    
}

function animateMonster(monster,height,width){
	if(height === undefined) height = 100;
	if(width === undefined)  width = 100;
	
    var newq = makeNewPosition(height,width);
    var oldq = monster.offset();
    var speed = calcSpeed([oldq.top, oldq.left], newq);
    
    monster.animate({ top: newq[0], left: newq[1] }, speed, function(){
      animateMonster(monster,height,width);        
    });
};
function animateNPC(npc,height,width){
	if(height === undefined) height = 100;
	if(width === undefined)  width = 100;
	
    var newq = makeNewPosition(height,width);
    var oldq = npc.offset();
    var speed = calcSpeed([oldq.top, oldq.left], newq);
    
    npc.animate({ top: newq[0], left: newq[1] }, speed, function(){
      animateNPC(npc,height,width);        
    });
};

function adjustProgressBar(stat,type,amt){
	var cv = parseInt($('#c'+stat).html());
	if(type=='+')
		cv += parseInt(amt);
	else
		cv -= parseInt(amt);
	
	var cmax = parseInt($('#c'+stat+'M').html());
	var cp = (cv / cmax) * 100;
	if(cv > cmax) cv = cmax;
	//Animate the change, adjust the progress bars
	$('#c'+stat+'B').attr("aria-valuenow",cv).animate({width:cp+'%'});
	$('#c'+stat).html(cv);
}

function detectScrollDirection() {

	st = window.pageYOffset;

	if (st > lastScrollTop) {
		direction = "down";
	} else {
		direction = "up";
	}

	lastScrollTop = st;

	return direction;

}

function calcSpeed(prev, next) {
    var x = Math.abs(prev[1] - next[1]);
    var y = Math.abs(prev[0] - next[0]);
    
    var greatest = x > y ? x : y;
    
    var speedModifier = 0.1;

    var speed = Math.ceil(greatest/speedModifier);

    return speed;

}

(function($){
    jQuery.fn.barrelRoll = function(){

        var el = $(this),
            speed = 2.5*Math.min(parseInt(el.height()), parseInt(el.width()))
            tmpval = 0;

            el.animate({'z-index': el.css('z-index')}, {duration: speed, queue:false, step:function(now,fx){
                tmpval = Math.round(fx.pos*360)%360;
                el.css({
                    'transform': 'rotate('+tmpval+'deg)',
                    '-moz-transform':'rotate('+tmpval+'deg)',
                    '-webkit-transform': 'rotate('+tmpval+'deg)'
                })
            }})

        return el
    }
})(jQuery)

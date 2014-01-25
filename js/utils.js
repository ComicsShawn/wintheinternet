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

function calcSpeed(prev, next) {
    var x = Math.abs(prev[1] - next[1]);
    var y = Math.abs(prev[0] - next[0]);
    
    var greatest = x > y ? x : y;
    
    var speedModifier = 0.1;

    var speed = Math.ceil(greatest/speedModifier);

    return speed;

}

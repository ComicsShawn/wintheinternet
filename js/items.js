/* ********************
Use Items!
***********************/
function useItem(e,idata,slot){
	e.preventDefault();
	$.ajax({
	  url: chrome.extension.getURL('data/items.json'),
	  dataType: 'json',
	  contentType: "application/json; charset=utf-8",
	  success: function (data) {
		console.log("RETURN ITEM DATA");
		console.log(data);
		var item = data[idata];
		var tgt = item["target"];
		switch(item["type"]){
			case 'boost':
				itemBoost(tgt,item["boost"]);
				if(!['item']['permanent'])
					destroyItem(slot);
				break;
		}
	  }, 
	  error: function (data) {
			console.log("Item Load Failed");
			console.log(msg);
		} 
	});  
}

/* itemBoost - For items that affect stats */
function itemBoost(tgt,boosts){
	var cv = '';
	var cmax = '';
	var cp = '';
	for (var i = 0; i < boosts.length; ++i){
		//Current value
		cv = '';
		cmax = '';
		cp = '';
		switch(tgt){
			case 'player':
				cv = parseInt($('#c'+boosts[i]['stat']).html());
				if(boosts[i]['type']=='+')
					cv += parseInt(boosts[i]['amount']);
				else
					cv -= parseInt(boosts[i]['amount']);
				
				//Check if the item works with a stat that has a maximum value
				if(boosts[i]['max']==true){
					cmax = parseInt($('#c'+boosts[i]['stat']+'M').html());
					cp = (cv / cmax) * 100;
					if(cv > cmax) cv = cmax;
					//Animate the change, adjust the progress bars
					$('#c'+boosts[i]['stat']+'B').attr("aria-valuenow",cv).animate({width:cp+'%'});
				}
				$('#c'+boosts[i]['stat']).html(cv);
				break;
			case 'enemy':
				break;
		}
	}
}

function destroyItem(slot){
	var id = "charItem-"+slot;
	$('#'+id+' > button > img').fadeOut(1000,function(){});	
	$('#'+id+' > button').prop('disabled',true).attr('id','');
	
	chrome.storage.sync.get('player', function(result){
        player = result['player'];
		var items = player['items'];
		items.splice(slot,1);
		
		//chrome.storage.sync.remove('items',function(){ alert("Progress Saved"); });
		chrome.storage.sync.set({'items':items},function(){ });
    });
}
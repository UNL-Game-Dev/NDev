
/**
 * Crafty component for loading a tiled map.
 */
Crafty.c("TiledMap", {

	init:
	function() {
		this.requires("TiledMapBuilder");
	},

	loadMap:
	function(mapName) {
		var that = this;
		$.getJSON("assets/maps/"+mapName+".json", function(json) {
			that.setMapDataSource(json); 
			that.createWorld( function( map ) {
				console.log("Done creating world.");
			});
		});
	},

	pointCollides:
	function(x, y) {
	},

	resolvePos:
	function(x, y) {
		// TODO: Make actual collision.
		var dp = [];
		// Test against boundaries.
		if(x < 0)
			dp.push([0 - x, 0]);
		if(y < 0)
			dp.push([0, 0 - y]);
		if(x > 10)
			dp.push([10 - x, 0]);
		if(y > 10)
			dp.push([0, 10 - y]);
		// Look for the smallest push to escape, return it.
		var smallestPushLen2 = Number.MAX_VALUE;
		var smallestPush = null;
		for(var i = 0; i < dp.length; i++) {
			var push = dp[i];
			var x = push[0];
			var y = push[1];
			var len2 = x*x + y*y;
			if(len2 < smallestPushLen2) {
				smallestPushLen2 = len2;
				smallestPush = push;
			}
		}
		return smallestPush;
	},

});


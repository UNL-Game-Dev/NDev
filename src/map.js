
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
			// Modify the tile image paths to match existing paths.
			for(var i = 0; i < json.tilesets.length; i++) {
				json.tilesets[i].image =
					"assets/maps/" + json.tilesets[i].image;
			}
			// Extract tile bounds information.
			// TODO: Support multiple tilesets.
			that._tilebounds = getGlobalTileBounds(json.tilesets[0]);
			console.log(that._tilebounds);
			// Load it in.
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
		if(x > 30)
			dp.push([30 - x, 0]);
		if(y > 10)
			dp.push([0, 10 - y]);
		return dp;
	},

});

function getGlobalTileBounds(tileset) {
	var boundAssoc = {};
	for(var i in tileset.tileproperties) {
		boundAssoc[i + tileset.firstgid] =
			$.parseJSON(tileset.tileproperties[i].bounds);
	}
	return boundAssoc;
}


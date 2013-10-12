
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

	resolvePos:
	function(x, y) {
		var dp = [];
		var tx = Math.floor(x);
		var ty = Math.floor(y);
		// TODO: Search all layers for collideable tiles.
		if(this.getLayers() != null) {
			var tile = this.getTile(ty, tx, "test");
			if(tile.gid != undefined) {
				var tbounds = this._tilebounds[tile.gid];
			}
		}

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
	// Returns a dictionary of the bounds for tiles.
	// Key: tile global id (number)
	// Value: list of vectors. Vectors are lists that contain x,y,dx,dy.
	var boundAssoc = {};
	for(var tilei in tileset.tileproperties) {
		var gid = parseInt(tilei) + parseInt(tileset.firstgid);
		boundAssoc[gid] = [];
		var pts = $.parseJSON(tileset.tileproperties[tilei].bounds);
		var pprev = pts[pts.length-1];
		for(var i = 0; i < pts.length; ++i) {
			var p = pts[i];
			boundAssoc[gid].push([
				pprev[0], pprev[1],
				p[0]-pprev[0], p[1]-pprev[1]
			]);
			pprev = p;
		}
	}
	return boundAssoc;
}


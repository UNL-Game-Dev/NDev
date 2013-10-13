
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
			if(tile.gid != undefined &&
					this._tilebounds[tile.gid] != undefined) {
				var tbounds = this._tilebounds[tile.gid];
				var p = [x, y];
				var pdiff = sub(p, [Math.floor(tx), Math.floor(ty)]);
				var leastdplen = Number.MAX_VALUE;
				var leastdp = null;
				for(var i = tbounds.length - 1; i >= 0; --i) {
					var bound = tbounds[i];
					// See if this bound really applies to this point.
					// comp on a of b < |a|
					// => (a dot b) / |a| < |a|
					// => a dot b < |a|^2
					// Where a is the bound, b is the pos offset.
					var a = [bound[2], bound[3]];
					var b = sub(pdiff, bound);
					// Normal to the bound.
					var n = norm(rNormal(a));
					// The distance in terms of n b is within the bound.
					// If negative, within the bound!
					// comp on n of b = n dot b
					var d = dot(n, b);
					//console.log(a, n, "dot", b, d);
					if(d < leastdplen) {
						// Scale n by -d to get the way to escape.
						leastdp = scale(n, -d);
						leastdplen = d;
					}
				}
				if(leastdplen > 0) {
					dp.push(leastdp);
				}
				//console.log("DONE", leastdplen, leastdp);
			}
		}
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
		var pts = $.parseJSON(tileset.tileproperties[tilei].bounds);
		boundAssoc[gid] = new Poly(pts);
	}
	return boundAssoc;
}


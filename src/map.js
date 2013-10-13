
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
				that._loaded = true;
			});
		});
	},

	resolvePos:
	function(x, y, poly) {
		var dp = [];
		var tx0 = Math.floor(x);
		var ty0 = Math.floor(y);
		if(!this._loaded) {
			return dp;
		}

		for(var tx = tx0 - 1; tx <= tx0 + 1; tx++)
		for(var ty = ty0 - 1; ty <= ty0 + 1; ty++) {
			// TODO: Search all layers for collideable tiles.
			var tile = this.getTile(ty, tx, "test");
			if(tile == undefined || tile.gid == undefined ||
					this._tilebounds[tile.gid] == undefined) {
				continue;
			}
			var tbounds = this._tilebounds[tile.gid];
			var p = [x, y];
			var pdiff = sub(p, [tx, ty]);
			var leastdplen = Number.MAX_VALUE;
			var leastdp = null;

			for(var i = tbounds.segs.length - 1; i >= 0; --i) {
				var bound = tbounds.segs[i];

				// Where a is along the bound.
				var a = [bound[2], bound[3]];
				// Normal vector to the bound.
				var n = norm(rNormal(a));

				// From p to the start of the segment.
				var b = sub(pdiff, bound);

				// Get the comp on n from segment to p.
				var ndotb = dot(n, b);
				var ndottileorigin = dot(n, bound);

				// Get min and max distances for tile and physical polys.
				var minMaxPhys = poly.minMaxOnNormal(n, ndotb);
				var minMaxTile = tbounds.minMaxOnNormal(n, ndottileorigin);

				//console.log("minMaxes: ", minMaxPhys, minMaxTile);

				// Get penetration values for both sides.
				var penPhysPlus  = minMaxTile[1] - minMaxPhys[0];
				var penPhysMinus = minMaxPhys[1] - minMaxTile[0];

				// Lowest nonpositive penetration = pushback.
				var pen = penPhysPlus;
				if(penPhysMinus < pen)
					pen = penPhysMinus;

				//console.log(penPhysPlus, penPhysMinus, pen, n);

				if(pen >= 0 && pen < leastdplen) {
					// Scale n by -d to get the way to escape.
					leastdp = scale(n, -pen);
					leastdplen = pen;
				}
			}
			if(leastdplen > 0 && leastdp) {
				dp.push(leastdp);
			}
			//console.log("DONE", leastdplen, leastdp);
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


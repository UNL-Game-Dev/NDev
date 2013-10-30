
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
				that.collisionize();
				that._loaded = true;
			});
		});
	},

	collisionize:
	function() {
		// Add tile bounds information.
		for(var layerName in this.getLayers()) {
			var entities = this.getEntitiesInLayer(layerName);
			for(var i = entities.length - 1; i >= 0; --i) {
				var ent = entities[i];
				
				ent.addComponent("Collision");
				// Mark for collision.
				ent.addComponent("Tile");

				var gid = ent.gid;
				var bounds = this._tilebounds[gid];
				
				if(bounds) {
					var boundsdup = [];
					for(var j = 0; j < bounds.length; ++j) {
						boundsdup[j] = [];
						boundsdup[j].push(bounds[j][0] * 32);
						boundsdup[j].push(bounds[j][1] * 32);
					}
					console.log(boundsdup);
					var poly = new Crafty.polygon(boundsdup);
					ent.collision(poly);
				}
			}
		}
	}

});

function getGlobalTileBounds(tileset) {
	// Returns a dictionary of the bounds for tiles.
	// Key: tile global id (number)
	// Value: list of vectors. Vectors are lists that contain x,y,dx,dy.
	var boundAssoc = {};
	for(var tilei in tileset.tileproperties) {
		var gid = parseInt(tilei) + parseInt(tileset.firstgid);
		var pts = $.parseJSON(tileset.tileproperties[tilei].bounds);
		boundAssoc[gid] = pts;
	}
	return boundAssoc;
}


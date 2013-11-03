
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
			that._initTileInfo(json.tilesets);

			// Keep the tile map width and height.
			that.tilewidth = json.tilesets[0].tilewidth;
			that.tileheight = json.tilesets[0].tileheight;

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
				var info = this._tileInfo[gid];
				if(!info)
					continue;
				var tilesetInfo = this._tilesetInfo[info.tileseti];
				var bounds = info.pts;
				
				var boundsdup = [];
				for(var j = 0; j < bounds.length; ++j) {
					boundsdup[j] = [];
					boundsdup[j].push(bounds[j][0] * tilesetInfo.width);
					boundsdup[j].push(bounds[j][1] * tilesetInfo.height);
				}
				var poly = new Crafty.polygon(boundsdup);
				ent.collision(poly);
			}
		}
	},

	/**
	 * Initializes two dictionaries: tile info and tileset info.
	 *
	 * _tileInfo:
	 * { gid :
	 *   {
	 *     pts : <list of vectors making up the collision bounds.>,
	 *     tileseti : <index of the tileset that this tileinfo came from.>
	 *   }
	 *   ...
	 * }
	 * (Vectors are lists that contain x,y,dx,dy.)
	 *
	 * _tilesetInfo:
	 * Returns a dictionary of the info for tilesets.
	 * { index :
	 *   {
	 *     width : <tile width>
	 *     height: <tile height>
	 *   }
	 *   ...
	 * }
	 */
	_initTileInfo:
	function(tilesets) {
		this._tileInfo = {};
		this._tilesetInfo = {};

		for(var tileseti in tilesets) {
			var tileset = tilesets[tileseti];

			this._tilesetInfo[tileseti] = {
				width: tileset.tilewidth,
				height: tileset.tileheight
			};
			this._tilesetInfo[tileseti].width = tileset.tilewidth;
			this._tilesetInfo[tileseti].height = tileset.tileheight;

			for(var tilei in tileset.tileproperties) {
				var gid = parseInt(tilei) + parseInt(tileset.firstgid);
				var pts = $.parseJSON(tileset.tileproperties[tilei].bounds);

				// Store the bounds points and the tileset index of each tile.
				this._tileInfo[gid] = {
					"pts": pts,
					"tileseti": tileseti
				};
			}
		}
	}
});


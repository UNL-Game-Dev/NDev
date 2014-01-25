
/**
 * Crafty component for loading a tiled map.
 */
Crafty.c("TiledMap", {

	init:
	function() {
		this.requires("TiledMapBuilder");
	},

	loadMap:
	function(mapName, loaded) {
		var that = this;

		// Remove all entities that have 2D but don't have Persistent.
		var old2D = Crafty("2D");
		var i = old2D.length - 1;
		while(i >= 0) {
			var eid = old2D[i];
			var e = Crafty(eid);
			if(e && !e.has("Persistent")) {
				e.destroy();
			}
			--i;
		}

		$.getJSON("assets/maps/"+mapName+".json", function(json) {
			// Modify the tile image paths to match existing paths.
			for(var i = 0; i < json.tilesets.length; i++) {
				json.tilesets[i].image =
					"assets/maps/" + json.tilesets[i].image;
			}
			// Extract tile bounds information.
			that._initTileInfo(json.tilesets);

			// Extract layer information.
			that._initLayerInfo(json.layers);

			// Spawn Tiled-made objects.
			that._spawnMapObjects(json.layers);

			// Load it in.
			that.setMapDataSource(json); 
			that.createWorld( function( map ) {
				console.log("Done creating world.");
				that.collisionize();
				that._loaded = true;

				if(loaded)
					loaded();
			});
		});
	},

	collisionize:
	function() {
		// Add tile bounds information.
		for(var layerName in this.getLayers()) {
			// If this layer isn't solid, don't bother.
			if(!this._layerProperties[layerName].solid)
				continue;

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
					boundsdup[j] = [
						bounds[j][0] * tilesetInfo.width,
						bounds[j][1] * tilesetInfo.height
					];
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
	},

	/**
	 * Initializes _layerProperties, which lists layers' property dicts by the
	 * layer's name.
	 */
	_initLayerInfo:
	function(layers) {
		this._layerProperties = {};
		for(var layeri in layers) {
			var layer = layers[layeri];
			// Set to {} if undefined for easier access later.
			this._layerProperties[layer.name] = layer.properties || {};
		}
	},

	/**
	 * Spawns map objects. See map_objects.js for more on what it does.
	 */
	_spawnMapObjects:
	function(layers) {
		for(var layeri in layers) {
			var layer = layers[layeri];
			if(layer.type = "objectgroup") {
				for(var objecti in layer.objects) {
					var object = layer.objects[objecti];
					// Create a crafty entity with the given map component.
					var craftyObject = Crafty.e(object.type);
					// Let the object initialize itself.
					if(craftyObject.mapObjectInit) {
						craftyObject.mapObjectInit(object);
					}
				}
			}
		}
	}
});


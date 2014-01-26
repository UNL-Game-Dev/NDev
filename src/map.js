
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

			// Load it in.
			that.setMapDataSource(json); 
			that.createWorld(function(map) {
				that._arrangeTileLayers();
				that.collisionize();
				// Spawn Tiled-made objects.
				that._spawnMapObjects(json.layers);
				
				that._loaded = true;
				console.log("Done creating world.");
				
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
			if(this._layerInfo[layerName].properties.solid) {
				var entities = this.getEntitiesInLayer(layerName);
				for(var i = entities.length - 1; i >= 0; --i) {
					var ent = entities[i];
					this._collisionizeEntity(ent);
				}
			}
		}
	},
	
	_collisionizeEntity:
	function(ent) {
		// Can only collisionize an entity if it has a gid.
		if(ent.gid) {
			ent.addComponent("Collision");
			// Mark for collision.
			ent.addComponent("Tile");
			
			var gid = ent.gid;
			var info = this._tileInfo[gid];
			if(info) {
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
	 * Initializes _layerInfo, which lists layers' property dicts, types,
	 * z-indices, and object info by the layer's name.
	 */
	_initLayerInfo:
	function(layers) {
		this._layerInfo = {};
		
		// Find the first solid tile layer, and use that for the Z-index of 0.
		var solidLayer = 0;
		for(var layeri in layers) {
			var layer = layers[layeri];
			if(layer.properties && layer.type == "tilelayer" && layer.properties.solid) {
				solidLayer = layeri;
				break;
			}
		}
		
		for(var layeri in layers) {
			var layer = layers[layeri];
			this._layerInfo[layer.name] = {
				properties: layer.properties || {},
				type: layer.type,
				z: layeri - solidLayer,
				objects: layer.objects
			};
		}
	},
	
	/**
	 * Initializes tiles' z-indices based on the layers' z-indices.
	 */
	_arrangeTileLayers:
	function() {
		for(var layerName in this.getLayers()) {
			if(this._layerInfo[layerName].type === "tilelayer") {
				var entities = this.getEntitiesInLayer(layerName);
				var z = this._layerInfo[layerName].z;
				for(var i in entities) {
					entities[i].z = z;
				}
			}
		}
	},

	/**
	 * Spawns map objects. See map_objects.js for more on what it does.
	 */
	_spawnMapObjects:
	function() {
		for(var layerName in this.getLayers()) {
			var layerInfo = this._layerInfo[layerName];
			if(layerInfo.type === "objectgroup") {
				var objects = layerInfo.objects;
				for(var objecti in objects) {
					var object = objects[objecti];
					// Create a crafty entity with the given map component,
					// or the default if none given.
					var craftyObject = Crafty.e(object.type || "DefaultMapObject");
					craftyObject.mapObjectInit(object);
					// If layer is solid, collisionize the entity.
					if(layerInfo.properties.solid) {
						this._collisionizeEntity(craftyObject);
					}
					// Set the entity's Z-index.
					craftyObject.z = layerInfo.z;
				}
			}
		}
	}
});


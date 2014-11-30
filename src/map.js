
var _mapFolder = "assets/maps/";

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
		var self = this;
		
		this.mapName = mapName;
		
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
		$.getJSON(_mapFolder + mapName + ".json", function(json) {
			// Modify the tile image paths to match existing paths.
			for(var i = 0; i < json.tilesets.length; i++) {
				json.tilesets[i].image =
					_mapFolder + json.tilesets[i].image;
			}
			// Extract tile bounds information.
			self._initTileInfo(json.tilesets);
			
			// Extract layer information.
			self._initLayerInfo(json.layers);
			
			// Load it in.
			self.setMapDataSource(json);
			self.createWorld(function(map) {
				self._arrangeTileLayers();
				self.activate();
				// Spawn Tiled-made objects.
				self._spawnMapObjects(json.layers);

				self._loaded = true;
				console.log("Done creating world.");

				if(loaded)
					loaded();
			});
		});
		return this;
	},

	/**
	 * Activate the tilemap, collisionizing all solid entities, setting up animations/sprites, etc.
	 */
	activate:
	function() {
		// Add tile bounds information.
		var layers = this.getLayers();
		_(layers).each(function(layer, layerName) {
			var layerProperties = this._layerInfo[layerName].properties;
			var entities = this.getEntitiesInLayer(layerName);
			_(entities).each(function(ent) {
				var gid = ent.gid;
				var tileInfo = this._tileInfo[gid];
				if(layerProperties.solid) {
					this._collisionizeEntity(ent);
				}
				if(tileInfo) {
					var animate = tileInfo.animate;
					if(animate) {
						Crafty('SpriteLoader').loadAnimation(ent, animate);
						ent.animate(animate, -1);
					}
				}
			});
		});
	},
	
	_collisionizeEntity:
	function(ent) {
		// Can only collisionize an entity if it has a gid.
		if(ent.gid) {
			ent.addComponent("Collision");
			// Mark for collision.
			ent.addComponent("Tile");
			
			var gid = ent.gid;
			var tileInfo = this._tileInfo[gid];
			if(tileInfo) {
				var tilesetInfo = this._tilesetInfo[tileInfo.tileseti];
				var bounds = tileInfo.pts;
				
				// Make entity collidable with custom bounds.
				if(bounds) {
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
				
				// Set whether the entity is one-way collidable.
				if(tileInfo.oneway) {
					ent.addComponent("OneWay");
				}

				// Set whether the entity is phaseable.
				if(tileInfo.phaseable) {
					ent.addComponent("Phaseable");
				}
				
				// Set whether the entity is unstable.
				if(tileInfo.unstable) {
					ent.addComponent("Unstable");
				}
				
				// Set whether the tile is climbable
				if(tileInfo.climbable) {
					if(tileInfo.climbable.indexOf('l') >= 0) {
						ent.addComponent("ClimbableLeft");
					}
					if(tileInfo.climbable.indexOf('r') >= 0) {
						ent.addComponent("ClimbableRight");
					}
				}
				// Set whether the entity is destructible.
				if(tileInfo.destructible) {
					ent.addComponent("Destructible");
				}
				
				// Set whether the entity is pushable.
				if(tileInfo.pushable) {
					ent.addComponent("Pushable");
				}
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
				var properties = tileset.tileproperties[tilei];
				var pts = properties.bounds
					? $.parseJSON(properties.bounds)
					: undefined;
				
				// Store the bounds points and the tileset index of each tile.
				var tileInfo = properties;
				tileInfo.oneway = !!tileInfo.oneway;
				tileInfo.phaseable = !!tileInfo.phaseable;
				tileInfo.unstable = !!tileInfo.unstable;
				tileInfo.destructible = !!tileInfo.destructible;
				tileInfo.pushable = !!tileInfo.pushable;
				tileInfo.pts = pts;
				tileInfo.tileseti = tileseti;
				this._tileInfo[gid] = tileInfo;
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
		
		// Find the first solid tile layer, and use that for the base Z-index.
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
			layer.properties = layer.properties || {};
			layer.z = layeri - solidLayer;
			this._layerInfo[layer.name] = layer;
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
					if(craftyObject.mapObjectInit) {
						craftyObject.mapObjectInit(object);
					} else {
						console.error("Invalid object type: " + object.type);
					}
					// If layer is solid, collisionize the entity.
					if(layerInfo.properties.solid) {
						this._collisionizeEntity(craftyObject);
					}
					// Animate the entity if needed.
					var gid = craftyObject.gid;
					var tileInfo = this._tileInfo[gid];
					if(tileInfo && tileInfo.animate) {
						console.log(craftyObject[0]);
						ent.animate(tileInfo.animate, -1);
					}
					// Set the entity's Z-index.
					craftyObject.z = layerInfo.z;
				}
			} else if(layerInfo.type === "imagelayer") {
				// This is probably a parallax layer.
				var parallaxFactor = layerInfo.properties.parallaxFactor;
				if(parallaxFactor) {
					// Create the image and entity.
					var parallaxImg = Crafty.e("2D, Canvas, Image, Parallax")
						.image(_mapFolder + layerInfo.image)
						.scrollFactor(parallaxFactor)
						.attr({
							z: layerInfo.z
						});
				}
			}
		}
	}
});

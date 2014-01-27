/*
 * This file contains objects that are used in Tiled to spawn things.
 * The method "mapObjectInit" is called on all spawned objects, passing a
 * single object containing the keys below:
 *   name         (string)
 *   x            (number)
 *   y            (number)
 *   width        (number)
 *   height       (number)
 *   properties   (dictionary of more properties)
 * See the map json for more on the values.
 */
 
/**
 * Default map object. If a map object does not specify a type, it defaults
 * to this.
 * Base usage: x,y
 * Properties: none
 */
Crafty.c("DefaultMapObject", {
	init:
	function() {
		this.requires("2D");
	},
	
	mapObjectInit:
	function(object) {
		this.x = object.x;
		this.y = object.y;
		// If the object has a gid property, then display its image
		if(object.gid) {
			this.gid = object.gid;
			this._sprite = "Tile" + object.gid;
			this
				.requires("DOM")
				.requires(this._sprite);
			// Shift upwards to correctly display image, since origin is
			// bottom-left in Tiled but top-left in Crafty.
			this.x = object.x;
			this.y = object.y - this.h;
		}
	}
});

/**
 * A player spawn point. If a player doesn't already exist in the map, spawns
 * one here. (The only reason this doesn't turn itself into the player itself
 * is that the player might have come from another map!)
 * Base usage: x,y
 * Properties: none
 */
Crafty.c("PlayerSpawn", {
	init:
	function() {
		this.requires("2D");
	},

	mapObjectInit:
	function(object) {
		this.x = object.x;
		this.y = object.y;

		this.bind("SpawnPlayer", function() {
			var player = Crafty.e("Player");
			player.setPhysPos(this.x, this.y);
			Crafty.viewport.follow(player);
		});
	}
});

/**
 * A door that can be placed on the map. Uses the x,y,w,h of the Tiled object
 * and properties to decide where to go.
 * Base usage: x,y,w,h, name
 * Properties: targetMap, targetDoor
 */
Crafty.c("MapDoor", {
	init:
	function() {
		this.requires("2D");
		// Let the Door component handle the more complex stuff to avoid bogging
		// down this file.
		this.requires("Door");
	},

	mapObjectInit:
	function(object) {
		this.x = object.x;
		this.y = object.y;
		this.w = object.width;
		this.h = object.height;
		this._name = object.name;
		this._targetMap = object.properties.targetMap;
		this._targetDoor = object.properties.targetDoor;
		// Set up the bounding box.
		this.collision();
		//console.log("Creating door from ", object, this);
	},
});

Crafty.c("MapSaveZone", {
	init:
	function() {
		this.requires("2D")
			.requires("SaveZone");
	},
	
	mapObjectInit:
	function(object) {
		this.x = object.x;
		this.y = object.y;
		this.w = object.width;
		this.h = object.height;
		// Set up the bounding box.
		this.collision();
	}
});

/**
 * A platform that moves along a specified path.
 * Base usage: gid, name
 * Properties: path
 */
Crafty.c("MovingPlatform", {
	init:
	function() {
		this.requires("2D, DOM, Collision, Tile, Physical, FakeInertia, DefaultPhysicsDraw")
			.attr({
				path: null,
				_moving: false,
				_startVertIndex: 0,
				_endVertIndex: 1,
				_startVert: null,
				_endVert: null,
				_segmentDuration: 1.0,
				_segmentLength: 0,
				_speed: 50
			})
			.bind("StartPlatform", function() {
				this._moving = true;
			})
			.bind("StopPlatform", function() {
				this._moving = false;
			})
			.bind("PrePhysicsTick", function() {
				if(this._moving) {
					var pathVertices = this.path.vertices;
					var numVertices = pathVertices.length;
					if(!this._startVert) {
						var startVertRel = pathVertices[this._startVertIndex];
						var endVertRel = pathVertices[this._endVertIndex];
						this._startVert = [startVertRel.x + this.path.x, startVertRel.y + this.path.y];
						this._endVert = [endVertRel.x + this.path.x, endVertRel.y + this.path.y];
						this._segmentLength = dist(sub(this._endVert, this._startVert));
						this._segmentDuration = this._segmentLength / this._speed;
						this.setPhysPos(this._startVert[0], this._startVert[1]);
					}
					
					var x = this._phX, y = this._phY;
					var dt = 1.0 / Crafty.timer.FPS();
					var targetDir = norm(sub(this._endVert, this._startVert));
					targetDir[0] *= this._segmentLength / this._segmentDuration * dt;
					targetDir[1] *= this._segmentLength / this._segmentDuration * dt;
					
					x += targetDir[0];
					y += targetDir[1];
					
					if(dist(sub([x, y], this._startVert)) >= this._segmentLength) {
						this._startVertIndex = (this._startVertIndex + 1) % numVertices;
						this._endVertIndex = (this._endVertIndex + 1) % numVertices;
						var startVertRel = pathVertices[this._startVertIndex];
						var endVertRel = pathVertices[this._endVertIndex];
						this._startVert = [startVertRel.x + this.path.x, startVertRel.y + this.path.y];
						this._endVert = [endVertRel.x + this.path.x, endVertRel.y + this.path.y];
						x = this._startVert[0];
						y = this._startVert[1];
						this._segmentLength = dist(sub(this._endVert, this._startVert));
						this._segmentDuration = this._segmentLength / this._speed;
					}
					
					this._phX = x;
					this._phY = y;
				}
			});
	},
	
	mapObjectInit:
	function(object) {
		/* test */
		this.setPhysPos(object.x, object.y);
		/* end test */
		this.requires("Tile" + object.gid);
		this._name = object.name;
		this._pathName = object.properties.path;
		
		// See if path exists yet, or attach it when it exists.
		var paths = Crafty("MapPath");
		for(var i in paths) {
			var path = Crafty(paths[i]);
			if(path.name === this._pathName) {
				this.path = path;
				this.trigger("StartPlatform");
				break;
			}
		}
		if(!this.path) {
			this.bind("PathCreated", function(path) {
				if(path.name === this._pathName) {
					this.path = path;
					this.trigger("StartPlatform");
					this.unbind("PathCreated");
				}
			});
		}
	}
});

/**
 * A path with a list of vertices.
 * Base usage: x,y, name, polyline
 */
Crafty.c("MapPath", {
	init:
	function() {
		this.requires("2D");
	},
	
	mapObjectInit:
	function(object) {
		this.x = object.x;
		this.y = object.y;
		this.name = object.name;
		this.vertices = object.polyline;
		Crafty.trigger("PathCreated", this);
	}
});


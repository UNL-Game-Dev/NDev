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
		this.requires("2D, DOM, Tween, Collision, Tile, Physical, FakeInertia, DefaultPhysicsDraw")
			.attr({
				path: null,
				_moving: false,
				_destVertIndex: 1,
				_speed: 5.0
			});
	},
	
	mapObjectInit:
	function(object) {
		this.setPhysPos(object.x, object.y);
		this.requires("Tile" + object.gid);
		this._name = object.name;
		this._pathName = object.properties.path;
		
		// See if path exists yet, or attach it when it exists.
		var paths = Crafty("MapPath");
		for(var i in paths) {
			var path = Crafty(paths[i]);
			if(path.name === this._pathName) {
				this.path = path;
				this._advance();
				break;
			}
		}
		if(!this.path) {
			this.bind("PathCreated", function(path) {
				if(path.name === this._pathName) {
					this.unbind("PathCreated");
					this.path = path;
					this._advance();
				}
			});
		}
	},
	
	/*
	 * Move the platform along the next segment.
	 */
	_advance:
	function() {
		var path = this.path;
		var pathVertices = path.vertices;
		
		// Get the two vertices of the path.
		var pos1 = pathVertices[this._destVertIndex];
		this._destVertIndex = (this._destVertIndex + 1) % pathVertices.length;
		var pos2 = pathVertices[this._destVertIndex];
		
		var length = dist(sub([pos1.x, pos1.y], [pos2.x, pos2.y]));
		var duration = length / (this._speed / Crafty.timer.FPS());
		
		// Start at the beginning vertex.
		this.attr({ _phX: pos1.x + path.x, _phY: pos1.y + path.y })
		// Move to the destination.
		    .tween({ _phX: pos2.x + path.x, _phY: pos2.y + path.y }, duration)
		// Advance again when done.
			.timeout(this._advance, duration);
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


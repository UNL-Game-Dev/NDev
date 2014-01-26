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
		this.requires("Collision");

		this.onHit("PlatformControls", function(hit) {
			// Only activate if the player wasn't colliding last frame.
			if(!this._collidingLast) {
				this.moveToTarget();
			}
		}, function() {
			this._collidingLast = false;
		});
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

	/**
	 * Execute the door transition.
	 */
	moveToTarget:
	function() {
		var targetDoor = this._targetDoor;
		Crafty("TiledMap").loadMap(this._targetMap, function() {
			// When the map loads, add the player to the target door.
			// (The old player will have been deleted.)
			var player = Crafty.e("Player");
			// Put the player on the target door.
			Crafty("MapDoor").each(function(e) {
				if(this._name == targetDoor) {
					player.setPhysPos(this.x, this.y);
					// Make sure the player doesn't go right back through.
					this._collidingLast = true;
				}
			});
			Crafty.viewport.follow(player);
		});
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
		this.requires("2D, DOM, Collision, Tile")
			.attr({
				_moving: false
			})
			.bind("StartPlatform", function() {
				this._moving = true;
			})
			.bind("StopPlatform", function() {
				this._moving = false;
			})
			.bind("PrePhysicsTick", function() {
				if(this._moving) {
					this.x += 1;
				}
			});
	},
	
	mapObjectInit:
	function(object) {
		/* test */
		this.x = object.x;
		this.y = object.y;
		/* end test */
		this.requires("Tile" + object.gid);
		this._name = object.name;
		this.path = object.properties.path;
	}
});

/**
 * A path with a list of vertices.
 */
Crafty.c("MapPath", {
	init:
	function() {
	},
	
	mapObjectInit:
	function(object) {
	}
});


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
			var player = Crafty.e(
				"2D, DOM, SpriteAnimation, player, Collision, Physical, TileConstraint," +
				"PlatformControls, DefaultPhysicsDraw"
			)
			// Define animations
				.animate("PlayerStandLeft", [[0, 0], [1, 0], [2, 0], [3, 0], [3, 0], [2, 0], [1, 0], [0, 0]])
				.animate("PlayerStandRight", [[4, 0], [5, 0], [6, 0], [7, 0], [7, 0], [6, 0], [5, 0], [4, 0]])
				.animate("PlayerWalkLeft", 0, 1, 7)
				.animate("PlayerWalkRight", 0, 2, 7)
				.animate("PlayerJumpLeft", 0, 3, 3)
				.animate("PlayerJumpRight", 4, 3, 7)
				.animate("PlayerFallLeft", [[0, 4], [1, 4], [2, 4], [3, 4], [3, 4], [2, 4], [1, 4], [0, 4]])
				.animate("PlayerFallRight", [[4, 4], [5, 4], [6, 4], [7, 4], [7, 4], [6, 4], [5, 4], [4, 4]])
				.animate("PlayerLandLeft", 0, 5, 3)
				.animate("PlayerLandRight", 4, 5, 7)
			// Bind animations
				.bind("PlayerStand", function() {
					this.stop();
					this.animate(this.getDirection() === "left" ? "PlayerStandLeft" : "PlayerStandRight", 24, -1);
				})
				.bind("PlayerMove", function() {
					this.stop();
					if(this.isGrounded()) {
						this.animate(this.getDirection() === "left" ? "PlayerWalkLeft" : "PlayerWalkRight", 24, -1);
					} else {
						this.animate(this.getDirection() === "left" ? "PlayerFallLeft" : "PlayerFallRight", 24, -1);
					}
				})
				.bind("PlayerJump", function() {
					this.stop();
					this.animate(this.getDirection() === "left" ? "PlayerJumpLeft" : "PlayerJumpRight", 12, 0);
					this.timeout(function() {
						if(!this.isGrounded()) {
							this.stop();
							this.animate(this.getDirection() === "left" ? "PlayerFallLeft" : "PlayerFallRight", 24, -1);
						}
					}, 500);
				})
				.bind("PlayerFall", function() {
					this.stop();
					this.animate(this.getDirection() === "left" ? "PlayerFallLeft" : "PlayerFallRight", 24, -1);
				})
				.bind("PlayerLand", function() {
					this.stop();
					this.animate(this.getDirection() === "left" ? "PlayerLandLeft" : "PlayerLandRight", 12, 0);
					this.timeout(function() {
						if(this.isGrounded()) {
							this.stop();
							this.animate(this.getDirection() === "left" ? "PlayerStandLeft" : "PlayerStandRight", 24, -1);
						}
					}, 500);
				});
			player.setPhysPos(this.x, this.y);
			Crafty("Scroller").target = player;
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
			var player = Crafty.e(
				"2D, DOM, player, Collision, Physical, TileConstraint," +
				"PlatformControls, DefaultPhysicsDraw"
			);
			// Put the player on the target door.
			Crafty("MapDoor").each(function(e) {
				if(this._name == targetDoor) {
					player.setPhysPos(this.x, this.y);
					// Make sure the player doesn't go right back through.
					this._collidingLast = true;
				}
			});
			Crafty("Scroller").target = player;
		});
	}
});


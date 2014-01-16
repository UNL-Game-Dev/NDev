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
			var player = Crafty.e("Player");
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
			var player = Crafty.e("Player");
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

/**
 * A light crystal that can bend light.
 */
Crafty.c("LightCrystal", {
	init:
	function() {
		this.requires("2D, DOM, lightCrystal, Collision")
			.collision(new Crafty.polygon([
				[ this.w * 0.375, this.h * 0.000 ],
				[ this.w * 0.625, this.h * 0.000 ],
				[ this.w * 0.625, this.h * 1.000 ],
				[ this.w * 0.375, this.h * 1.000 ]
			]));
	},
	
	mapObjectInit:
	function(object) {
		this
			.origin(this.w / 2, this.h)
			.attr({
				x: object.x,
				y: object.y - this.h,
				z: 100,
				_outgoingBeam: Crafty.e("LightBeam").attr({
					x: object.x,
					y: object.y - this.h,
					rotation: this.rotation + 180
				})
			})
			.attach(this._outgoingBeam);
	},
	
	turnOn:
	function() {
		this._outgoingBeam.turnOn();
	},
	
	turnOff:
	function() {
		this._outgoingBeam.turnOff();
	}
});


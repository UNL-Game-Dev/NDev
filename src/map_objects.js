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


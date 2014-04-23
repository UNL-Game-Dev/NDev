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
		this.requires("TileImage");
	},
	
	mapObjectInit:
	function(object) {
		this.tile(object.gid);
		this.x = object.x;
		this.y = object.y - this.h;
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
		});
	}
});

/**
 * An enemy spawn point.
 * Base usage: x,y
 * Properties: none
 */
Crafty.c("EnemySpawn", {
	init:
	function() {
		this.requires("2D");
	},
	
	mapObjectInit:
	function(object) {
		var enemy = Crafty.e("Enemy");
		enemy.setPhysPos(object.x, object.y);
		enemy.setType(object.properties.type);
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
		this.requires("2D, Canvas, Tween, Physical, Collision, Tile,"
			+ "FakeInertia, DefaultPhysicsDraw");
	},
	
	mapObjectInit:
	function(object) {
		// Give it the right tile sprite.
		if(object.gid) {
			this.gid = object.gid;
			this.addComponent("Tile" + object.gid);
		}
		this.setPhysPos(object.x, object.y);
		this._name = object.name;
		this._pathName = object.properties.path;
		this._destVertIndex = 0;
		
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
		var durations = path.segmentDurations;
		
		// Get the duration of this segment, in milliseconds.
		var time = durations[this._destVertIndex] * 1000;
		
		// Get the path's start and end vertices.
		var pos1 = pathVertices[this._destVertIndex];
		this._destVertIndex = (this._destVertIndex + 1) % pathVertices.length;
		var pos2 = pathVertices[this._destVertIndex];
		
		// Start at the beginning vertex.
		this.attr({ _phX: pos1.x + path.x, _phY: pos1.y + path.y })
		// Move to the destination.
			.tween({ _phX: pos2.x + path.x, _phY: pos2.y + path.y }, time)
		// Advance again when done.
			.timeout(this._advance, time);
	}
});

/**
 * A path with a list of vertices.
 * Base usage: x,y, name, polyline OR polygon
 *     If the path object is a polyline, the platform will animate back and
 *         forth across the path.
 *     If the path object is a polygon, the platform will animate cyclically
 *         around the path.
 * Properties:
 *     time (optional)
 *         Either a single number specifying the entire path's period in seconds
 *             (uniform speed), or a list of numbers giving the duration of
 *             movement along each path segment.
 *         If not given, the platform will move with a uniform default speed
 *             around the path.
 *         If the path is a polyline, you can specify segment durations in one
 *             direction, in which case the duration will be the same forwards
 *             and backwards. Alternatively, you can specify different durations
 *             going in each direction, going from beginning to end back to
 *             beginning.
 */
Crafty.c("MapPath", {
	_defaultSpeed: 50.0,
	
	init:
	function() {
		this.requires("2D");
	},
	
	mapObjectInit:
	function(object) {
		this.x = object.x;
		this.y = object.y;
		this.name = object.name;
		// Get the cyclic polygon path if it exists, otherwise use the polyline
		// path back-and-forth.
		var vertices = object.polygon;
		if(!vertices) {
			var backVertices = object.polyline.slice(1, -1).reverse();
			vertices = object.polyline.concat(backVertices);
		}
		this.vertices = vertices;
		this.pathType = object.polygon ? "polygon" : "polyline";
		
		// Set the duration of each segment.
		var time, durations = [];
		if(object.properties && object.properties.time != undefined) {
			time = $.parseJSON(object.properties.time);
		}
		// Check whether a list of durations or a single duration was given.
		if(typeof time == typeof []) {
			// Set path segment durations to the list given.
			durations = time;
			
			if(this.pathType === "polyline") {
				// If durations are only given going in one direction,
				// assign those durations in the opposite direction as well.
				var numSegments = object.polyline.length - 1;
				for(var i = 0; i < numSegments; i++) {
					var j = numSegments * 2 - 1 - i;
					if(durations[j] == undefined) {
						durations[j] =  durations[i];
					}
				}
			}
		} else {
			// Calculate the duration of each segment.
			// Use the segment lengths.
			var totalLength = 0;
			var segmentLengths = [];
			for(var i in vertices) {
				var j = (Number(i) + 1) % vertices.length;
				var vi = vertices[i], vj = vertices[j];
				var length = dist(sub([vi.x, vi.y], [vj.x, vj.y]));
				totalLength += length;
				segmentLengths[i] = length;
			}
			if(typeof time == typeof 0) {
				// Set duration of each segment based on the total time and
				// segment lengths.
				for(var i in segmentLengths) {
					durations[i] = time * segmentLengths[i] / totalLength;
				}
			} else {
				// Set duration of each segment based on the default speed.
				for(var i in segmentLengths) {
					durations[i] = segmentLengths[i] / this._defaultSpeed;
				}
			}
		}
		this.segmentDurations = durations;
		Crafty.trigger("PathCreated", this);
	}
});

/**
 * Hazardous object that moves horizontally until it hits a wall, then switches
 * direction.
 * Base usage: x,y
 * Properties: speed, direction
 */
Crafty.c("PingPongHazard", {
	init:
	function() {
		this.requires("PingPong, 2D, Canvas, Hazard, Tile");
	},
	
	mapObjectInit:
	function(object) {
		if(object.gid) {
			this.addComponent("Tile" + object.gid);
		}
		this.setPhysPos(object.x, object.y - this.h);
		var properties = object.properties;
		if(properties.speed != undefined) {
			this.speed = properties.speed;
		}
		if(properties.direction != undefined) {
			this.direction(properties.direction);
		}
	}
});

/**
 * Block that slides in and out from a certain direction.
 * Base usage: x,y
 * Properties
 *     time
 *         Time to wait, in seconds, between sliding in and sliding out.
 *         OR
 *         [slideTime, delayTime] where slideTime is the time to slide in and
 *         out, and delayTime is the time to wait between sliding in and out.
 *         OR
 *         [slideInTime, delayTime, slideOutTime] where slideInTime and
 *         slideOutTime are the durations of sliding in and out, respectively.
 *         OR
 *         [slideInTime, delayInTime, slideOutTime, delayOutTime] where
 *         delayInTime is the time to wait after sliding in, and delayOutTime is
 *         the time to wait after sliding out.
 *     delay
 *         Time to wait, in seconds, before initially sliding out.
 *     direction
 *         Direction to slide in and out from. Can be N/E/S/W/NE/etc. or an
 *         angle from x-axis, in degrees.
 */
Crafty.c("SlidingBlock", {
	init:
	function() {
		this.requires("2D, Canvas, Collision, Physical, Tile, Tween,"
					+ "FakeInertia, DefaultPhysicsDraw");
	},
	
	mapObjectInit:
	function(object) {
		if(object.gid) {
			this.addComponent("Tile" + object.gid);
		}
		var x = object.x;
		var y = object.y - this.h;
		this.setPhysPos(x, y);
		this.x = x;
		this.y = y;
		
		// Default properties
		this._delay = 0.0;
		this._slideInTime = 0.25;
		this._slideInDelay = 1.0;
		this._slideOutTime = 0.25;
		this._slideOutDelay = 1.0;
		this._slideInPos = [x, y];
		this._slideOutPos = [x, y - this.h];
		
		var properties = object.properties;
		if(properties.time != undefined) {
			var time = JSON.parse(properties.time);
			
			if(typeof time === typeof 0) {
				time = [time];
			}
			
			if(time.length === 1) {
				this._slideInDelay = time[0];
				this._slideOutDelay = time[0];
			} else if(time.length === 2) {
				this._slideInTime = time[0];
				this._slideInDelay = time[1];
				this._slideOutTime = time[0];
				this._slideOutDelay = time[1];
			} else if(time.length === 3) {
				this._slideInTime = time[0];
				this._slideInDelay = time[1];
				this._slideOutTime = time[2];
				this._slideOutDelay = time[1];
			} else if(time.length === 4) {
				this._slideInTime = time[0];
				this._slideInDelay = time[1];
				this._slideOutTime = time[2];
				this._slideOutDelay = time[3];
			}
		}
		if(properties.delay != undefined) {
			this._delay = properties.delay;
		}
		if(properties.direction != undefined) {
			var dir = properties.direction.toLowerCase();
			
			if(dir === 'e') {
				dir = 0;
			} else if(dir === 'ne') {
				dir = 45;
			} else if(dir === 'n') {
				dir = 90;
			} else if(dir === 'nw') {
				dir = 135;
			} else if(dir === 'w') {
				dir = 180;
			} else if(dir === 'sw') {
				dir = 225;
			} else if(dir === 's') {
				dir = 270;
			} else if(dir === 'se') {
				dir = 315;
			}
			dir = parseFloat(dir);
			
			var dist = Math.min(
				Math.abs(1 / Math.cos(Math.PI / 180 * dir)),
				Math.abs(1 / Math.cos(Math.PI / 180 * (dir - 90))));
			this._slideOutPos[0] = this._slideInPos[0] + this.w * dist * Math.cos(Math.PI/180*dir);
			this._slideOutPos[1] = this._slideInPos[1] - this.h * dist * Math.sin(Math.PI/180*dir);
		}
		
		this.timeout(function() {
			this._slide();
		}, this._delay * 1000);
	},
	
	_slide:
	function() {
		this.attr({ _phX: this._slideInPos[0], _phY: this._slideInPos[1] })
			.tween({ _phX: this._slideOutPos[0], _phY: this._slideOutPos[1] }, this._slideOutTime * 1000)
			.timeout(function() {
				this.timeout(function() {
					this.tween({ _phX: this._slideInPos[0], _phY: this._slideInPos[1] }, this._slideInTime * 1000)
						.timeout(function() {
							this.timeout(this._slide, this._slideInDelay * 1000);
						}, this._slideInTime * 1000);
				}, this._slideOutDelay * 1000);
			}, this._slideOutTime * 1000);
	}
});

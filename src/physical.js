
/**
 * Crafty component that carries out physics ticks in order.
 *
 * This is so that we can have a more controlled sequence that can be relied
 * upon to execute in a specific order.
 */
Crafty.c("PhysicsTicker", {
	
	enabled: true,
	
	init:
	function() {
		this.bind("EnterFrame", function() {
			if(this.enabled) {
				Crafty.trigger("PrePhysicsTick");
				Crafty.trigger("EvaluateAccel");
				Crafty.trigger("UpdateCollisions");
				Crafty.trigger("EvaluateHits");
				Crafty.trigger("ResolveConstraint");
				Crafty.trigger("EvaluateInertia");
			}
			Crafty.trigger("UpdateDraw");
			Crafty.trigger("UpdateViewport");
		});
	}
});

/**
 * Crafty component for being affected by basic tile collision response.
 *
 * This component only evaluates acceleration--other components need to be added
 * for traditional realistic collision response.
 *
 * _phX/Y is the next position of the physical object. This can be set to a
 *        offset from previous position to set velocity or increased from its
 *        current value to accelerate.
 *
 * _phPX/PY is the previous position of the physical object. This can be used
 *          as a basis for setting a new velocity.
 *
 * _phAX/AY can be used to set an acceleration that will be applied upon the
 *          next call to EvaluateAccel. Since this is a platformer, realistic
 *          accelerations probably won't be much use.
 */
Crafty.c("Physical", {
	
	init:
	function() {
		this._phX = this._x;
		this._phY = this._y;
		this._phPX = this._phX;
		this._phPY = this._phY;
		this._phAX = 0.0;
		this._phAY = 0.0;
		
		this.bind("EvaluateAccel", function() {
			// Seconds per frame.
			var sPerF = 1.0 / Crafty.timer.FPS();
			// Apply acceleration to velocity. Since velocity is stored as the
			// difference between the prev frame and the next, apply as
			// p += a * t^2
			this._phX += this._phAX * sPerF * sPerF;
			this._phY += this._phAY * sPerF * sPerF;
			this._phAX = 0.0;
			this._phAY = 0.0;
		});
	},
	
	setPhysPos:
	function(x, y) {
		this._phX = x;
		this._phY = y;
		this._phPX = x;
		this._phPY = y;
	},
	
	getDX:
	function() {
		return this._phX - this._phPX;
	},
	
	getDY:
	function() {
		return this._phY - this._phPY;
	},
	
	getDisplacement:
	function() {
		return [this.getDX(), this.getDY()];
	}
});

/**
 * A simple physics graphic updater. Updates the entity's x and y coordinates to
 * match the physics coordinates after each physics tick.
 */
Crafty.c("DefaultPhysicsDraw", {
	init:
	function() {
		this.bind("UpdateCollisions", function() {
			this.x = this._phPX;
			this.y = this._phPY;
		});
		this.bind("UpdateDraw", function() {
			if(this._override) {
				this._override = false;
				this.x = Math.round(this._overrideX);
				this.y = Math.round(this._overrideY);
			} else {
				this.x = Math.round(this._phPX);
				this.y = Math.round(this._phPY);
			}
		});
	}
});

/**
 * Applies a hazard response, such that the entity will be notified upon
 * collision with hazardous objects.
 */
Crafty.c("HazardResponse", {
	init:
	function() {
		this.bind("EvaluateHits", function() {
			this.x = this._phX;
			this.y = this._phY;
			var hits = this.hit("Hazard");
			for(var i in hits) {
				var hit = hits[i];
				this.trigger("Hurt", hit);
			}
		});
	}
});

/**
 * Applies a simple tile constraint on the attached physical entity, forcing it
 * to remain outside of tiles.
 */
Crafty.c("TileConstraint", {
	init:
	function() {
		this.requires("Physical");
		
		this.currentNormals = [];

		// Tracks phaseable component that this is in the process of dropping through
		this._phaseableInProgress;

		// Boolean set to true when object wants to phase through a phaseable beneath it
		this.attemptPhase = false;

		this.bind("ResolveConstraint", function() {
			this.currentNormals = [];
			/*
			 * Try 20 times, since there could only possibly be 20 tiles next
			 * to you at once, right?
			 * This may remain, since Crafty doesn't provide a way to test
			 * against a single entity. (And this collision lookup IS optimized
			 * with a spatial map.)
			 * Collisions can't simply be looped through, since when the player
			 * overlaps two tiles, both emit a collision! This results in double
			 * the force required being applied, making things bounce. No good.
			 */
			for(var i = 20; i >= 0; --i) {
				this.x = this._phX;
				this.y = this._phY;
				// Find the first hit, process that.
				var hit = this.hitTile();
				
				if(!hit)
					break;
				
				// Just resolve it lazily, yay verlet integration.
				var norm = hit.normal;
				var overlap = scale([norm.x, norm.y], -hit.overlap);
				this._phX += overlap[0];
				this._phY += overlap[1];
				
				// Maintain a "current normals" list in case other components
				// (such as platforming physics) are interested.
				this.currentNormals.push(overlap);
			}

			if (this._phaseableInProgress) {
				this.y = this._phY;
				this.y++;
				var hits = this.hit("Tile");
				this.y--;

				var stillPhasing = false;
				for(var j in hits) {
					var hit = hits[j];
					var ob = hit.obj;
					if (this._phaseableInProgress === ob) {
						stillPhasing = true;
						break;
					}
				}
				if (!stillPhasing) {
					this._phaseableInProgress = null;
				} else {
					// This catches the case that we are halfway between a phaseable and
					// non-phaseable tile, in which case the phase needs to be cancelled
					// or else the object could drop through the phaseable platform after
					// moving onto it long after the double-press
					var grounded = false;
					for(var i = this.currentNormals.length - 1; i >= 0; --i) {
						var x = this.currentNormals[i][0];
						var y = this.currentNormals[i][1];
						var d = Math.sqrt(x*x + y*y);
						var n = [x/d, y/d]
						if(dot(n, [0,-1]) > 0) {
							grounded = true;
							break;
						}
					}
					if (grounded) {
						this._phaseableInProgress = null;
					}
				}
			}
		});
	},
	
	/**
	 * Check for valid collision with tile.
	 * Parameters:
	 *     component: string (optional) - component to check for, in addition to
     *         Tile component
	 *     sensor: object (optional) - alternate object to use as a sensor
	 * Returns hit info if there was a collision, false otherwise.
     * Examples:
     *  // check for hits against Tiles with the Wood component
     *  hitTile("Wood")
     *  // check for hits against Tiles with the object sensor1
     *  hitTile(sensor1)
     *  // checks for hits against Tiles with the Wood component with the object
     *  // sensor1
     *  hitTile("Wood", sensor1)
	 */
	hitTile:
	function() {
		var sensor = this;
		var component = null;
		if(arguments.length === 1) {
			if(typeof arguments[0] === "string") {
				component = arguments[0];
			} else {
				sensor = arguments[0];
			}
		} else if(arguments.length === 2) {
			component = arguments[0];
			sensor = arguments[1];
		}
		var hits = sensor.hit("Tile");
		for(var j in hits) {
			var hit = hits[j];
			var ob = hit.obj;
			if((!component || ob.has(component)) && !(ob.has("Phaseable") && this._phaseableInProgress === ob)) {
				var norm = hit.normal;
				var overlap = scale([norm.x, norm.y], -hit.overlap);
				var prevDisplacement = this.getDisplacement();
				if(ob.has("Phaseable") && this.attemptPhase) {
					this._phaseableInProgress = ob;
				} else if(ob.has("OneWay")) {
					if(this._oneWayCollides(overlap, prevDisplacement)) {
						return hit;
					}

				} else {
					return hit;
				}
			}
		}
		this.attemptPhase = false;
		return false;
	},
	
	_oneWayCollides:
	function(overlap, prevDisplacement) {
		return -overlap[1] >= Math.abs(overlap[0])
			&& dot(overlap, add(overlap, prevDisplacement)) <= 1.0;
	}
});

/**
 * Applies a platform constraint on the entity, such that the entity lying on
 * the platform will move with it.
 */
Crafty.c("PlatformConstraint", {
	init:
	function() {
		this.requires("TileConstraint");
		this.bind("ResolveConstraint", function() {
			this.x = this._phX;
			this.y = this._phY;
			this.y++;
			var hit = this.hitTile("MovingPlatform");
			this.y--;
			if(hit) {
				var platform = hit.obj;
				this._phX += platform.getDX();
				this._phY += platform.getDY();
				
				this._override = true;
				this._overrideX = platform._phX + Math.round(this._phX - platform._phX);
				this._overrideY = platform._phY + Math.round(this._phY - platform._phY);
			}
		});
	}
});

/**
 * Apply a simple, constant acceleration downwards on the physical entity.
 */
Crafty.c("PhysicsGravity", {
	init:
	function() {
		this.bind("PrePhysicsTick", function() {
			this._phAY += 280;
		});
	}
});

/**
 * Intertia application, as per verlet integration. Kept separate in case
 * "special" objects need to be simulated. (Like player physics.)
 */
Crafty.c("Inertia", {
	init:
	function() {
		this.bind("EvaluateInertia", function() {
			var px = this._phPX;
			var py = this._phPY;
			this._phPX = this._phX;
			this._phPY = this._phY;
			this._phX += this._phX - px;
			this._phY += this._phY - py;
		});
	},
	
	applyImpulse:
	function(px, py) {
		this._phX = this._phPX + px;
		this._phY = this._phPY + py;
	}
});

/**
 * "Fake" inertia that responds to movement of object but does not continue
 * movement, such as a moving platform.
 */
Crafty.c("FakeInertia", {
	init:
	function() {
		this.bind("EvaluateInertia", function() {
			this._phPX = this._phX;
			this._phPY = this._phY;
		});
	}
});

//---------------------------
// Common physics vector math.
// Assumes vectors in form [x,y]

// Returns the dot product of v1 and v2.
function dot(v1, v2) {
	return v1[0]*v2[0] + v1[1]*v2[1];
}

// Returns the "right" (+rotation in this orientation) normal.
function rNormal(v) {
	return [-v[1], v[0]];
}

// Returns the normalized version of the given vector.
function norm(v) {
	var x = v[0];
	var y = v[1];
	var d = Math.sqrt(x*x + y*y);
	return [x/d, y/d];
}

function dist2(v) {
	var x = v[0];
	var y = v[1];
	return x*x + y*y;
}

function dist(v) {
	return Math.sqrt(dist2(v));
}

// Returns v1 + v2
function add(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

// Returns v1 - v2
function sub(v1, v2) {
	return [v1[0] - v2[0], v1[1] - v2[1]];
}

// Returns v * scalar
function scale(v, scalar) {
	return [v[0]*scalar, v[1]*scalar];
}

// Returns angle of v w/r to x axis, in degrees
function angle(v) {
	return Math.atan2(-v[1], v[0]) * 180 / Math.PI;
}

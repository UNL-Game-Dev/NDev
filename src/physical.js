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
		
		return this;
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
	},
	
	applyImpulse:
	function(px, py) {
		// Only apply impulse to free bodies.
		if(!this.has("Fixed")) {
			this._phX += px;
			this._phY += py;
		}
		// Notify component of impulse.
		this.trigger("Impulse", [px, py]);
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
		this.requires("Physical, Collision");
		
		this._minCrushAngle = 157.5;
		this._minCrushOverlap = 2.5;
		
		this.currentHits = [];

		// Tracks phaseable component that this is in the process of dropping through
		this._phaseableInProgress;

		// Boolean set to true when object wants to phase through a phaseable beneath it
		this.attemptPhase = false;

		this.bind("ResolveConstraint", function() {
			this.currentHits = [];
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
			var prevX = this._phX, prevY = this._phY;
			for(var i = 20; i >= 0; --i) {
				this.x = this._phX;
				this.y = this._phY;
				// Find the first hit, process that.
				var hit = this.hitTile();
				
				if(!hit)
					break;
				
				// Just resolve it lazily, yay verlet integration.
				var norm = [hit.normal.x, hit.normal.y];
				var overlap = scale(norm, -hit.overlap);
				
				this._phX += overlap[0];
				this._phY += overlap[1];
				
				// Maintain a "current hits" list in case other components
				// (such as platforming physics) are interested.
				this.currentHits.push(hit);
			}

			// If object is in the process of phasing through an object,
			// check if they're all the way through
			if (this._phaseableInProgress) {
				var hits = this.hit("Tile");

				var stillPhasing = false;
				for(var j in hits) {
					var hit = hits[j];
					var ob = hit.obj;
					// If object hits the phaseable we are probably still phasing
					// (unless we are in contact with a phaseable and non-phaseable
					// as checked below)
					if (this._phaseableInProgress === ob) {
						stillPhasing = true;
						break;
					}
				}
				if (!stillPhasing) {
					// no longer phasing cancel effect
					this._phaseableInProgress = null;
				} else {
					// This catches the case that we are halfway between a phaseable and
					// non-phaseable tile, in which case the phase needs to be cancelled
					// or else the object could drop through the phaseable platform after
					// moving onto it long after the double-press
					if (this.hitNormal([0,-1])) {
						// Another non-phaseable tile is keeping us from phasing
						// Cancel the phase.
						this._phaseableInProgress = null;
					}
				}
			}
			
			// Check if object is being crushed, and fire event to notify.
			var currentNormals = [];
			_(this.currentHits).each(function(hit) {
				if(hit.overlap < -this._minCrushOverlap) {
					currentNormals.push(hit.normal);
				}
			}, this);
			if(this._vectorsWithAngle(currentNormals, this._minCrushAngle)) {
				if(this.__c.Player) {
					console.log(prevX, prevY);
				}
				this.trigger("Crush");
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
			
			// Don't register collision with itself.
			if(ob === this) {
				continue;
			}

			// If we're phasing through the tile, don't register hit
			if (this._phaseableInProgress === ob) {
				continue;
			}

			// If we're filtering by component and this tile doesn't have it, don't register hit
			if (component && !ob.has(component)) {
				continue;
			}

			// If phaseable tile and object is attempting phase, don't register hit 
			if (ob.has("Phaseable") && this.attemptPhase) {
				if (ob.has("Platform")) {
					this._phX += ob.getDX()*2;
					this._phY += ob.getDY()*2;
				}
				this._phaseableInProgress = ob;
				continue;
			}

			// If object is going up through one-way, don't register hit
			if(ob.has("OneWay")) {
				var norm = hit.normal;
				var overlap = scale([norm.x, norm.y], -hit.overlap);
				var prevDisplacement = this.getDisplacement();
				if(!this._oneWayCollides(overlap, prevDisplacement)) {
					continue;
				}
			}

			return hit;
		}
		this.attemptPhase = false;
		return false;
	},
	
	/**
	 * Check for collision with a given normal. Returns the first object hit
	 * that has the given component, with a dot product with the given normal
	 * above a threshold.
	 */
	hitNormal:
	function(targetNorm, component, threshold) {
		// Threshold defaults to 0.
		threshold = threshold || 0;
		
		// Search through all hits for the desired normal.
		for(var i = this.currentHits.length - 1; i >= 0; --i) {
			var hit = this.currentHits[i];
			var norm = [hit.normal.x, hit.normal.y];
			if(dot(norm, targetNorm) > threshold) {
				var ob = hit.obj;
				if(!component) {
					return ob;
				}
				
				if(ob.has(component)) {
					return ob;
				}
			}
		}
		
		return false;
	},
	
	hitEntity:
	function(ent) {
		var id = ent[0];
		return _(this.currentHits).any(function(hit) {
			return hit.obj[0] === id;
		});
	},
	
	_oneWayCollides:
	function(overlap, prevDisplacement) {
		return -overlap[1] >= Math.abs(overlap[0])
			&& dot(overlap, add(overlap, prevDisplacement)) <= 1.0;
	},
	
	/**
	 * Check to see if there exists a pair of vectors in a set of vectors
	 * whose angle is greater than the given threshold.
	 */
	_vectorsWithAngle:
	function(vectors, threshold) {
		// TODO: Please fix if there is a more efficient (better than
		// n^2) way of doing this.
		var dotThreshold = Math.cos(threshold * Math.PI / 180);
		for(var i = 0; i < vectors.length - 1; i++) {
			for(var j = i + 1; j < vectors.length; j++) {
				var v1 = vecToList(vectors[i]);
				var v2 = vecToList(vectors[j]);
				if(dot(v1, v2) < dotThreshold) {
					return true;
				}
			}
		}
		return false;
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
				this._overrideX = platform._phX
					+ Math.round(this._phX - platform._phX);
				this._overrideY = platform._phY
					+ Math.round(this._phY - platform._phY);
			}
		});
	}
});

/**
 * Constrains an entity to be within a certain distance of another entity.
 */
Crafty.c("DistanceConstraint", {
	init:
	function() {
		this.requires("2D, Physical");
		this._target = null;
		this._maxDistance = 0;
		this._myOffset = [ 0, 0 ];
		this._targetOffset = [ 0, 0 ];
		this.bind("ResolveConstraint", function() {
			if(this._target) {
				var myPos = add(
					[this._phX, this._phY],
					this._myOffset);
				var targetPos = add(
					[this._target.x, this._target.y],
					this._targetOffset);
				var offset = sub(
					targetPos,
					myPos);
				var distance = dist(offset);
				
				if(distance > this._maxDistance) {
					var norm = normalized(offset);
					var posOffset = scale(norm, distance - this._maxDistance);
					this.applyImpulse(posOffset[0], posOffset[1]);
				}
			}
		});
	},
	
	distanceConstraint:
	function(target, distance, myOffset, targetOffset) {
		
		// If no arguments were passed, get info about the constraint.
		if(arguments.length === 0) {
			return this._target ? {
				target: this._target,
				targetPos: add([this._target.x, this._target.y], this._targetOffset),
				myPos: add([this._phX, this._phY], this._myOffset),
				actualDistance: dist(sub(
					add([this.x, this.y], this._myOffset),
					add([this._target.x, this._target.y], this._targetOffset)))
			} : null;
		}
		
		this._target = target || this._target;
		this._maxDistance = distance;
		this._myOffset = myOffset || this._myOffset || [ 0, 0 ];
		this._targetOffset = targetOffset || this._targetOffset || [ 0, 0 ];
	},
	
	cancelDistanceConstraint:
	function() {
		this._target = null;
	}
});

function debug(x, y) {
	var w = 2;
	if(_(x).isArray()) {
		y = x[1];
		x = x[0];
	}
	Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x + w, y: y + w, w: 2 * w, h: 2 * w, z: 100 });
	Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x - 3 * w, y: y + w, w: 2 * w, h: 2 * w, z: 100 });
	Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x - 3 * w, y: y - 3 * w, w: 2 * w, h: 2 * w, z: 100 });
	Crafty.e("2D, Canvas, Color").color("#ff00ff").attr({ x: x + w, y: y - 3 * w, w: 2 * w, h: 2 * w, z: 100 });
}

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
	}
});

/**
 * "Fake" inertia that responds to movement of object but does not continue
 * movement, such as a moving platform.
 */
Crafty.c("FakeInertia", {
	init:
	function() {
		this.requires("Fixed")
			.bind("EvaluateInertia", function() {
				this._phPX = this._phX;
				this._phPY = this._phY;
			});
	}
});

/**
 * Ground friction. 
 */
Crafty.c("GroundFriction", {
	init:
	function() {
		this.requires("Physical, TileConstraint, DefaultPhysicsDraw");
		
		this.bind("PrePhysicsTick", function() {
			if(this.hitNormal([0,-1], "Tile")) {
				var vx = this._phX - this._phPX;
				vx = floorToZero(vx / 2);
				this._phX = this._phPX + vx;
			}
		});
	}
});

function vecToList(v) {
	return [v.x, v.y];
}

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
function normalized(v) {
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

function floorToZero(x) {
	return x > 0 ? Math.floor(x) : Math.ceil(x);
}

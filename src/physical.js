
/**
 * Crafty component that carries out physics ticks in order.
 */
Crafty.c("PhysicsTicker", {

	init:
	function() {
		this.bind("EnterFrame", function() {
			Crafty.trigger("EvaluateAccel");
			Crafty.trigger("ResolveConstraint");
			Crafty.trigger("EvaluateInertia");
			Crafty.trigger("UpdateDraw");
		});
	}

});

/**
 * Crafty component for being affected by basic tile collision response.
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

		this.shapeBox(0.875/2.0, 0.875/2.0);

		this.bind("EvaluateAccel", function() {
			// Debug gravity.
			// TODO: Move this into its own component.
			this._phAY += 9.8;
			this._phAX += 0.1;
			// Seconds per frame.
			var sPerF = 1.0 / Crafty.timer.getFPS();
			// Apply acceleration to velocity. Since velocity is stored as the
			// difference between the prev frame and the next, apply as
			// p += a * t^2
			this._phX += this._phAX * sPerF * sPerF;
			this._phY += this._phAY * sPerF * sPerF;
			this._phAX = 0.0;
			this._phAY = 0.0;
		}).bind("ResolveConstraint", function() {
			var map = Crafty("TiledMap");
			var colResponse = map.resolvePos(
				this._phX+0.5, this._phY+1.0, this.shape
			);
			for(var i = colResponse.length - 1; i >= 0; --i) {
				var response = colResponse[i];
				this._phX += response[0];
				this._phY += response[1];
			}
		}).bind("EvaluateInertia", function() {
			var px = this._phPX;
			var py = this._phPY;
			this._phPX = this._phX;
			this._phPY = this._phY;
			this._phX += this._phX - px;
			this._phY += this._phY - py;
		}).bind("UpdateDraw", function() {
			this.x = (this._phPX + 0.875/2.0) * 32;
			this.y = (this._phPY + 0.875/2.0) * 32;
		});
	},

	shapeBox:
	function(xRadius, yRadius) {
		this.shape = new Poly([
			[-xRadius, -yRadius],
			[xRadius, -yRadius],
			[xRadius, yRadius],
			[-xRadius, yRadius],
		]);
	},

	setPhysPos:
	function(x, y) {
		this._phX = x;
		this._phY = y;
		this._phPX = x;
		this._phPY = y;
	}

});

//---------------------------
// Polygon class.
// Can give you useful information about its sides and normals wrt SAT.

// Constructed with a right-handed list of points. (Clockwise here.)
function Poly(pts) {
	this.segs = [];
	var pprev = pts[pts.length-1];
	for(var i = 0; i < pts.length; ++i) {
		var p = pts[i];
		this.segs.push([
			pprev[0], pprev[1],
			p[0]-pprev[0], p[1]-pprev[1]
		]);
		pprev = p;
	}
	this.pts = pts;
}

// Returns [min,max] scalar offsets on the normal n.
// Centers around p! Will need to add/subtract p distance along n for these
// values to be meaningful, probably.
// Assumes normal is normalized.
Poly.prototype.minMaxOnNormal = function(n, addin) {
	if(addin == undefined)
		addin = 0;
	var minVal = Number.MAX_VALUE;
	var maxVal = Number.MIN_VALUE;
	for(var i = this.pts.length - 1; i >= 0; --i) {
		var ndotp = dot(n, this.pts[i]);
		if(ndotp < minVal)
			minVal = ndotp;
		if(ndotp > maxVal)
			maxVal = ndotp;
	}
	return [minVal + addin, maxVal + addin];
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


//---------------------------
// Vector utility functions

function vecToList(v) {
    return [v.x, v.y];
}

/** Evaluate a vector in one of the following forms:
 *     [x,y]
 *     object with x, y properties
 *     point name, e.g. "origin"
 *     function returning a point
 * Parameters:
 *     vec: the vector to be evaluated
 *     ent (optional): the entity to use as a context for the vector. The
 *         entity's position will be added to the vector, and if the entity has
 *         SpriteData defined, it can be used to get the vector by name.
 * Returns: the evaluated vector in the form [x,y].
 */

function evalVector(vector, ent) {
    var _vector = _(vector);
    if(_vector.isArray() && vector.length === 2) {
        if(ent) {
            return add(vector, [ent.x, ent.y]);
        } else {
            return vector;
        }
    } else if(_vector.isObject() && _vector.has("x") && _vector.has("y")) {
        if(ent) {
            return add([vector.x, vector.y], [ent.x, ent.y]);
        } else {
            return [vector.x, vector.y];
        }
    } else if(_vector.isString()) {
        if(ent && ent.has("SpriteData")) {
            return add(ent.getVector(vector) || [0, 0], [ent.x, ent.y]);
        } else {
            return [ent.x, ent.y];
        }
    } else if(_vector.isFunction()) {
        if(ent) {
            return add(vector.call(ent), [ent.x, ent.y]);
        } else {
            return vector();
        }
    } else {
        if(ent) {
            return [ent.x, ent.y];
        } else {
            return [0, 0];
        }
    }
}

// Floor a value towards zero (i.e. ceiling for negative numbers)
function floorToZero(x) {
    return x > 0 ? Math.floor(x) : Math.ceil(x);
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

function rotate(pt, angle) {
    var result = [
        pt[0] * Math.cos(angle * Math.PI / 180) - pt[1] * Math.sin(angle * Math.PI / 180),
        pt[0] * Math.sin(angle * Math.PI / 180) + pt[1] * Math.cos(angle * Math.PI / 180)
    ];

    return result;
}

function getOrientationAngle(data) {
    var angles = {
        r: {
            n: -90,
            ne: -45,
            e: 0,
            se: 45,
            s: 90,
            sw: 135,
            w: 180,
            nw: -135
        },
        l: {
            n: 90,
            ne: 135,
            e: 180,
            se: -135,
            s: -90,
            sw: -45,
            w: 0,
            nw: 45
        }
    };
    var result = data ? angles[data.facing][data.orientation] : 0;
    return result;
}

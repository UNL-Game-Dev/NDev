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
        }
});/**
 * Created by samadams on 3/14/15.
 */

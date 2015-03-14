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

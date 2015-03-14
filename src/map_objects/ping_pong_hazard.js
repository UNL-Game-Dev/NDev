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

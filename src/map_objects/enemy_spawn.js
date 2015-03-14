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
});/**
 * Created by samadams on 3/14/15.
 */

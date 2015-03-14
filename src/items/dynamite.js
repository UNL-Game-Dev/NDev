/**
 * Dynamite item.
 */
Crafty.c('DynamiteItem', {

    init:
        function() {
            this.requires('2D, Attachable');
            this.bind('ItemAttach', function(data) {
                var owner = data.owner;
                this.attachTo(owner, 'hand.R');
            });
            this.bind('ItemActivate', function(data) {
                var dynamite = Crafty.e('Dynamite');
                dynamite.setPhysPos(
                    this.x - dynamite.w / 2,
                    this.y - dynamite.h / 2);
                dynamite.ignite();

                dynamite._phX = dynamite._phPX + data.params.direction[0] * 3;
                dynamite._phY = dynamite._phPY + data.params.direction[1] * 3;
            });
        }
});

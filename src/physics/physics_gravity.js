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

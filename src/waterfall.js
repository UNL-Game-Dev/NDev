
Crafty.c('Waterfall', {
    init:
    function() {
        this.requires('SpriteAnimation, Collision, Sensor');
        this._child = null;
    },

    waterfall:
    function(waterfallAnimation, depth) {

        if(depth === undefined) {
            depth = 10;
        }

        this._depth = depth;
        this._waterfallAnimation = waterfallAnimation;

        this.bind('EnterFrame', this._propagate);
    },

    _propagate:
    function() {
        var blocked = this._isBlocked();
        if(!this._child) {
            var sensedChild = this._senseChild();
            if(sensedChild) {
                this._child = sensedChild;
            } else if(!blocked) {
                var child = Crafty
                    .e('2D, Canvas, Sprite, SpriteAnimation, Waterfall')
                    .attr({
                        x: this.x,
                        y: this.y + this.h,
                        z: this.z
                    });
                Crafty('SpriteLoader').loadAnimation(child, this._waterfallAnimation);
                child.waterfall(this._waterfallAnimation, self._depth - 1);
                this.attach(child);
                this._child = child;
                this._child.animate(this._waterfallAnimation, -1);

                var ent = this;
                while(ent) {
                    ent.resetAnimation();
                    ent = ent._parent;
                }
            }
        } else {
            if(blocked) {
                this._child.destroy();
                this._child = null;
            }
        }
    },

    _isBlocked:
    function() {
        var self = this;
        var hits = self.hit('Tile') || [];

        //if(hits.length > 0) {
        //    console.log(hits);
        //}

        return hits.length > 0 ? true : false;
        /*_(hits).each(function(hit) {
            return hit.obj.z === self.z
            && hit.obj.x <= self.x
            && hit.obj.x + hit.obj.w >= self.x + self.w;
        }).any();

        return blocked;*/
    },

    _senseChild:
    function() {
        var senseHit = this.sense('Waterfall', 0, 5)[0];
        return senseHit ? senseHit.obj : null;
    }
});

/**
 * Harpoon item.
 */
Crafty.c('HarpoonItem', {
    init:
        function() {
            this.requires('2D, Canvas, Sprite, Tween, SpriteData, Attachable').setSprite('harpoon');

            this.visible = false;

            // The maximum length of the harpoon line.
            this._maxLength = 128;
            this._minLength = 24;
            this._thresholdLength = 32;

            // The firing direction.
            this._direction = [1, 0];

            // The current line length.
            this._length = 0;

            // The shooting speed of the line, in pixels/sec.
            this._speed = 512;

            // The entity using the harpoon.
            this._owner = null;

            // Whether or not the harpoon is being fired or attached to something.
            this._active = false;

            // Whether or not the harpoon is attached to something.
            this._attached = false;

            // Time for the harpoon to reel in.
            this._reelTime = 0.3;

            var thickness = 2;

            // The line entity.
            this._line = Crafty.e('2D, Canvas, Color, Collision, Attachable')
                .attr({
                    x: this.x,
                    y: this.y - thickness / 2,
                    w: 0,
                    h: thickness,
                    z: 100
                })
                .color('#000000')
                .origin(0, thickness / 2)
                .attachTo(this, 'tip');

            this.bind('ItemAttach', function(data) {
                this._owner = data.owner.addComponent('DistanceConstraint');
                var owner = this._owner;
                this.attachTo(this._owner, 'hand.R', {
                    visible: function(data) { return !!data; },
                    rotation: _.constant(0),
                    flipped: function() { return owner.dxSelect(true, false); }
                });
                this.attached = false;
            });
            this.bind('ItemActivate', function(data) {
                if(this._active) {
                    if(this._attached) {
                        var distance = dist(this._owner.getRelativePosition());
                        if(distance < this._thresholdLength) {
                            this.deactivate();
                        } else {
                            this.reel();
                        }
                    }
                } else if(this.visible) {
                    this.fire(data.params.direction);
                }
            });
            this.bind('ItemEquip', function() {
                this.attached = true;
                this.visible = true;
            });
            this.bind('ItemUnequip', function() {
                this.attached = false;
                this.deactivate();
            });
            this.bind('EnterFrame', function() {
                this._line.visible = this._active;
                if(this._active) {
                    if(this._attached) {
                        // Update the length of the distance constraint to match the
                        // length of the line, and offset by the tip position.
                        this._owner.distanceConstraint(null, this._length);

                        // Orient the harpoon line towards the target position.
                        var relPos = this._owner.getRelativePosition();
                        relPos = [Math.round(relPos[0]), Math.round(relPos[1])];

                        this._line.attr({
                            rotation: Math.atan2(relPos[1], relPos[0]) * 180 / Math.PI,
                            w: dist(relPos)
                        });

                        if(this._reeling) {
                            if(this._owner.hitNormal(scale(relPos, -1))) {
                                this.deactivate();
                            }
                        }
                    } else {
                        this._line.attr({ w: this._length });

                        var hits = this._line.hit('Tile');
                        if(hits) {
                            this.cancelTween('_length');

                            while(this._line.hit('Tile') && this._line.w > 10) {
                                this._line.w--;
                            }
                            this._length = this._line.w;


                            // Attach owner to object when object is hit.
                            var target = hits[0].obj;
                            var harpoonPos = [
                                this.x + this._length * this._direction[0],
                                this.y + this._length * this._direction[1]
                            ];
                            var targetOffset = sub(
                                harpoonPos,
                                [target.x, target.y]);

                            this._owner.distanceConstraint(
                                target,
                                this._length,
                                'tip',
                                targetOffset,
                                this);

                            this.attr({ _attached: true });

                            this._owner.trigger('HarpoonAttached');
                        }
                        if(this._length >= this._maxLength) {
                            // Deactivate when harpoon line reaches full extent and
                            // nothing is hit.
                            this.deactivate();
                        }
                    }
                }
            });
        },

    /**
     * Fire the harpoon gun.
     */
    fire:
        function(dir) {

            var time = this._maxLength / this._speed * 1000;

            this._direction = dir || this._direction;
            this._line.attr({
                rotation: Math.atan2(dir[1], dir[0]) * 180 / Math.PI
            });
            this.attr({ _length: 0, _active: true, _attached: false })
                .tween({ _length: this._maxLength }, time);

            this.animate('fire');
            this.one('AnimationEnd', function(data) {
                if(data.id === 'fire') {
                    this.animate('idle');
                }
            });

            return this;
        },

    /**
     * Reel in the harpoon, drawing the owner towards the target entity.
     */
    reel:
        function() {
            this.attr({ _reeling: true });
            this.tween({ _length: this._minLength }, this._reelTime * 1000);
            this.timeout(function() { this._reeling = false; }, this._reelTime * 1000);

            return this;
        },

    /**
     * Deactivate the harpoon and unattach it from everything.
     */
    deactivate:
        function() {
            this._owner.cancelDistanceConstraint();
            this._owner.trigger('HarpoonUnattached');
            this.cancelTween('_length');
            this.attr({
                _length: 0,
                _active: false,
                _attached: false,
                _reeling: false
            });

            return this;
        }
});

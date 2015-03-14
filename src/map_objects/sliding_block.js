/**
 * Block that slides in and out from a certain direction.
 * Base usage: x,y
 * Properties
 *     time
 *         Time to wait, in seconds, between sliding in and sliding out.
 *         OR
 *         [slideTime, delayTime] where slideTime is the time to slide in and
 *         out, and delayTime is the time to wait between sliding in and out.
 *         OR
 *         [slideInTime, delayTime, slideOutTime] where slideInTime and
 *         slideOutTime are the durations of sliding in and out, respectively.
 *         OR
 *         [slideInTime, delayInTime, slideOutTime, delayOutTime] where
 *         delayInTime is the time to wait after sliding in, and delayOutTime is
 *         the time to wait after sliding out.
 *     delay
 *         Time to wait, in seconds, before initially sliding out.
 *     direction
 *         Direction to slide in and out from. Can be N/E/S/W/NE/etc. or an
 *         angle from x-axis, in degrees.
 */
Crafty.c("SlidingBlock", {
    init:
        function() {
            this.requires("2D, Canvas, Collision, Physical, Tile, Tween,"
            + "FakeInertia, DefaultPhysicsDraw");
        },

    mapObjectInit:
        function(object) {
            if(object.gid) {
                this.addComponent("Tile" + object.gid);
            }
            var x = object.x;
            var y = object.y - this.h;
            this.setPhysPos(x, y);
            this.x = x;
            this.y = y;

            // Default properties
            this._delay = 0.0;
            this._slideInTime = 0.25;
            this._slideInDelay = 1.0;
            this._slideOutTime = 0.25;
            this._slideOutDelay = 1.0;
            this._slideInPos = [x, y];
            this._slideOutPos = [x, y - this.h];

            var properties = object.properties;
            if(properties.time != undefined) {
                var time = JSON.parse(properties.time);

                if(typeof time === typeof 0) {
                    time = [time];
                }

                if(time.length === 1) {
                    this._slideInDelay = time[0];
                    this._slideOutDelay = time[0];
                } else if(time.length === 2) {
                    this._slideInTime = time[0];
                    this._slideInDelay = time[1];
                    this._slideOutTime = time[0];
                    this._slideOutDelay = time[1];
                } else if(time.length === 3) {
                    this._slideInTime = time[0];
                    this._slideInDelay = time[1];
                    this._slideOutTime = time[2];
                    this._slideOutDelay = time[1];
                } else if(time.length === 4) {
                    this._slideInTime = time[0];
                    this._slideInDelay = time[1];
                    this._slideOutTime = time[2];
                    this._slideOutDelay = time[3];
                }
            }
            if(properties.delay != undefined) {
                this._delay = properties.delay;
            }
            if(properties.direction != undefined) {
                var dir = properties.direction.toLowerCase();

                if(dir === 'e') {
                    dir = 0;
                } else if(dir === 'ne') {
                    dir = 45;
                } else if(dir === 'n') {
                    dir = 90;
                } else if(dir === 'nw') {
                    dir = 135;
                } else if(dir === 'w') {
                    dir = 180;
                } else if(dir === 'sw') {
                    dir = 225;
                } else if(dir === 's') {
                    dir = 270;
                } else if(dir === 'se') {
                    dir = 315;
                }
                dir = parseFloat(dir);

                var dist = Math.min(
                    Math.abs(1 / Math.cos(Math.PI / 180 * dir)),
                    Math.abs(1 / Math.cos(Math.PI / 180 * (dir - 90))));
                this._slideOutPos[0] = this._slideInPos[0]
                + this.w * dist * Math.cos(Math.PI/180*dir);
                this._slideOutPos[1] = this._slideInPos[1]
                - this.h * dist * Math.sin(Math.PI/180*dir);
            }

            // Schedule sliding
            var that = this;
            Crafty("Clock").schedule(function() { that._slide(); },
                this._delay,
                Infinity,
                this._slideOutTime + this._slideOutDelay
                + this._slideInTime + this._slideInDelay);
        },

    // Slide out and in once
    _slide:
        function() {
            this.attr({
                _phX: this._slideInPos[0],
                _phY: this._slideInPos[1]
            })
                .tween({
                    _phX: this._slideOutPos[0],
                    _phY: this._slideOutPos[1]
                }, this._slideOutTime * 1000)
                .timeout(function() {
                    this.tween({
                        _phX: this._slideInPos[0],
                        _phY: this._slideInPos[1]
                    }, this._slideInTime * 1000);
                }, (this._slideOutTime + this._slideOutDelay) * 1000);
        }
});

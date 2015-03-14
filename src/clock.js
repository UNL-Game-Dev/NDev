/**
 * Clock component. Keeps track of the universal game time and frame and
 * can schedule functions to be called periodically.
 */

Crafty.c("Clock", {
	init:
	function() {
		this.time = 0.0;
		this.frame = 0;
		this._pendingEvents = [];
		
		this.bind("EnterFrame", function(data) {
			this.time += data.dt / 1000;
			this.frame = data.frame;
			
			var lastEvent = -1;
			for(var i = 0; i < this._pendingEvents.length; i++) {
				var evt = this._pendingEvents[i];
				if(this.time >= evt.time) {
					lastEvent = i;
					evt.callback();
					// Repeat event if there are more repeats left
					if(evt.repeats > 0) {
						this._enqueueEvent({
							callback: evt.callback,
							time: evt.time + evt.repeatTime,
							repeats: evt.repeats - 1,
							repeatTime: evt.repeatTime
						});
					}
				}
			}
			// Remove expired events
			this._pendingEvents = this._pendingEvents.splice(lastEvent + 1);
		});
	},
	
	// Schedule a function to be called periodically after a delay.
	schedule:
	function(callback, delayTime, repeats, repeatTime) {
		if(repeats === undefined) {
			repeats = 0;
		} else if(repeats < 0) {
			repeats = Infinity;
		}
		this._enqueueEvent({
			callback: callback,
			time: this.time + parseFloat(delayTime),
			repeats: repeats,
			repeatTime: repeatTime || 0.0
		});
	},
	
	// Make an event pending.
	_enqueueEvent:
	function(newEvt) {
		// Insert in the right timing order into the queue
		for(var i = this._pendingEvents.length - 1; i >= 0; i--) {
			if(newEvt.time >= this._pendingEvents[i].time) {
				this._pendingEvents.splice(i + 1, 0, newEvt);
				return;
			}
		}
		this._pendingEvents.splice(0, 0, newEvt);
	}
});

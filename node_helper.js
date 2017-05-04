/* Magic Mirror
 * Node Helper: Buttons
 *
 * By Patrice Godard & Joseph Bethge
 * MIT Licensed.
 */

const MPR121 = require('adafruit-mpr121');
const mpr121  = new MPR121(0x5A, 1);
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    // Subclass start method.
    start: function() {
        var self = this;
        
        console.log("Starting node helper for: " + self.name);

        this.loaded = false;
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        if (notification === 'BUTTON_CONFIG') {     
            this.config = payload.config;

            this.intializeButtons();
        };
    },
    
    //init and setup touch event handlers   
    intializeButtons: function() {
        const self = this;

        if (self.loaded) {
            return;
        }

        self.buttons = self.config.buttons;

        for (var i = 0; i < self.buttons.length; i++) {
            console.log("Initialize button " + self.buttons[i].name + " on PIN " + self.buttons[i].pin);
            self.buttons[i].pressed = undefined;
        }

        self.loaded = true;
        // listen for touch events 
        mpr121.on('touch', (index) => { 
            console.log(`pin ${index} touched`);
            this.buttons[index].pressed = new Date().getTime();
            this.sendSocketNotification("BUTTON_DOWN", {
       		index: index
                });
	});
 
        // listen for release events 
        mpr121.on('release', (index) => {
		console.log(`pin ${index} released`);
		var start = self.buttons[index].pressed;
                var end = new Date().getTime(); 
                var time = end - start;

                self.buttons[index].pressed = undefined;

                 self.sendSocketNotification("BUTTON_UP", {
                    index: index,
                    duration: time
                });
	});
}
});

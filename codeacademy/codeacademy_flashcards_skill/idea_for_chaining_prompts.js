var promptQueue = [];

var launchHandlers = {
    "LaunchRequest": function () {
        promptQueue.push("Welcome to the game.");
        // Continue handling the response as though responding to
        // "StartGameIntent".
        this.emitWithState("StartGameIntent");
    },

    "StartGameIntent": function () {
        this.attributes['game'] = { ... };

        promptQueue.push("Player 1, it's your turn. How old are you?");

        this.handler.state = states.GET_AGE;

        // Welcome the user and ask his age.
        this.emit(':ask', promptQueue.join(" "));
    },

    ...
};

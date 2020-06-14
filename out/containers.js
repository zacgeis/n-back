import { Game } from "./game.js";
var SettingsContainer = /** @class */ (function () {
    function SettingsContainer(manager) {
        this.manager = manager;
        this.backCountValue = 0;
        this.speedValue = 0;
        this.positionValue = true;
        this.soundValue = true;
    }
    SettingsContainer.prototype.init = function () {
        this.containerElement = document.getElementById("settings");
        this.positionSettingElement = document.getElementById("position-setting-input");
        this.soundSettingElement = document.getElementById("sound-setting-input");
        this.backCountElement = document.getElementById("back-count-input");
        this.backCountDisplayElement = document.getElementById("back-count-display");
        this.speedElement = document.getElementById("speed-input");
        this.speedDisplayElement = document.getElementById("speed-display");
        this.startElement = document.getElementById("start-input");
        this.positionSettingElement.addEventListener("input", this.positionSettingHandler.bind(this));
        this.soundSettingElement.addEventListener("input", this.soundSettingHandler.bind(this));
        this.backCountElement.addEventListener("input", this.backCountHandler.bind(this));
        this.speedElement.addEventListener("input", this.speedHandler.bind(this));
        this.startElement.addEventListener("click", this.startHandler.bind(this));
        // Grab initial values.
        this.positionSettingHandler();
        this.soundSettingHandler();
        this.backCountHandler();
        this.speedHandler();
    };
    SettingsContainer.prototype.startHandler = function () {
        var params = {
            position: this.positionValue,
            sound: this.soundValue,
            backCount: this.backCountValue,
            speed: this.speedValue
        };
        this.manager.startGame(params);
    };
    SettingsContainer.prototype.positionSettingHandler = function () {
        this.positionValue = this.positionSettingElement.checked;
    };
    SettingsContainer.prototype.soundSettingHandler = function () {
        this.soundValue = this.soundSettingElement.checked;
    };
    SettingsContainer.prototype.backCountHandler = function () {
        this.backCountValue = Number(this.backCountElement.value);
        this.backCountDisplayElement.innerText = String(this.backCountValue);
    };
    SettingsContainer.prototype.speedHandler = function () {
        this.speedValue = Number(this.speedElement.value) * 0.1;
        this.speedDisplayElement.innerText = String(this.speedValue).substr(0, 3);
    };
    SettingsContainer.prototype.hide = function () {
        this.containerElement.classList.add("off-screen");
    };
    SettingsContainer.prototype.show = function () {
        this.containerElement.classList.remove("off-screen");
    };
    return SettingsContainer;
}());
var GameContainer = /** @class */ (function () {
    function GameContainer(manager) {
        this.manager = manager;
        this.game = null;
    }
    GameContainer.prototype.init = function () {
        this.containerElement = document.getElementById("game");
        this.positionElement = document.getElementById("position-input");
        this.soundElement = document.getElementById("sound-input");
        this.backElement = document.getElementById("back-button");
        this.canvasElement = document.getElementById("canvas");
        this.canvasContainerElement = document.getElementById("canvas-container");
        this.positionElement.addEventListener("click", this.positionHandler.bind(this));
        this.soundElement.addEventListener("click", this.soundHandler.bind(this));
        this.backElement.addEventListener("click", this.backHandler.bind(this));
    };
    GameContainer.prototype.positionHandler = function () {
        this.game.positionClick();
    };
    GameContainer.prototype.soundHandler = function () {
        this.game.soundClick();
    };
    GameContainer.prototype.backHandler = function () {
        this.endGame();
    };
    GameContainer.prototype.startGame = function () {
        this.canvasElement.width = this.canvasContainerElement.offsetWidth;
        this.canvasElement.height = this.canvasContainerElement.offsetHeight;
        this.game = new Game(this.canvasElement);
        this.game.start();
    };
    GameContainer.prototype.endGame = function () {
        this.game.end();
        this.game = null;
        this.manager.endGame();
    };
    GameContainer.prototype.hide = function () {
        this.containerElement.classList.add("off-screen");
    };
    GameContainer.prototype.show = function () {
        this.containerElement.classList.remove("off-screen");
    };
    return GameContainer;
}());
var Manager = /** @class */ (function () {
    function Manager() {
    }
    Manager.prototype.init = function () {
        this.settingsContainer = new SettingsContainer(this);
        this.gameContainer = new GameContainer(this);
        this.settingsContainer.init();
        this.gameContainer.init();
        this.gameContainer.hide();
    };
    Manager.prototype.startGame = function (params) {
        this.settingsContainer.hide();
        this.gameContainer.show();
        this.gameContainer.startGame();
    };
    Manager.prototype.endGame = function () {
        this.gameContainer.hide();
        this.settingsContainer.show();
    };
    return Manager;
}());
export { Manager };
//# sourceMappingURL=containers.js.map
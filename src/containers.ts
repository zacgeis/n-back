import { Game } from "./game.js"

class SettingsContainer {
  manager: Manager;

  containerElement: HTMLElement;
  positionSettingElement: HTMLInputElement;
  soundSettingElement: HTMLInputElement;
  backCountElement: HTMLInputElement;
  backCountDisplayElement: HTMLElement;
  speedElement: HTMLInputElement;
  speedDisplayElement: HTMLElement;
  startElement: HTMLElement;

  constructor(manager: Manager) {
    this.manager = manager;

  }

  init() {
    this.containerElement = document.getElementById("settings");
    this.positionSettingElement = <HTMLInputElement> document.getElementById("position-setting-input");
    this.soundSettingElement = <HTMLInputElement> document.getElementById("sound-setting-input");
    this.backCountElement = <HTMLInputElement> document.getElementById("back-count-input");
    this.backCountDisplayElement = document.getElementById("back-count-display");
    this.speedElement = <HTMLInputElement> document.getElementById("speed-input");
    this.speedDisplayElement = document.getElementById("speed-display");
    this.startElement = document.getElementById("start-input");

    this.backCountElement.addEventListener("input", this.backCountHandler.bind(this));
    this.speedElement.addEventListener("input", this.speedHandler.bind(this));
    this.startElement.addEventListener("click", this.startHandler.bind(this));

    // Set text to initial values.
    this.backCountHandler();
    this.speedHandler();
  }

  getBackCountValue() {
    return Number(this.backCountElement.value);
  }

  getSpeedValue() {
    return Number(this.speedElement.value) * 0.1;
  }

  getPositionValue(): boolean {
    return this.positionSettingElement.checked;
  }

  getSoundValue(): boolean {
    return this.soundSettingElement.checked;
  }

  startHandler() {
    let params = {
      position: this.getPositionValue(),
      sound: this.getSoundValue(),
      backCount: this.getBackCountValue(),
      speed: this.getSpeedValue(),
    };

    this.manager.startGame(params);
  }

  backCountHandler() {
    this.backCountDisplayElement.innerText = String(this.getBackCountValue());
  }

  speedHandler() {
    this.speedDisplayElement.innerText = String(this.getSpeedValue()).substr(0, 3);
  }

  hide() {
    this.containerElement.classList.add("off-screen");
  }

  show() {
    this.containerElement.classList.remove("off-screen");
  }
}

class GameContainer {
  manager: Manager;

  containerElement: HTMLElement;
  positionElement: HTMLElement;
  soundElement: HTMLElement;
  backElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  canvasContainerElement: HTMLElement;

  game: Game;

  constructor(manager: Manager) {
    this.manager = manager;
    this.game = null;
  }

  init() {
    this.containerElement = document.getElementById("game");
    this.positionElement = document.getElementById("position-input");
    this.soundElement = document.getElementById("sound-input");
    this.backElement = document.getElementById("back-button");
    this.canvasElement = <HTMLCanvasElement> document.getElementById("canvas");
    this.canvasContainerElement = document.getElementById("canvas-container");

    // Handle for mobile quick touches.
    this.positionElement.addEventListener("touchstart", this.positionHandler.bind(this));
    this.soundElement.addEventListener("touchstart", this.soundHandler.bind(this));
    this.backElement.addEventListener("touchstart", this.backHandler.bind(this));

    // Handle for desktop quick clicks.
    this.positionElement.addEventListener("mousedown", this.positionHandler.bind(this));
    this.soundElement.addEventListener("mousedown", this.soundHandler.bind(this));
    this.backElement.addEventListener("mousedown", this.backHandler.bind(this));
  }

  positionHandler(e: Event) {
    e.preventDefault();

    this.game.positionClick();
  }

  soundHandler(e: Event) {
    e.preventDefault();

    this.game.soundClick();
  }

  backHandler(e: Event) {
    e.preventDefault();

    this.endGame();
  }

  startGame() {
    this.canvasElement.width = this.canvasContainerElement.offsetWidth;
    this.canvasElement.height = this.canvasContainerElement.offsetHeight;

    this.game = new Game(this.canvasElement);
    this.game.start();
  }

  endGame() {
    this.game.end();
    this.game = null;

    this.manager.endGame();
  }

  hide() {
    this.containerElement.classList.add("off-screen");
  }

  show() {
    this.containerElement.classList.remove("off-screen");
  }
}

export class Manager {
  settingsContainer: SettingsContainer;
  gameContainer: GameContainer;

  init() {
    this.settingsContainer = new SettingsContainer(this);
    this.gameContainer = new GameContainer(this);

    this.settingsContainer.init();
    this.gameContainer.init();

    this.gameContainer.hide();
  }

  startGame(params) {
    this.settingsContainer.hide();
    this.gameContainer.show();
    this.gameContainer.startGame();
  }

  endGame() {
    this.gameContainer.hide();
    this.settingsContainer.show();
  }
}

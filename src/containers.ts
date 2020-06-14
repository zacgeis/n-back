import { Game } from "./game.js"

class SettingsContainer {
  manager: Manager;
  backCountValue: number;
  speedValue: number;
  positionValue: boolean;
  soundValue: boolean;

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

    this.backCountValue = 0;
    this.speedValue = 0;
    this.positionValue = true;
    this.soundValue = true;
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
  }

  startHandler() {
    let params = {
      position: this.positionValue,
      sound: this.soundValue,
      backCount: this.backCountValue,
      speed: this.speedValue,
    };

    this.manager.startGame(params);
  }

  positionSettingHandler() {
    this.positionValue = this.positionSettingElement.checked;
  }

  soundSettingHandler() {
    this.soundValue = this.soundSettingElement.checked;
  }

  backCountHandler() {
    this.backCountValue = Number(this.backCountElement.value);
    this.backCountDisplayElement.innerText = String(this.backCountValue);
  }

  speedHandler() {
    this.speedValue = Number(this.speedElement.value) * 0.1;
    this.speedDisplayElement.innerText = String(this.speedValue).substr(0, 3);
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

    this.positionElement.addEventListener("click", this.positionHandler.bind(this));
    this.soundElement.addEventListener("click", this.soundHandler.bind(this));
    this.backElement.addEventListener("click", this.backHandler.bind(this));
  }

  positionHandler() {
    this.game.positionClick();
  }

  soundHandler() {
    this.game.soundClick();
  }

  backHandler() {
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

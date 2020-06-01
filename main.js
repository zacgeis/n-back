class SettingsContainer {
  constructor(manager) {
    this.manager = manager;

    this.backCountValue = 0;
    this.speedValue = 0;
    this.positionValue = true;
    this.soundValue = true;
  }

  init() {
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
    this.backCountValue = this.backCountElement.value;
    this.backCountDisplayElement.innerText = this.backCountValue;
  }

  speedHandler() {
    this.speedValue = this.speedElement.value * 0.1;
    this.speedDisplayElement.innerText = String(this.speedValue).substr(0, 3);
  }

  hide() {
    document.body.removeChild(this.containerElement);
  }

  show() {
    document.body.appendChild(this.containerElement);
  }
}

class Entity {
  draw(drawContext, delta) {
    throw new Error("draw not implemented.");
  }

  isActive() {
    throw new Error("isActive not implemented.");
  }
}

class CountDownEntity extends Entity {
  constructor(x, y) {
    super();

    this.x = x;
    this.y = y;
    this.drawTime = 0;
    this.isFirstDraw = true;
  }

  draw(drawContext, delta) {
    if (this.isFirstDraw) {
      this.isFirstDraw = false;
    } else {
      this.drawTime += delta;
    }

    let count = 3 - Math.floor(this.drawTime / 1000);
    // Skip displaying a quick 0.
    if (count == 0) return;

    drawContext.font = "48px 'Open Sans'";
    drawContext.fillStyle = "black";
    drawContext.strokeStyle = "black";

    drawContext.fillText(String(count), this.x, this.y);
  }

  isActive() {
    if (this.drawTime > 3000) {
      return false;
    }
    return true;
  }
}

class GameContainer {
  constructor(manager) {
    this.active = false;
    this.manager = manager;
    this.lastDrawTime = 0;

    this.entities = [];
  }

  init() {
    this.containerElement = document.getElementById("game");
    this.positionElement = document.getElementById("position-input");
    this.soundElement = document.getElementById("sound-input");
    this.backElement = document.getElementById("back-button");
    this.canvasElement = document.getElementById("canvas");

    this.drawContext = this.canvasElement.getContext("2d");

    this.positionElement.addEventListener("input", this.positionHandler.bind(this));
    this.soundElement.addEventListener("input", this.soundHandler.bind(this));
    this.backElement.addEventListener("click", this.backHandler.bind(this));
  }

  positionHandler() {

  }

  soundHandler() {

  }

  backHandler() {
    this.endGame();
  }

  startGame() {
    this.active = true;
    this.entities.push(new CountDownEntity(200, 200));
    this.draw();
  }

  draw() {
    if (!this.active) return;

    let currentTime = performance.now();
    let delta = currentTime - this.lastDrawTime;

    // Reset.
    this.drawContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.drawContext.font = "48px 'Open Sans'";
    this.drawContext.fillStyle = "black";
    this.drawContext.strokeStyle = "black";

    // Draw entities.
    let survivingEntities = [];
    for (let entity of this.entities) {
      entity.draw(this.drawContext, delta);
      if (entity.isActive()) {
        survivingEntities.push(entity);
      }
    }
    this.entities = survivingEntities;

    // this.drawContext.beginPath();
    // this.drawContext.moveTo(10, 10);
    // this.drawContext.lineTo(100, 100);
    // this.drawContext.stroke();

    this.lastDrawTime = currentTime;
    window.requestAnimationFrame(this.draw.bind(this));
  }

  endGame() {
    // Clear entities.
    this.entities = [];

    this.manager.endGame();
  }

  hide() {
    document.body.removeChild(this.containerElement);
  }

  show() {
    document.body.appendChild(this.containerElement);
  }
}

class Manager {
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

let manager = new Manager();
manager.init();
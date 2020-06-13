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

class CountDown extends Entity {
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

    drawContext.font = "8rem 'Nunito'";
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

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  unit() {
    let mag = this.magnitude();
    return new Vec2(this.x / mag, this.y / mag);
  }

  sub(v) {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  add(v) {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  scalar(s) {
    return new Vec2(this.x * s, this.y * s);
  }

  magnitude() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
}

class Vec2Animate {
  constructor(start, end, duration) {
    this.start = start;
    this.current = start;
    this.end = end;
    this.time = 0;
    this.duration = duration;
    this.active = true;
  }

  step(delta) {
    let timePerc = this.time / this.duration;

    let dir = new Vec2(this.end.x - this.start.x, this.end.y - this.start.y);
    this.current = this.start.add(dir.unit().scalar(dir.magnitude() * timePerc));

    this.time += delta;
    if (this.time >= this.duration) {
      this.active = false;
    }
  }
}

// TODO: Convert all x, y to vectors.
// TODO: Extract out is first draw to the base class
// TODO: Add bounding box to only redraw changed parts of the screen.
class BackgroundBox extends Entity {
  constructor(x, y, size) {
    super();

    this.x = x;
    this.y = y;
    this.size = size;

    this.animation = null;

    this.drawTime = 0;
    this.isFirstDraw = true;
  }

  moveTo(x, y, duration) {
    this.animation = new Vec2Animate(new Vec2(this.x, this.y), new Vec2(x, y), duration);
  }

  draw(drawContext, delta) {
    if (this.isFirstDraw) {
      this.isFirstDraw = false;
    } else {
      this.drawTime += delta;
    }

    if (this.animation != null) {
      this.animation.step(delta);
      this.x = this.animation.current.x;
      this.y = this.animation.current.y;
      if (!this.animation.active) {
        this.animation = null;
      }
    }

    drawContext.fillStyle = "rgb(200, 200, 200)";

    drawContext.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
  }

  isActive() {
    return true;
  }
}

class GameContainer {
  constructor(manager) {
    this.active = false;
    this.manager = manager;
    this.lastDrawTime = 0;

    this.entities = [];
    this.backgroundBoxes = [];
  }

  init() {
    this.containerElement = document.getElementById("game");
    this.positionElement = document.getElementById("position-input");
    this.soundElement = document.getElementById("sound-input");
    this.backElement = document.getElementById("back-button");
    this.canvasElement = document.getElementById("canvas");
    this.canvasContainerElement = document.getElementById("canvas-inner-container");

    this.drawContext = this.canvasElement.getContext("2d");

    this.positionElement.addEventListener("click", this.positionHandler.bind(this));
    this.soundElement.addEventListener("click", this.soundHandler.bind(this));
    this.backElement.addEventListener("click", this.backHandler.bind(this));
  }

  positionHandler() {
    this.backgroundBoxes[0].moveTo(10, 10, 1000);
  }

  soundHandler() {

  }

  backHandler() {
    this.endGame();
  }

  startGame() {
    this.canvasElement.width = this.canvasContainerElement.clientWidth;
    this.canvasElement.height = this.canvasContainerElement.clientHeight;

    this.canvasWidth = this.canvasElement.width;
    this.canvasHeight = this.canvasElement.height;

    for (let i = 0; i < 8; i++) {
      let backgroundBox = new BackgroundBox(this.canvasWidth / 2, this.canvasHeight / 2, 40);
      this.backgroundBoxes.push(backgroundBox);
      this.entities.push(backgroundBox);
    }

    this.active = true;
    this.entities.push(new CountDown(this.canvasWidth / 2, this.canvasHeight / 2));
    this.entities.push();
    this.draw();
  }

  draw() {
    if (!this.active) return;

    let currentTime = performance.now();
    let delta = currentTime - this.lastDrawTime;

    // Reset.
    this.drawContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.drawContext.font = "1rem 'Nunito'";
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

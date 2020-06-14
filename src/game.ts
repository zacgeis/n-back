import { easeOutElastic } from "./easings.js";

class Entity {
  draw(drawContext: CanvasRenderingContext2D, delta: number) {
    throw new Error("draw not implemented.");
  }

  isActive(): boolean {
    throw new Error("isActive not implemented.");
  }
}

class CountDown extends Entity {
  x: number;
  y: number;
  drawTime: number;
  isFirstDraw: boolean;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
    this.drawTime = 0;
    this.isFirstDraw = true;
  }

  draw(drawContext: CanvasRenderingContext2D, delta: number) {
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

  isActive(): boolean {
    if (this.drawTime > 3000) {
      return false;
    }
    return true;
  }
}

class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  unit(): Vec2 {
    let mag = this.magnitude();
    return new Vec2(this.x / mag, this.y / mag);
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  scalar(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  magnitude(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }
}

class Vec2Animate {
  start: Vec2;
  current: Vec2;
  end: Vec2;
  time: number;
  duration: number;
  active: boolean;

  constructor(start: Vec2, end: Vec2, duration: number) {
    this.start = start;
    this.current = start;
    this.end = end;
    this.time = 0;
    this.duration = duration;
    this.active = true;
  }

  step(delta: number) {
    let timePerc = this.time / this.duration;
    timePerc = easeOutElastic(timePerc);

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
  x: number;
  y: number;
  size: number;

  // TODO: probably remove these?
  animation: Vec2Animate;
  drawTime: number;
  isFirstDraw: boolean;

  constructor(x: number, y: number, size: number) {
    super();

    this.x = x;
    this.y = y;
    this.size = size;

    this.animation = null;

    this.drawTime = 0;
    this.isFirstDraw = true;
  }

  // TODO: remove this.
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

export class Game {
  canvasElement: HTMLCanvasElement;
  drawContext: CanvasRenderingContext2D;

  active: boolean;

  width: number;
  height: number;
  lastDrawTime: number;

  entities: Array<Entity>;
  backgroundBoxes: Array<BackgroundBox>;

  constructor(canvasElement: HTMLCanvasElement) {
    this.lastDrawTime = 0;
    this.width = 0;
    this.height = 0;
    this.active = false;

    this.canvasElement = canvasElement;
    this.drawContext = canvasElement.getContext("2d");

    this.width = canvasElement.width;
    this.height = canvasElement.height;

    this.entities = [];
    this.backgroundBoxes = [];
  }

  start() {
    for (let i = 0; i < 1000; i++) {
      let backgroundBox = new BackgroundBox(this.width / 2, this.height / 2, 40);
      this.backgroundBoxes.push(backgroundBox);
      this.entities.push(backgroundBox);
    }

    this.active = true;
    this.entities.push(new CountDown(this.width / 2, this.height / 2));
    this.entities.push();
    this.draw();
  }

  end() {

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

  positionClick() {
    for (let box of this.backgroundBoxes) {
      let x = Math.random() * this.width;
      let y = Math.random() * this.height;
      let d = 1000 + Math.random() * 1000;
      box.moveTo(x, y, d);
    }
  }

  soundClick() {

  }
}

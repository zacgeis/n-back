import { easeOutElastic } from "./easings.js";

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

  copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }
}

class Drawable {
  alive: boolean;

  constructor() {
    this.alive = true;
  }

  draw(drawContext: CanvasRenderingContext2D) {
    throw new Error("draw not implemented.");
  }

  remove() {
    this.alive = false;
  }
}

class Property<T> {
  t: T;

  constructor(t: T) {
    this.t = t;
  }

  get(): T {
    return this.t;
  }

  set(t: T) {
    this.t = t;
  }
}

enum AnimationState {
  Pending,
  InProgress,
  Complete,
}

// TODO: Model animations with callbacks
class Animation {
  state: AnimationState;
  deps: Array<Animation>;
  completeCallbacks: Array<() => any>;

  constructor() {
    this.state = AnimationState.Pending;
    this.deps = [];
    this.completeCallbacks = [];
  }

  addDep(animation: Animation) {
    this.deps.push(animation);
  }

  canStart() {
    for (let dep of this.deps) {
      if (!dep.isComplete()) {
        return false;
      }
    }
    return true;
  }

  managedStep(delta: number) {
    if (this.isPending()) {
      if (this.canStart()) {
        this.state = AnimationState.InProgress;
      }
    }
    if (this.isInProgress()) {
      this.step(delta);
    }
  }

  step(delta: number) {
    throw new Error("step not implemented.");
  }

  isPending(): boolean {
    return this.state == AnimationState.Pending;
  }

  isInProgress(): boolean {
    return this.state == AnimationState.InProgress;
  }

  isComplete(): boolean {
    return this.state == AnimationState.Complete;
  }

  complete() {
    this.state = AnimationState.Complete;
    for (let callback of this.completeCallbacks) {
      callback();
    }
  }

  onComplete(callback: () => any) {
    this.completeCallbacks.push(callback);
  }
}

// TODO: rename animation to is complete.

class StringAnimation extends Animation {
  target: Property<string>;
  end: string;
  time: number;
  duration: number;

  constructor(target: Property<string>, message: string, duration: number) {
    super();

    this.target = target;
    this.end = message;
    this.time = 0;
    this.duration = duration;
  }

  step(delta: number) {
    this.target.set(this.end);

    this.time += delta;
    if (this.time >= this.duration) {
      this.complete();
    }
  }
}

class Vec2Animation extends Animation {
  start: Vec2;
  target: Property<Vec2>;
  end: Vec2;
  time: number;
  duration: number;
  dir: Vec2;
  mag: number;

  constructor(target: Property<Vec2>, end: Vec2, duration: number) {
    super();

    this.start = target.get().copy();
    this.target = target;
    this.end = end;
    this.time = 0;
    this.duration = duration;

    let path = this.end.sub(this.start);
    this.dir = path.unit();
    this.mag = path.magnitude();
  }

  step(delta: number) {
    let timePerc = this.time / this.duration;
    timePerc = easeOutElastic(timePerc);

    let dir = new Vec2(this.end.x - this.start.x, this.end.y - this.start.y);
    this.target.set(this.start.add(this.dir.scalar(this.mag * timePerc)));

    this.time += delta;
    if (this.time >= this.duration) {
      this.complete();
    }
  }
}

class Text extends Drawable {
  position: Property<Vec2>;
  message: Property<string>;

  constructor(x: number, y: number, message: string) {
    super();

    this.message = new Property(message);
    this.position = new Property(new Vec2(x, y));
  }

  draw(drawContext: CanvasRenderingContext2D) {
    let textHeight = 100;
    drawContext.font = `${textHeight}px 'Nunito'`;
    drawContext.fillStyle = "black";
    drawContext.strokeStyle = "black";

    let textWidth = drawContext.measureText(this.message.get()).width;
    drawContext.fillText(
      this.message.get(),
      this.position.get().x - textWidth / 2,
      this.position.get().y + (textHeight / 2) - Math.round(textHeight * 0.12)
    );
  }
}

class BackgroundBox extends Drawable {
  position: Property<Vec2>;
  size: Property<number>;

  constructor(x: number, y: number, size: number) {
    super();

    this.position = new Property(new Vec2(x, y));
    this.size = new Property(size);
  }

  draw(drawContext: CanvasRenderingContext2D) {
    drawContext.fillStyle = "rgb(200, 200, 200)";

    roundedRect(
      drawContext,
      this.position.get().x - this.size.get() / 2,
      this.position.get().y - this.size.get() / 2,
      this.size.get(),
      this.size.get(),
      15
    );
  }
}

export class Game {
  canvasElement: HTMLCanvasElement;
  drawContext: CanvasRenderingContext2D;

  active: boolean;

  width: number;
  height: number;
  lastDrawTime: number;

  drawables: Array<Drawable>;
  backgroundBoxes: Array<BackgroundBox>;

  animations: Array<Animation>;

  constructor(canvasElement: HTMLCanvasElement) {
    this.lastDrawTime = 0;
    this.width = 0;
    this.height = 0;
    this.active = false;

    this.canvasElement = canvasElement;
    this.drawContext = canvasElement.getContext("2d");

    this.width = canvasElement.width;
    this.height = canvasElement.height;

    this.drawables = [];
    this.backgroundBoxes = [];

    this.animations = [];
  }

  addCountDown() {
    let countdown = new Text(this.width / 2, this.height / 2, "");
    let anim3 = new StringAnimation(countdown.message, "3", 1000);
    let anim2 = new StringAnimation(countdown.message, "2", 1000);
    anim2.addDep(anim3);
    let anim1 = new StringAnimation(countdown.message, "1", 1000);
    anim1.addDep(anim2);
    anim1.onComplete(() => countdown.remove());

    this.drawables.push(countdown);
    this.animations.push(anim3);
    this.animations.push(anim2);
    this.animations.push(anim1);
  }

  start() {
    for (let i = 0; i < 50; i++) {
      let backgroundBox = new BackgroundBox(this.width / 2, this.height / 2, 80);
      this.backgroundBoxes.push(backgroundBox);
      this.drawables.push(backgroundBox);
    }
    
    this.addCountDown();

    // Start draw loop.
    this.active = true;
    this.lastDrawTime = 0;
    this.draw();
  }

  end() {

  }

  draw() {
    if (!this.active) return;

    let currentTime = performance.now();
    let delta = currentTime - this.lastDrawTime;
    // Handle for first draw.
    if (this.lastDrawTime == 0) delta = 0;

    // Reset.
    this.drawContext.clearRect(0, 0, this.width, this.height);
    this.drawContext.font = "1rem 'Nunito'";
    this.drawContext.fillStyle = "black";
    this.drawContext.strokeStyle = "black";

    // Run animations.
    let survivingAnimations = [];
    for (let animation of this.animations) {
      animation.managedStep(delta);
      if (!animation.isComplete()) {
        survivingAnimations.push(animation);
      }
    }
    this.animations = survivingAnimations;

    // Draw drawables.
    let survivingDrawables = [];
    for (let drawable of this.drawables) {
      if (drawable.alive) {
        drawable.draw(this.drawContext);
        survivingDrawables.push(drawable);
      }
    }
    this.drawables = survivingDrawables;

    // TODO: Expand into grid for alignment.
    // this.drawContext.fillStyle = "red";
    // this.drawContext.fillRect(this.width / 2, this.height / 2, 1, 1);

    this.lastDrawTime = currentTime;
    window.requestAnimationFrame(this.draw.bind(this));
  }

  positionClick() {
    for (let box of this.backgroundBoxes) {
      let x = Math.random() * this.width;
      let y = Math.random() * this.height;
      let d = 1000 + Math.random() * 1000;
      let animation = new Vec2Animation(box.position, new Vec2(x, y), d);
      this.animations.push(animation);
    }
  }

  soundClick() {

  }
}

// From https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
function roundedRect(
  drawContext: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number) {
    drawContext.beginPath();
    drawContext.moveTo(x + radius, y);
    drawContext.lineTo(x + width - radius, y);
    drawContext.quadraticCurveTo(x + width, y, x + width, y + radius);
    drawContext.lineTo(x + width, y + height - radius);
    drawContext.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    drawContext.lineTo(x + radius, y + height);
    drawContext.quadraticCurveTo(x, y + height, x, y + height - radius);
    drawContext.lineTo(x, y + radius);
    drawContext.quadraticCurveTo(x, y, x + radius, y);
    drawContext.closePath();
    drawContext.fill();
}
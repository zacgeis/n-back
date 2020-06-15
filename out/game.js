var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { easeOutElastic } from "./easings.js";
var Vec2 = /** @class */ (function () {
    function Vec2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.unit = function () {
        var mag = this.magnitude();
        return new Vec2(this.x / mag, this.y / mag);
    };
    Vec2.prototype.sub = function (v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    };
    Vec2.prototype.add = function (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    };
    Vec2.prototype.scalar = function (s) {
        return new Vec2(this.x * s, this.y * s);
    };
    Vec2.prototype.magnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    Vec2.prototype.copy = function () {
        return new Vec2(this.x, this.y);
    };
    return Vec2;
}());
var Drawable = /** @class */ (function () {
    function Drawable() {
        this.alive = true;
    }
    Drawable.prototype.draw = function (drawContext) {
        throw new Error("draw not implemented.");
    };
    Drawable.prototype.remove = function () {
        this.alive = false;
    };
    return Drawable;
}());
var Property = /** @class */ (function () {
    function Property(t) {
        this.t = t;
    }
    Property.prototype.get = function () {
        return this.t;
    };
    Property.prototype.set = function (t) {
        this.t = t;
    };
    return Property;
}());
var AnimationState;
(function (AnimationState) {
    AnimationState[AnimationState["Pending"] = 0] = "Pending";
    AnimationState[AnimationState["InProgress"] = 1] = "InProgress";
    AnimationState[AnimationState["Complete"] = 2] = "Complete";
})(AnimationState || (AnimationState = {}));
// TODO: Model animations with callbacks
var Animation = /** @class */ (function () {
    function Animation() {
        this.state = AnimationState.Pending;
        this.deps = [];
        this.completeCallbacks = [];
    }
    Animation.prototype.addDep = function (animation) {
        this.deps.push(animation);
    };
    Animation.prototype.canStart = function () {
        for (var _i = 0, _a = this.deps; _i < _a.length; _i++) {
            var dep = _a[_i];
            if (!dep.isComplete()) {
                return false;
            }
        }
        return true;
    };
    Animation.prototype.managedStep = function (delta) {
        if (this.isPending()) {
            if (this.canStart()) {
                this.state = AnimationState.InProgress;
            }
        }
        if (this.isInProgress()) {
            this.step(delta);
        }
    };
    Animation.prototype.step = function (delta) {
        throw new Error("step not implemented.");
    };
    Animation.prototype.isPending = function () {
        return this.state == AnimationState.Pending;
    };
    Animation.prototype.isInProgress = function () {
        return this.state == AnimationState.InProgress;
    };
    Animation.prototype.isComplete = function () {
        return this.state == AnimationState.Complete;
    };
    Animation.prototype.complete = function () {
        this.state = AnimationState.Complete;
        for (var _i = 0, _a = this.completeCallbacks; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback();
        }
    };
    Animation.prototype.onComplete = function (callback) {
        this.completeCallbacks.push(callback);
    };
    return Animation;
}());
// TODO: rename animation to is complete.
var StringAnimation = /** @class */ (function (_super) {
    __extends(StringAnimation, _super);
    function StringAnimation(target, message, duration) {
        var _this = _super.call(this) || this;
        _this.target = target;
        _this.end = message;
        _this.time = 0;
        _this.duration = duration;
        return _this;
    }
    StringAnimation.prototype.step = function (delta) {
        this.target.set(this.end);
        this.time += delta;
        if (this.time >= this.duration) {
            this.complete();
        }
    };
    return StringAnimation;
}(Animation));
var Vec2Animation = /** @class */ (function (_super) {
    __extends(Vec2Animation, _super);
    function Vec2Animation(target, end, duration) {
        var _this = _super.call(this) || this;
        _this.start = target.get().copy();
        _this.target = target;
        _this.end = end;
        _this.time = 0;
        _this.duration = duration;
        var path = _this.end.sub(_this.start);
        _this.dir = path.unit();
        _this.mag = path.magnitude();
        return _this;
    }
    Vec2Animation.prototype.step = function (delta) {
        var timePerc = this.time / this.duration;
        timePerc = easeOutElastic(timePerc);
        var dir = new Vec2(this.end.x - this.start.x, this.end.y - this.start.y);
        this.target.set(this.start.add(this.dir.scalar(this.mag * timePerc)));
        this.time += delta;
        if (this.time >= this.duration) {
            this.complete();
        }
    };
    return Vec2Animation;
}(Animation));
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text(x, y, message) {
        var _this = _super.call(this) || this;
        _this.message = new Property(message);
        _this.position = new Property(new Vec2(x, y));
        return _this;
    }
    Text.prototype.draw = function (drawContext) {
        var textHeight = 100;
        drawContext.font = textHeight + "px 'Nunito'";
        drawContext.fillStyle = "black";
        drawContext.strokeStyle = "black";
        var textWidth = drawContext.measureText(this.message.get()).width;
        drawContext.fillText(this.message.get(), this.position.get().x - textWidth / 2, this.position.get().y + (textHeight / 2) - Math.round(textHeight * 0.12));
    };
    return Text;
}(Drawable));
var BackgroundBox = /** @class */ (function (_super) {
    __extends(BackgroundBox, _super);
    function BackgroundBox(x, y, size) {
        var _this = _super.call(this) || this;
        _this.position = new Property(new Vec2(x, y));
        _this.size = new Property(size);
        return _this;
    }
    BackgroundBox.prototype.draw = function (drawContext) {
        drawContext.fillStyle = "rgb(200, 200, 200)";
        roundedRect(drawContext, this.position.get().x - this.size.get() / 2, this.position.get().y - this.size.get() / 2, this.size.get(), this.size.get(), 15);
    };
    return BackgroundBox;
}(Drawable));
var Game = /** @class */ (function () {
    function Game(canvasElement) {
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
    Game.prototype.addCountDown = function () {
        var countdown = new Text(this.width / 2, this.height / 2, "");
        var anim3 = new StringAnimation(countdown.message, "3", 1000);
        var anim2 = new StringAnimation(countdown.message, "2", 1000);
        anim2.addDep(anim3);
        var anim1 = new StringAnimation(countdown.message, "1", 1000);
        anim1.addDep(anim2);
        anim1.onComplete(function () { return countdown.remove(); });
        this.drawables.push(countdown);
        this.animations.push(anim3);
        this.animations.push(anim2);
        this.animations.push(anim1);
    };
    Game.prototype.start = function () {
        for (var i = 0; i < 50; i++) {
            var backgroundBox = new BackgroundBox(this.width / 2, this.height / 2, 80);
            this.backgroundBoxes.push(backgroundBox);
            this.drawables.push(backgroundBox);
        }
        this.addCountDown();
        // Start draw loop.
        this.active = true;
        this.lastDrawTime = 0;
        this.draw();
    };
    Game.prototype.end = function () {
    };
    Game.prototype.draw = function () {
        if (!this.active)
            return;
        var currentTime = performance.now();
        var delta = currentTime - this.lastDrawTime;
        // Handle for first draw.
        if (this.lastDrawTime == 0)
            delta = 0;
        // Reset.
        this.drawContext.clearRect(0, 0, this.width, this.height);
        this.drawContext.font = "1rem 'Nunito'";
        this.drawContext.fillStyle = "black";
        this.drawContext.strokeStyle = "black";
        // Run animations.
        var survivingAnimations = [];
        for (var _i = 0, _a = this.animations; _i < _a.length; _i++) {
            var animation = _a[_i];
            animation.managedStep(delta);
            if (!animation.isComplete()) {
                survivingAnimations.push(animation);
            }
        }
        this.animations = survivingAnimations;
        // Draw drawables.
        var survivingDrawables = [];
        for (var _b = 0, _c = this.drawables; _b < _c.length; _b++) {
            var drawable = _c[_b];
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
    };
    Game.prototype.positionClick = function () {
        for (var _i = 0, _a = this.backgroundBoxes; _i < _a.length; _i++) {
            var box = _a[_i];
            var x = Math.random() * this.width;
            var y = Math.random() * this.height;
            var d = 1000 + Math.random() * 1000;
            var animation = new Vec2Animation(box.position, new Vec2(x, y), d);
            this.animations.push(animation);
        }
    };
    Game.prototype.soundClick = function () {
    };
    return Game;
}());
export { Game };
// From https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
function roundedRect(drawContext, x, y, width, height, radius) {
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
//# sourceMappingURL=game.js.map
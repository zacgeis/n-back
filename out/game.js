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
var Entity = /** @class */ (function () {
    function Entity() {
    }
    Entity.prototype.draw = function (drawContext, delta) {
        throw new Error("draw not implemented.");
    };
    Entity.prototype.isActive = function () {
        throw new Error("isActive not implemented.");
    };
    return Entity;
}());
var CountDown = /** @class */ (function (_super) {
    __extends(CountDown, _super);
    function CountDown(x, y) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.y = y;
        _this.drawTime = 0;
        _this.isFirstDraw = true;
        return _this;
    }
    CountDown.prototype.draw = function (drawContext, delta) {
        if (this.isFirstDraw) {
            this.isFirstDraw = false;
        }
        else {
            this.drawTime += delta;
        }
        var count = 3 - Math.floor(this.drawTime / 1000);
        // Skip displaying a quick 0.
        if (count == 0)
            return;
        drawContext.font = "8rem 'Nunito'";
        drawContext.fillStyle = "black";
        drawContext.strokeStyle = "black";
        drawContext.fillText(String(count), this.x, this.y);
    };
    CountDown.prototype.isActive = function () {
        if (this.drawTime > 3000) {
            return false;
        }
        return true;
    };
    return CountDown;
}(Entity));
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
    return Vec2;
}());
var Vec2Animate = /** @class */ (function () {
    function Vec2Animate(start, end, duration) {
        this.start = start;
        this.current = start;
        this.end = end;
        this.time = 0;
        this.duration = duration;
        this.active = true;
    }
    Vec2Animate.prototype.step = function (delta) {
        var timePerc = this.time / this.duration;
        timePerc = easeOutElastic(timePerc);
        var dir = new Vec2(this.end.x - this.start.x, this.end.y - this.start.y);
        this.current = this.start.add(dir.unit().scalar(dir.magnitude() * timePerc));
        this.time += delta;
        if (this.time >= this.duration) {
            this.active = false;
        }
    };
    return Vec2Animate;
}());
// TODO: Convert all x, y to vectors.
// TODO: Extract out is first draw to the base class
// TODO: Add bounding box to only redraw changed parts of the screen.
var BackgroundBox = /** @class */ (function (_super) {
    __extends(BackgroundBox, _super);
    function BackgroundBox(x, y, size) {
        var _this = _super.call(this) || this;
        _this.x = x;
        _this.y = y;
        _this.size = size;
        _this.animation = null;
        _this.drawTime = 0;
        _this.isFirstDraw = true;
        return _this;
    }
    // TODO: remove this.
    BackgroundBox.prototype.moveTo = function (x, y, duration) {
        this.animation = new Vec2Animate(new Vec2(this.x, this.y), new Vec2(x, y), duration);
    };
    BackgroundBox.prototype.draw = function (drawContext, delta) {
        if (this.isFirstDraw) {
            this.isFirstDraw = false;
        }
        else {
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
        drawContext.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    };
    BackgroundBox.prototype.isActive = function () {
        return true;
    };
    return BackgroundBox;
}(Entity));
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
        this.entities = [];
        this.backgroundBoxes = [];
    }
    Game.prototype.start = function () {
        for (var i = 0; i < 1000; i++) {
            var backgroundBox = new BackgroundBox(this.width / 2, this.height / 2, 40);
            this.backgroundBoxes.push(backgroundBox);
            this.entities.push(backgroundBox);
        }
        this.active = true;
        this.entities.push(new CountDown(this.width / 2, this.height / 2));
        this.entities.push();
        this.draw();
    };
    Game.prototype.end = function () {
    };
    Game.prototype.draw = function () {
        if (!this.active)
            return;
        var currentTime = performance.now();
        var delta = currentTime - this.lastDrawTime;
        // Reset.
        this.drawContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.drawContext.font = "1rem 'Nunito'";
        this.drawContext.fillStyle = "black";
        this.drawContext.strokeStyle = "black";
        // Draw entities.
        var survivingEntities = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
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
    };
    Game.prototype.positionClick = function () {
        for (var _i = 0, _a = this.backgroundBoxes; _i < _a.length; _i++) {
            var box = _a[_i];
            var x = Math.random() * this.width;
            var y = Math.random() * this.height;
            var d = 1000 + Math.random() * 1000;
            box.moveTo(x, y, d);
        }
    };
    Game.prototype.soundClick = function () {
    };
    return Game;
}());
export { Game };
//# sourceMappingURL=game.js.map
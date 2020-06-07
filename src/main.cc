#include "raylib.h"
#include <iostream>
#include <vector>
#include <memory>

constexpr int kDefaultScreenWidth = 400;
constexpr int kDefaultScreenHeight = 600;

// TODO(zacgeis): Add namespacing.

class Dim {
 public:
  Dim() {}
  Dim(float width, float height) :
    width_(width), height_(height) {}

  float width_ = 0.0f;
  float height_ = 0.0f;
};

class Pos {
 public:
  Pos() {}
  Pos(float x, float y) :
    x_(x), y_(y) {}

  Rectangle GetRect(const Dim& dim);

  float x_ = 0.0f;
  float y_ = 0.0f;
};

Rectangle Pos::GetRect(const Dim& dim) {
  Rectangle rect;
  rect.x = x_;
  rect.y = y_;
  rect.width = dim.width_;
  rect.height = dim.height_;

  return rect;
}

class Entity;

class InputState {
 public:
  void Capture(Entity* entity);
  void Release();

  Entity* capturing_ = nullptr;
};

void InputState::Capture(Entity* entity) {
  capturing_ = entity;
}

void InputState::Release() {
  capturing_ = nullptr;
}

struct MouseState : public InputState {
 public:
  float x_ = 0.0f;
  float y_ = 0.0f;
  bool is_left_down_ = false;
};

struct KeyboardState : public InputState {
 public:
  bool holder_ = false;
};

class Entity {
 public:
  explicit Entity() {}
  explicit Entity(const Pos& pos, const Dim& dim) : rel_(pos), abs_(pos), dim_(dim) {}

  virtual void Update();
  virtual void Draw();
  // Includes drawing children.
  virtual void FullDraw();
  virtual void HandleMouseState(MouseState& mouse_state);
  virtual void HandleKeyboardState(KeyboardState& keyboard_state);
  virtual bool PointerCollision(float x, float y);

  void AddEntity(Entity* entity);

  Entity* parent_ = nullptr;
  std::vector<Entity*> entities_;
  // Entities marked as inactive will get garbage collected.
  bool is_active_ = true;

  Pos rel_;
  Pos abs_;
  Dim dim_;
};

void Entity::Update() {
  for (auto* entity : entities_) {
    entity->Update();
  }
}

// Default to nothing.
void Entity::Draw() { }

void Entity::FullDraw() {
  Draw();
  for (auto* entity : entities_) {
    entity->Draw();
  }
}

// Default to not propagate.
void Entity::HandleMouseState(MouseState& mouse_state) { }

// Default to not propagate.
void Entity::HandleKeyboardState(KeyboardState& keyboard_state) { }

bool Entity::PointerCollision(float x, float y) {
  return x > abs_.x_
    && x < abs_.x_ + dim_.width_
    && y > abs_.y_
    && y < abs_.y_ + dim_.height_;
}

void Entity::AddEntity(Entity* entity) {
  entities_.push_back(entity);
  entity->parent_ = this;
}

class AbsoluteContainer : public Entity {
 public:
  explicit AbsoluteContainer() {}
  explicit AbsoluteContainer(const Pos& pos, const Dim& dim) : Entity(pos, dim) {}

  void Update() override;
  void HandleMouseState(MouseState& mouse_state) override;
};


void AbsoluteContainer::Update() {
  for (auto* entity : entities_) {
    entity->abs_.x_ = entity->rel_.x_ + this->abs_.x_;
    entity->abs_.y_ = entity->rel_.y_ + this->abs_.y_;

    entity->Update();
  }
}

void AbsoluteContainer::HandleMouseState(MouseState& mouse_state) {
  for (auto* entity : entities_) {
    if (entity->PointerCollision(mouse_state.x_, mouse_state.y_)) {
      entity->HandleMouseState(mouse_state);
    }
  }
}

class Slider : public Entity {
 public:
  explicit Slider() {}
  explicit Slider(const Pos& pos, const Dim& dim) : Entity(pos, dim) {}

  void Update() override;
  void Draw() override;
  void HandleMouseState(MouseState& mouse_state) override;

  Color background_ = WHITE;
  // TODO(zacgeis): Extract this logic out into an event processor which takes mouse_state and returns.
  //                Internally the event processor would have a state machine.
  bool mouse_hover_ = false;
  bool mouse_is_down_ = false;
  bool mouse_was_down_ = false;
  MouseState* captured_mouse_state_ = nullptr;
};

void Slider::Update() {
  if (mouse_hover_) {
    background_ = GREEN;
    // Process and clear.
    mouse_hover_ = false;
  } else {
    background_ = RED;
  }
  if (mouse_was_down_ && !mouse_is_down_) {
    std::cout << "click" << std::endl;
    mouse_was_down_ = false;
    if (captured_mouse_state_ != nullptr) {
      captured_mouse_state_->Release();
      captured_mouse_state_ = nullptr;
    }
  }
  if (mouse_is_down_) {
    background_ = BLUE;
    mouse_is_down_ = false;
  }
}

void Slider::Draw() {
  DrawRectangleRounded(abs_.GetRect(dim_), 1.0f, 10, background_);
}

void Slider::HandleMouseState(MouseState& mouse_state) {
  mouse_hover_ = true;
  if (mouse_state.is_left_down_) {
    captured_mouse_state_ = &mouse_state;
    mouse_state.Capture(this);
    mouse_is_down_ = true;
    mouse_was_down_ = true;
  }
}

class InputManager {
 public:
  explicit InputManager(Entity* root)
    : root_(root) {};

  void DispatchInputState(MouseState& mouse_state, KeyboardState& keyboard_state);

  Entity* root_ = nullptr;
};

void InputManager::DispatchInputState(MouseState& mouse_state, KeyboardState& keyboard_state) {
  Entity* mouse_target = root_;
  if (mouse_state.capturing_ != nullptr) {
    mouse_target = mouse_state.capturing_;
  }
  mouse_target->HandleMouseState(mouse_state);

  Entity* keyboard_target = root_;
  if (keyboard_state.capturing_ != nullptr) {
    keyboard_target = keyboard_state.capturing_;
  }
  keyboard_target->HandleKeyboardState(keyboard_state);
}

int main(int argc, char** argv) {
  SetConfigFlags(FLAG_VSYNC_HINT);
  SetConfigFlags(FLAG_MSAA_4X_HINT);

  InitWindow(kDefaultScreenWidth, kDefaultScreenHeight, "Game");

  SetTargetFPS(60);

  auto* root_container = new AbsoluteContainer(
      Pos(0.0f, 0.0f),
      Dim(GetScreenWidth(), GetScreenHeight()));

  InputManager input_manager(root_container);
  MouseState mouse_state;
  KeyboardState keyboard_state;

  auto* slider = new Slider(
      Pos(GetScreenWidth() / 2 - 100.0f, GetScreenHeight() / 2 - 5.0f),
      Dim(200.0f, 10.0f));
  root_container->AddEntity(slider);

  while (!WindowShouldClose()) {
    mouse_state.x_ = GetMouseX();
    mouse_state.y_ = GetMouseY();
    mouse_state.is_left_down_ = IsMouseButtonDown(0);

    // Process inputs.
    input_manager.DispatchInputState(mouse_state, keyboard_state);

    // Update.
    root_container->Update();

    BeginDrawing();

    ClearBackground(WHITE);

    // Draw.
    root_container->FullDraw();

    // TODO(zacgeis): Make FPS text into entity.
    // Draw FPS last to prevent covering it up.
    DrawFPS(GetScreenWidth() - 80, 0);

    EndDrawing();
  }

  CloseWindow();

  return 0;
}

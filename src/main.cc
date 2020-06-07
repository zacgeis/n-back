#include "raylib.h"

constexpr int kDefaultScreenWidth = 400;
constexpr int kDefaultScreenHeight = 600;

int main(int argc, char** argv) {
  SetConfigFlags(FLAG_VSYNC_HINT);
  SetConfigFlags(FLAG_MSAA_4X_HINT);

  InitWindow(kDefaultScreenWidth, kDefaultScreenHeight, "Game");

  SetTargetFPS(60);

  while (!WindowShouldClose()) {
    BeginDrawing();

    ClearBackground(WHITE);

    // Draw FPS last to prevent covering it up.
    DrawFPS(GetScreenWidth() - 80, 0);

    EndDrawing();
  }

  CloseWindow();

  return 0;
}

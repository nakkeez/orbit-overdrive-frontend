import { Graphics } from "./graphics";
import { Socket } from "./socket";

enum Controls {
  UP = "ArrowUp",
  DOWN = "ArrowDown",
  LEFT = "ArrowLeft",
  RIGHT = "ArrowRight",
}

export enum PlayerAction {
  FORWARD = 0,
  RIGHT = 1,
  LEFT = 2,
  BACKWARD = 3,
}

export type SpaceShip = {
  id: string;
  x: number;
  y: number;
};

/**
 * Initializes the individual classes what the game consists of and handles the game loop.
 */
export class Game {
  private socket: Socket;
  private graphics: Graphics;

  /**
   * Creates a Game instance and initializes the Graphics and Socket classes.
   * @param gl - WebGL rendering context to draw on
   */
  constructor(gl: WebGLRenderingContext) {
    this.socket = new Socket(
      import.meta.env.VITE_WS_URL,
      (payload: SpaceShip) => {
        this.graphics.updateTrianglePosition(payload.id, payload.x, payload.y);
      },
      (id: string) => {
        this.graphics.removeTriangle(id);
      }
    );
    this.graphics = new Graphics(gl);

    document.addEventListener("keydown", this.onKeyPress.bind(this), false);
  }

  /**
   * Starts the game loop.
   * @public
   */
  public run() {
    this.loop(0);
  }

  /**
   * Loops through the game logic and rendering every frame.
   * @param currentTime - The current time in milliseconds
   * @private
   */
  private loop(currentTime: number) {
    this.graphics.drawScene();
    // Run the method again next frame
    requestAnimationFrame((t: number) => {
      this.loop(t);
    });
  }

  /**
   * Handles key press events and sends the corresponding action to the server.
   * @param event - The key press event
   * @private
   */
  private onKeyPress(event: KeyboardEvent) {
    let action: PlayerAction | null = null;

    switch (event.key) {
      case Controls.UP:
        action = PlayerAction.FORWARD;
        break;
      case Controls.DOWN:
        action = PlayerAction.BACKWARD;
        break;
      case Controls.LEFT:
        action = PlayerAction.LEFT;
        break;
      case Controls.RIGHT:
        action = PlayerAction.RIGHT;
        break;
      case "Escape":
        this.socket.disconnect();
    }

    if (action !== null) {
      this.socket.sendAction(action);
    }
  }
}

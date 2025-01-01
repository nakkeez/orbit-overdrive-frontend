import { Graphics } from "./graphics";
import { Controls } from "./controls";

/**
 * Initializes the individual classes what the game consists of.
 */
export class Game {
  private graphics: Graphics;
  private controls: Controls;

  /**
   * Creates a Game instance and initializes the Graphics and Controls classes.
   * @param gl - WebGL rendering context to draw on
   */
  constructor(gl: WebGLRenderingContext) {
    this.graphics = new Graphics(gl);
    this.controls = new Controls(this.updateTrianglePosition.bind(this));
  }

  /**
   * Updates the position of the triangle based on the current offsets.
   * @private
   */
  private updateTrianglePosition() {
    const { xOffset, yOffset } = this.controls.getOffsets();
    this.graphics.updateTrianglePosition(xOffset, yOffset);
  }
}

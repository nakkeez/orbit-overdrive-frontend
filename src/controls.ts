/**
 * Manages keyboard controls for the application.
 */
export class Controls {
  private xOffset: number = 0.0;
  private yOffset: number = 0.0;
  private updateCallback: () => void;

  /**
   * Creates a Controls instance and registers keyboard event listeners.
   * @param updateCallback - Function to call when an offset changes
   */
  constructor(updateCallback: () => void) {
    this.updateCallback = updateCallback;
    this.addEventListeners();
  }

  /**
   * Registers listeners for arrow keys to update offsets.
   * @private
   */
  private addEventListeners() {
    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp") {
        this.yOffset += 0.01;
      }
      if (event.key === "ArrowDown") {
        this.yOffset -= 0.01;
      }
      if (event.key === "ArrowLeft") {
        this.xOffset -= 0.01;
      }
      if (event.key === "ArrowRight") {
        this.xOffset += 0.01;
      }
      this.updateCallback();
    });
  }

  /**
   * Provides the current offset values along the x and y axes.
   * @returns An object containing xOffset and yOffset
   */
  public getOffsets() {
    return { xOffset: this.xOffset, yOffset: this.yOffset };
  }
}

import "./style.css";
import { Game } from "./game";

/**
 * Main function to initialize the game.
 */
function main() {
  const canvas = document.querySelector<HTMLCanvasElement>("#app");
  const gl = canvas?.getContext("webgl");

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it"
    );
    return;
  }

  const game = new Game(gl);
  game.run();
}

main();

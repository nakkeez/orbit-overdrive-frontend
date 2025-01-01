import "./style.css";
import { Game } from "./game";

function main() {
  const canvas = document.querySelector<HTMLCanvasElement>("#app");
  const gl = canvas?.getContext("webgl");

  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it"
    );
    return;
  }

  new Game(gl);
}

main();

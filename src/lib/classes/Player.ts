export default class Player {
  pos: Nums<"x" | "y">;
  #keyPressed: KeyPressed;

  constructor() {
    this.pos = { x: 0, y: 0 };
    this.#keyPressed = { w: false, s: false, a: false, d: false };
  }

  get keyPressed() {
    return this.#keyPressed;
  }

  set keyPressed(input: Partial<KeyPressed>) {
    this.#keyPressed = { ...this.#keyPressed, ...input };
  }
}

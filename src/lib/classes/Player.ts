import type { DataModel } from "@/convex/_generated/dataModel";

export default class Player {
  name: string;
  pos: Nums<"x" | "y">;
  status: "connected" | "disconnected";
  #keyPressed: KeyPressed;

  constructor(player: DataModel["games"]["document"]["players"][number]) {
    this.name = player.name;
    this.pos = player.pos;
    this.status = "disconnected";
    this.#keyPressed = { w: false, s: false, a: false, d: false };
  }

  get keyPressed() {
    return this.#keyPressed;
  }

  set keyPressed(input: Partial<KeyPressed>) {
    this.#keyPressed = { ...this.#keyPressed, ...input };
  }

  disconnect() {
    this.status = "disconnected";
  }

  connect() {
    this.status = "connected";
  }
}

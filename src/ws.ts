import { eventHandler } from "vinxi/http";
import { parseJson } from '~/utils';

export default eventHandler({
  handler() { },
  websocket: {
    async open(peer) {
      console.log('User connected!');
    },
    async message(peer, msg) {
      const message = parseJson(msg.text());
      // console.log(message)
      if (message.type === 'ping') {
        peer.send(JSON.stringify({ type: 'pong', ts: message.ts }))
        return
      }
      peer.publish('what', message)
      peer.send(message)
    },
    async close(peer, details) {
      console.log("close", peer.id);
    },
    async error(peer, error) {
      console.log("error", peer.id, error);
    },
  },
});
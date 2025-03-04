import { PlayerAction, SpaceShip } from "./game";

enum ClientMessageType {
  MOVE = 0,
}

type ClientMessage = {
  type: ClientMessageType.MOVE;
  playerId: string;
  action: PlayerAction;
};

enum ServerMessageType {
  CONNECT = 0,
  DISCONNECT = 1,
  UPDATE = 2,
}

type ServerMessage =
  | {
      type: ServerMessageType.CONNECT;
      player: SpaceShip;
    }
  | {
      type: ServerMessageType.DISCONNECT;
      playerId: string;
    }
  | {
      type: ServerMessageType.UPDATE;
      players: SpaceShip[];
    };

/**
 * Handles the WebSocket connection to the server.
 */
export class Socket {
  private open: boolean = false;
  private connection: WebSocket;
  private id?: string;
  public onServerMessage: (payload: SpaceShip) => void;
  public onDisconnect: (id: string) => void;

  /**
   * Creates a Socket instance and initializes the WebSocket connection.
   * @param url - URL of the WebSocket server
   * @param onServerMessage - Callback function to handle server messages
   * @param onDisconnect - Callback function to handle player disconnects
   */
  constructor(
    url: string,
    onServerMessage: (payload: SpaceShip) => void,
    onDisconnect: (id: string) => void
  ) {
    this.connection = new WebSocket(url);
    this.connection.onopen = () => this.handleOpen();
    this.connection.onmessage = (event) => this.handleMessage(event);
    this.connection.onclose = () => this.handleClose();
    this.onServerMessage = onServerMessage;
    this.onDisconnect = onDisconnect;
  }

  /**
   * Opens the WebSocket connection.
   * @private
   */
  private handleOpen() {
    this.open = true;
  }

  /**
   * Closes the WebSocket connection.
   * @private
   */
  private handleClose() {
    this.open = false;
  }

  /**
   * Handles incoming messages from the server.
   * @param event - The message event
   * @private
   */
  private handleMessage(event: MessageEvent) {
    const message = event.data;
    try {
      const gameEvent: ServerMessage = JSON.parse(message);
      switch (gameEvent.type) {
        case ServerMessageType.CONNECT:
          this.id = gameEvent.player.id;
          this.onServerMessage(gameEvent.player);
          break;
        case ServerMessageType.DISCONNECT:
          this.onDisconnect(gameEvent.playerId);
          break;
        case ServerMessageType.UPDATE:
          gameEvent.players.forEach((player) => {
            this.onServerMessage(player);
          });
          break;
      }
    } catch (error) {
      console.error("Error parsing message: " + error);
    }
  }

  /**
   * Sends a message to the server if the connection is open.
   */
  private sendMessage(message: ClientMessage) {
    if (!this.open) {
      return;
    }
    this.connection.send(JSON.stringify(message));
  }

  /**
   * Sends a move action to the server.
   * @param moveAction - The action to send
   */
  public sendAction(moveAction: PlayerAction) {
    const message: ClientMessage = {
      type: ClientMessageType.MOVE,
      playerId: this.id!,
      action: moveAction,
    };
    this.sendMessage(message);
  }

  /**
   * Closes the WebSocket connection.
   */
  public disconnect() {
    this.connection.close();
  }
}

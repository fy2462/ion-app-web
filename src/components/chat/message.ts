export default class Message {

  public id: string;
  public message: string;
  public senderName: string;

  constructor(messageData) {
    this.id = messageData.id;
    this.message = messageData.message;
    this.senderName = messageData.senderName || undefined;
  }
}

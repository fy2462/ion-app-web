export default class Message {

  id: string;
  message: string;
  senderName: string;

  constructor(messageData) {
    this.id = messageData.id;
    this.message = messageData.message;
    this.senderName = messageData.senderName || undefined;
  }
}

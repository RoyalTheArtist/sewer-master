type Message = {
    plainText: string,
    count: number
}

export class MessageLog {
    messages: Message[] = [];

    add(message: string) {
        if (this.messages.length > 0) {
            const lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage.plainText === message) {
                lastMessage.count++;
                return;
            }
        }
        this.messages.push({ plainText: message, count: 1 });
    }
}

const gameLog = new MessageLog();

export { gameLog };
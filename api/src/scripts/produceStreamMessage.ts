import { Kafka } from 'kafkajs';

async function produceStreamMessage() {
    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['127.0.0.1:29092'],
    })
    
    const producer = kafka.producer()
    
    await producer.connect()
    await producer.send(
        {
        topic: 'pokemon',
        messages: [
            { value: '{\"id\":143}' },
        ],
    })
    
    await producer.disconnect()
}

produceStreamMessage().then(() => console.log("message published"))
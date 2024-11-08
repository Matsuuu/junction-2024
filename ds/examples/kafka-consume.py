from confluent_kafka import Consumer

c = Consumer({
    'bootstrap.servers': '100.82.107.137',
    'group.id': 'mygroup',
    'auto.offset.reset': 'earliest'
})

c.subscribe(['testtopic'])

while True:
    msg = c.poll(1.0)

    if msg is None:
        continue
    if msg.error():
        print("Consumer error: {}".format(msg.error()))
        continue

    print('Received message: {}'.format(msg.value().decode('utf-8')))

c.close()

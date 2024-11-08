from confluent_kafka import Producer
from time import sleep

p = Producer({'bootstrap.servers': '100.82.107.137'})

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll() or flush(). """
    if err is not None:
        print('Message delivery failed: {}'.format(err))
    else:
        print('Message delivered to {} [{}]'.format(msg.topic(), msg.partition()))

for i in range(10000):
    p.produce('testtopic', f"foo{i}", callback=delivery_report)
    p.flush()
    sleep(3)



# Wait for any outstanding messages to be delivered and delivery report

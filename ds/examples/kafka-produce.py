from confluent_kafka import Producer
from time import sleep
from argparse import ArgumentParser
import json

p = Producer({'bootstrap.servers': 'datanautti'})

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll() or flush(). """
    if err is not None:
        print('Message delivery failed: {}'.format(err))
    else:
        print('Message delivered to {} [{}]'.format(msg.topic(), msg.partition()))

def produce(topic: str):
    for i in range(10000):
        # p.produce('testtopic', f"foo{i}", callback=delivery_report)
        p.produce(topic, json.dumps({"msg": "foo", "num": i}), callback=delivery_report)
        p.flush()
        sleep(3)


if __name__ == "__main__":
    parser = ArgumentParser()

    parser.add_argument("--topic", "-t", type=str, required=True)

    args = parser.parse_args()

    produce(topic=args.topic)


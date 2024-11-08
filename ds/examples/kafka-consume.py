from confluent_kafka import Consumer
from argparse import ArgumentParser
import json

c = Consumer({
    'bootstrap.servers': 'datanautti',
    'group.id': 'mygroup',
    'auto.offset.reset': 'earliest'
})


def consume(topic: str):
    c.subscribe([topic])

    while True:
        msg = c.poll(0.2)

        if msg is None:
            continue
        if msg.error():
            print("Consumer error: {}".format(msg.error()))
            continue

        print(json.loads(msg.value().decode("utf-8")))
        row = json.loads(msg.value().decode("utf-8"))
        print("ts", row["timestamp"])

if __name__ == "__main__":
    parser = ArgumentParser()

    parser.add_argument("--topic", "-t", type=str, required=True)

    args = parser.parse_args()

    consume(topic=args.topic)

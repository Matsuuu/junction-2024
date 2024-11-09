import psycopg
from argparse import ArgumentParser
import json
import random
from contextlib import contextmanager
from shapely.geometry import Polygon, Point
from datetime import datetime, timedelta



@contextmanager
def cursor(connection_string: str = "postgresql://postgres:hughmungus@localhost:5432"):
    conn = psycopg.connect(connection_string, autocommit=True)

    try:
        cursor = conn.cursor()
        yield cursor
    except psycopg.Error as e:
        print(e)
    finally:
        conn.close()

def polygon_random_points (poly):
    min_x, min_y, max_x, max_y = poly.bounds
    within_bounds = False
    while not within_bounds:
        random_point = Point([random.uniform(min_x, max_x), random.uniform(min_y, max_y)])
        within_bounds = random_point.within(poly)
    return random_point

def generate_sku_rows(count: int):
    colors = ["BLK", "WHT", "RED", "BLU"]
    sizes = ["S", "M", "L"]
    statuses = ["in-use", "available"]

    poly = Polygon([
        (60.16187210862001, 24.905913675424813),
        (60.16207148719754, 24.905784976757477),
        (60.161605783523655, 24.902930206318317),
        (60.16143550897037, 24.903202228501556)
    ])

    for i in range(count):
        sku = f"ACME-{random.randint(10000, 99999)}-{random.choice(sizes)}-{random.choice(colors)}"
        point = polygon_random_points(poly)
        lat = point.x
        lon = point.y
        status = random.choice(statuses)
        last_maintained_days = random.choice([30, 90, 180, 360, 720])
        last_maintained = datetime.now() - timedelta(days=last_maintained_days)
        next_scheduled_maintenance = last_maintained + timedelta(days=360)
        
        with cursor() as cur:
            cur.execute("""
            INSERT INTO inventory (sku, name, lat, lon, status, last_maintained, next_scheduled_maintenance)
            VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (sku, "foo", lat, lon, status, last_maintained, next_scheduled_maintenance)
            )


if __name__ == "__main__":
    parser = ArgumentParser()
    subparsers = parser.add_subparsers()

    sku_parser = subparsers.add_parser("sku")
    sku_parser.add_argument("--count", "-c", type=int, default=10)
    sku_parser.set_defaults(func=generate_sku_rows)

    args = parser.parse_args()

    func_name = args.func.__name__

    if func_name == "generate_sku_rows":
        args.func(args.count)

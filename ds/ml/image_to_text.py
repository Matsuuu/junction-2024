import cv2
import pytesseract
import sys
from argparse import ArgumentParser
import json
import re
import os
import psycopg
from loguru import logger


def show_wait_close(img):
    cv2.imshow("img", img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

img_map = {
    "ds/ml/images/20200124_091405.jpg": {
        "x": 600,
        "y": 700,
        "w": 1800,
        "h": 2700
    },
    "ds/ml/images/20231107_105353.jpg": {
        "x": 1300,
        "y": 1300,
        "w": 1450,
        "h": 1100
    },
    "ds/ml/images/IMG_2284.JPG": {
        "x": 500,
        "y": 500,
        "w": 5000,
        "h": 2800
    }
}

def text_to_rows(text: str):
    rows = []
    for line in text.split("\n"):
        if line.strip() != "":
            if not line.strip().endswith(":"):
                rows.append(line)

    return rows

def is_phone_number(text: str):
    match = re.search("(\+358|09)(\-|\ |)\d+(\-|\ |\d+)(\d+)(\-|\ |)()\d+", text)
    if match:
        return match.group(0)
    return None


def image_to_text(image_path: str,
                  x: int | None = None,
                  y: int | None = None,
                  w: int | None = None,
                  h: int | None = None):


    logger.info(f"Reading image at {image_path}")
    img = cv2.imread(image_path)
    if image_path in img_map.keys():
        x = img_map[image_path]["x"]
        y = img_map[image_path]["y"]
        w = img_map[image_path]["w"]
        h = img_map[image_path]["h"]
    else:
        if not all([x,y,w,h]):
            raise ValueError(f"No coordinates for image {image_path}")
        else:
            x = x
            y = y
            w = w
            h = h

    # sys.exit()
    pad_color = img[0,0,:]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    _, thresh1 = cv2.threshold(gray, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_TRUNC)

    im2 = img.copy()

    rect = cv2.rectangle(im2, (x, y), (x + w, y + h), (0, 255, 0), 8)

    # cropped = im2[y:y + h, x:x + w]
    logger.info(f"Cropping with x={x} y={y} w={w} h={h}")
    cropped = thresh1[y:y + h, x:x + w]
    show_wait_close(cv2.resize(cropped, (800,800)))

    text = pytesseract.image_to_string(cropped)

    rows = text_to_rows(text)
    info_dict = {"others": []}
    for row in rows:
        if len(row.split(":")) == 2:
            k, v = row.split(":")
            info_dict[k] = v
            continue
        if len(row.split(".")) == 2:
            k, v = row.split(".")
            info_dict[k] = v
            continue
        if is_phone_number(row):
            info_dict["phone_number"] = is_phone_number(row)
            continue
        info_dict["others"].append(row)

    os.makedirs("ds/ml/imagetext_results", exist_ok=True)
    print(json.dumps(info_dict, indent=4))
    with open(f"ds/ml/imagetext_results/{image_path.split('/')[-1]}", "w") as rec_file:
        json.dump(info_dict, rec_file)

    print("DUMP")
    print(text.strip())

    show_wait_close(cv2.resize(im2, (800,800)))

    logger.info(f"Uploading {image_path.split('/')[-1]} results to DB")
    upload_imagetext_to_db(image_path.split("/")[-1], info_dict, image_path)

    return info_dict




def upload_imagetext_to_db(name: str, result: dict, path: str):
    with psycopg.connect("postgresql://postgres:hughmungus@localhost:5432") as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO imagetext (name, text, path)
                VALUES (%s, %s, %s)
                ON CONFLICT (name) DO UPDATE
                SET
                    text = EXCLUDED.text,
                    path = EXCLUDED.path
                """,
                (name, json.dumps(result), path)
                )


if __name__ == "__main__":
    parser = ArgumentParser()

    parser.add_argument("--image", "-i", type=str, required=True)

    args = parser.parse_args()

    image_to_text(args.image)


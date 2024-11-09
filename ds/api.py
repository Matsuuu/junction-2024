import os
from flask import Flask, flash, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from ds.ml.image_to_text import image_to_text

UPLOAD_FOLDER = 'ds/uploaded_images/'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return {"error": "no file in request.files"}
        file = request.files['file']

        if file.filename == '':
            print("empty filename")
            flash('No selected file')
            return {"error": "no filename"}
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return {"file": filename, "sent": True}
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.route('/file-coordinates', methods=['GET', 'POST'])
def upload_file_coordinates():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return {"error": "no file in request.files"}
        file = request.files['file']

        if file.filename == '':
            print("empty filename")
            flash('No selected file')
            return {"error": "no filename"}
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            full_path = os.path.join(UPLOAD_FOLDER, file.filename)
            print(request.args)
            x = request.args.get("x")
            y = request.args.get("y")
            w = request.args.get("w")
            h = request.args.get("h")
            print("X:", x)
            print("Y:", y)
            print("W:", w)
            print("H:", h)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            result_dict = image_to_text(full_path,
                                        x=x,
                                        y=y,
                                        w=w,
                                        h=h)
            return result_dict
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.route("/test", methods=["GET", "POST"])
def test():
    return {"x": request.args.get("x")}

if __name__ == "__main__":
    # CURL
    # curl -X POST -F file=@ml/images/20200124_091405.jpg localhost:5000

    app.secret_key = 'super secret key'
    app.run(debug=True,
            host="0.0.0.0")

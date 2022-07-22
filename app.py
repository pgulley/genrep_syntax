from flask import Flask, render_template, url_for, request
import json

app = Flask(__name__)


@app.route("/")
def main():
	return render_template("main.html",
		css = url_for("static", filename="style.css"),
		base64_loc = url_for('static', filename="base64binary.js"),
		mainjs_loc=url_for("static", filename="main.js"),
		midi_loc = url_for("static", filename="midi.min.js"),
		line_loc = url_for("static", filename="leader-line.min.js")
	)


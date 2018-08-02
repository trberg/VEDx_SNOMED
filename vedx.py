from flask import Flask, request, redirect, session, url_for, render_template, make_response, jsonify
import pandas as pd
from io import StringIO
import json
from GenerateJSON import generateJSON_counts


application = Flask(__name__)

@application.route('/')
def dashboard():
    return render_template("index.html")


@application.route('/csv_data', methods=['POST'])
def csv_data():

    data = StringIO(request.data.decode("utf-8"), newline='\n')

    data_csv = pd.read_csv(data, sep=",")

    JSON_data = generateJSON_counts(data_csv)

    outfile.write(json.dumps(JSON_data, indent=2))
    outfile.close()
    
    return jsonify(JSON_data)


if __name__ == '__main__':
    application.debug=True
    application.run(threaded=True)
    #application.run(host="0.0.0.0", port=8080, threaded=True)
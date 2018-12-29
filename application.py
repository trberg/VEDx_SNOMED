from flask import Flask, request, redirect, session, url_for, render_template, make_response, jsonify
import pandas as pd
from io import StringIO
import json
from GenerateJSON import generateJSON_counts, generateJSON_scores


application = Flask(__name__)

@application.route('/')
def dashboard():
    return render_template("index.html")


@application.route('/csv_data', methods=['POST'])
def csv_data():

    data = StringIO(request.data.decode("utf-8"), newline='\n')

    data_csv = pd.read_csv(data, sep=",")

    datatype = "None"
    code_column = False

    try:
        data_csv["counts"]
        datatype = "counts"
    except KeyError:
        pass
    
    try:
        data_csv["scores"]
        datatype = "scores"
    except KeyError:
        pass

    try:
        data_csv["score"]
        datatype = "score"
    except KeyError:
        pass
    
    try:
        data_csv["ICD 9 Code"]
        code_column = True
    except KeyError:
        pass
    
    if not code_column:
        try:
            data_csv["ICD 9 Code"] = data_csv["codes"]
            code_column = True
        except KeyError:
            pass
        
        try:
            data_csv["ICD 9 Code"] = data_csv["code"]
            code_column = True
        except KeyError:
            pass
        
        try:
            data_csv["ICD 9 Code"] = data_csv["icd 9 codes"]
            code_column = True
        except KeyError:
            pass
        
        try:
            data_csv["ICD 9 Code"] = data_csv["icd9 codes"]
            code_column = True
        except KeyError:
            pass
    
    if code_column:
        if datatype == "counts":
            JSON_data = generateJSON_counts(data_csv)
        elif datatype == "scores" or datatype == "score":
            JSON_data = generateJSON_scores(data_csv, datatype)
        else:
            return make_response(500, "file format issues")
    else:
        return make_response(500, "file format issues")


    
    """outfile=open("static/data/summer_dataset.json", "w")
    outfile.write(json.dumps(JSON_data, indent=2))
    outfile.close()"""
    
    
    return jsonify(JSON_data)


if __name__ == '__main__':
    application.debug=True
    application.run(threaded=True)
    #application.run(host="0.0.0.0", port=8080, threaded=True)
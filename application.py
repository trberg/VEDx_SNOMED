from flask import Flask, request, redirect, session, url_for, render_template, make_response, jsonify
import pandas as pd
from io import StringIO
import json
from GenerateJSON import generateJSON_counts, generateJSON_scores
from DxCodeHandler.ICD9 import ICD9

application = Flask(__name__)

@application.route('/')
def dashboard():
    return render_template("index.html")


@application.route('/process_data', methods=['POST'])
def process_data():
    
    data = StringIO(request.data.decode("utf-8"), newline='\n')
    
    CSV  = False


    ## CHECK FOR JSON FILE FORMAT
    try:
        json_data = json.load(data)
        JSON = True
    except json.decoder.JSONDecodeError:
        JSON = False
        data.seek(0)
    
    ## HANDLE JSON INPUT FILES
    if JSON:
        ## TODO JSONIFY DATA
        return jsonify(JSON_data)
    
    ## IF JSON FILE NOT DETECTED, TRY AND TREAT LIKE A CSV
    try:
        data_csv = pd.read_csv(data, sep=',')
        CSV = True
    except pd.errors.EmptyDataError as e:
        return make_response(("Could not parse input file. Make sure the file follows the specifications.", 500))

    datatype = "None"
    code_column = False

    if CSV:
        data_csv.columns = [str(i).lower() for i in data_csv.columns]

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
    

    code_column_mapping = {
        "codes": "ICD 9 Code",
        "code": "ICD 9 Code",
        "icd 9 codes": "ICD 9 Code",
        "icd9 codes": "ICD 9 Code",
        "icd 9 code": "ICD 9 Code",
        "icd9 code": "ICD 9 Code"
    }
    data_csv = data_csv.rename(mapper=code_column_mapping, axis=1)
    
    if "ICD 9 Code" in data_csv.columns:
        icd9 = ICD9(errorHandle="NoDx")
        data_csv["code status"] = data_csv["ICD 9 Code"].apply(lambda x: icd9.isCode(x))
        data_csv = data_csv[data_csv["code status"]]
        #data_csv = data_csv[data_csv["scores"] > 200]
        if datatype == "counts":
            JSON_data = generateJSON_counts(data_csv)
        elif datatype == "scores" or datatype == "score":
            JSON_data = generateJSON_scores(data_csv, datatype)
        else:
            return make_response(("Input file requires a 'counts' or 'scores' column", 500))
    else:
        return make_response(("Input file requires a column named (code, codes, icd 9 codes, icd 9 codes)", 500))


    """outfile=open("static/data/summer_dataset.json", "w")
    outfile.write(json.dumps(JSON_data, indent=2))
    outfile.close()"""
    
    return jsonify(JSON_data)


if __name__ == '__main__':
    application.debug=True
    application.run(threaded=True)
    #application.run(host="0.0.0.0", port=8080, threaded=True)
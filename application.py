from flask import Flask, request, redirect, session, url_for, render_template, make_response, jsonify

import pandas as pd
import dask.dataframe as dd

#from GenerateJSON import generateJSON_counts, generateJSON_scores
#from DxCodeHandler.ICD9 import ICD9

## BUILD THE SMOMED DATA TREE
def build_snomed_data():

    ## GATHER CONCEPT DATA
    concepts = dd.read_csv("static/data/CONCEPT.csv", sep="\t")
    concepts = concepts[(concepts["standard_concept"]=="S") & (concepts["vocabulary_id"]=="SNOMED")][["concept_id", "concept_name"]]
    concepts = concepts.compute()
    
    ## GATHER ANCESTOR DATA
    ancestor_data = dd.read_csv("static/data/CONCEPT_ANCESTOR.csv", sep="\t") #, nrows=100)
    ancestor_data = ancestor_data[ancestor_data["min_levels_of_separation"]==1]

    ## ADD DESCRIPTIONS TO ANCESTOR DATA
    ancestor_data = ancestor_data.merge(concepts, left_on="ancestor_concept_id", right_on="concept_id")[["ancestor_concept_id", "concept_name", "descendant_concept_id"]]
    ancestor_data.columns = ["ancestor_concept_id", "ancestor_concept_name", "descendant_concept_id"]
    ancestor_data = ancestor_data.merge(concepts, left_on="descendant_concept_id", right_on="concept_id")[["ancestor_concept_id", "ancestor_concept_name", "descendant_concept_id", "concept_name"]]
    ancestor_data.columns = ["ancestor_concept_id", "ancestor_concept_name", "descendant_concept_id", "descendant_concept_name"]

    ancestor_data = ancestor_data.compute()

    return ancestor_data


SNOMED_DATA = build_snomed_data()


application = Flask(__name__)


@application.route('/')
def dashboard():
    return render_template("index_dag.html")


@application.route('/children')
def get_children():

    # get parent code from URL
    code = int(request.args.get('code'))
    ## print (code)
    children_nodes = {"children": []}

    children = SNOMED_DATA[SNOMED_DATA["ancestor_concept_id"]==code]
    #print (children)
    
    for i,row in children.iterrows():
        temp_child = {
            "id": str(row["descendant_concept_id"]),
            "counts": 0,
            "name": row["descendant_concept_name"],
            "color": "#D3D3D3",
            "parents": [str(row["ancestor_concept_id"])],
            "children": []
        }
        children_nodes["children"].append(temp_child)

    return children_nodes


@application.route('/parents')
def get_parents(code):

    # get child code from URL
    code = int(request.args.get('code'))
    parent_nodes = {"parents": []}

    parents = SNOMED_DATA[SNOMED_DATA["descendant_concept_id"]==code]

    for i,row in parents.iterrows():
        temp_parent = {
            "id": str(row["ancestor_concept_id"]),
            "counts": 0,
            "name": row["ancestor_concept_name"],
            "color": "#D3D3D3",
            "parents": [],
            "children": [str(code)],
            "hidden": "False"
        }

        parent_nodes["parents"].append(temp_parent)

    return parent_nodes


if __name__ == '__main__':
    application.debug=True
    application.run()
    #application.run(host="0.0.0.0", port=8080, threaded=True)
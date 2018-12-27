
from collections import Counter
import json
import sys
from DxCodeHandler.ICD9 import ICD9

icd9 = ICD9("NoDx")

#print (icd9.description("800-999"))

threshold_count = 0
threshold_score = 10


def description_handle(code):

    descr = icd9.description(code)
    if descr.startswith("Other and Unspecified"):
        descr = descr.replace("Other and Unspecified ", "").rstrip().lstrip()
    elif "Other and Unspecified" in descr:
        descr = descr.replace("Other and Unspecified", "Unspecified")


    if descr.endswith("Unspecified"):
        descr = descr.replace(", Unspecified", "")


    if "Without Mention of Infection" in descr:
        descr = descr.replace(", Without Mention of Infection", "")


    if "Infected" in descr:
        descr = descr.replace(", Infected", "")
        
    
    if "Other, Multiple, and" in descr:
        descr = descr.replace("Other, Multiple, and ", "")
         

    if "[second Degree]" in descr:
        descr = descr.replace(" [second Degree]", "")
        descr = descr.replace("[second Degree], ", "")

    if "Without Collision" in descr:
        descr = descr.replace(", Without Collision on the Highway,", "")
        descr = descr.replace(", Without Collision on the Highway", "")
    
    if "Insect Bite" in descr:
        descr = descr.replace(", Nonvenomous,", "")
        descr = descr.replace(", Nonvenomous", "")
        
    if "of Unspecified Nature" in descr:
        descr = descr.replace(" of Unspecified Nature", "")
        
    if "Sting" in descr:
        descr = descr.replace("Hornets, Wasps, and Bees", "Insect")
        descr = descr.replace("Poisoning and ", "")
    
    if "Complications Affecting Other Specified Body Systems, Hypertension" == descr:
        descr = "Surgical Complications, Hypertension"
    
    if "Supplementary" in descr:
        descr = descr.replace(" and Poisoning", "")
    
    if "Other Than Motorcycle" in descr:
        descr = descr.replace(" in Motor Vehicle Other Than Motorcycle", "")
        descr = descr.replace(" of Motor Vehicle Other Than Motorcycle", "")
        ##print descr
    
    if "--" in descr:
        descr = descr.split(" -- ")[0]

    descr = descr.capitalize()

    if (len(descr.split(" ")) > 5):
        #print descr
        pass
    return descr


def addChildren(code, ancestors, code_counts):
    output = []
    is_output = False
    for child in icd9.children(code):
        temp = {}
        if child in ancestors:
            if child == None:
                pass
            else:
                temp["name"] = child

                children = addChildren(child, ancestors, code_counts)
                if children == None:
                    pass
                else:
                    temp["children"] = children

                temp["description"] = description_handle(child)
                temp["parent"] = icd9.parent(child)
                temp["depth"] = icd9.depth(child)
                try:
                    temp["size"] = code_counts[child]
                    
                    if temp["size"] > threshold_count:
                        output.append(temp)
                        is_output = True
                    else:
                        pass
                except:
                    pass
                
        else:
            pass
    if output == []:
        return None
    else:
        return output


def creating_JSON_tree(code_list, code_counts, calc_type):
    #all_codes = list(icd9.getAllCodes())

    all_codes = code_list
    parents = (sorted(list(set(icd9.abstract(all_codes, 1)))))
    parents = [i for i in parents if i != "NoDx"]

    ancestors = set(icd9.ancestors(all_codes))

    tree = []

    for code in parents:
        temp = {}
        temp["name"] = str(code)
        temp["description"] = description_handle(code)
        temp["parent"] = icd9.parent(code)
        temp["depth"] = icd9.depth(code)
        children = addChildren(code, ancestors, code_counts)

        if children == None:
            pass
        else:
            temp["children"] = children

        temp["size"] = code_counts[code]
        if calc_type in ["counts", "score"]:
            tree.append(temp)
            is_output = True
        else:
            Exception("Something is wrong")
    return tree


def generateTree(code_counts, calc_type):
    codes = [code for code in code_counts.keys() if code != "ICD 9 Root"]
    all_children = creating_JSON_tree(codes, code_counts, calc_type)
    tree = {
        "size": code_counts["ICD 9 Root"],
        "name": "trauma",
        "description": "ICD 9 Root",
        "children": all_children,
        "parent": "null",
        "depth": "null"
    }

    return tree
    

def generateJSON_scores(pd_csv, datatype):

    #pd_csv["ICD 9 Code"] = pd_csv["ICD 9 Code"].astype(str)
    print (pd_csv)
    #pd_csv = pd_csv[pd_csv[datatype] != "#NUM!"]
    pd_csv[datatype] = pd_csv[datatype].astype(float)
    pd_csv = pd_csv[pd_csv[datatype] > threshold_score]

    print (pd_csv)
    csv = pd_csv.set_index("ICD 9 Code").to_dict()[datatype]
    score_output = {}
    for k,v in csv.items():
        cur_code = k
        
        while (cur_code != None and cur_code != "NoDx"):
            try:
                score_output[cur_code] = csv[cur_code]
            except KeyError:
                score_output[cur_code] = 5
            cur_code = icd9.parent(cur_code)
    score_output["ICD 9 Root"] = 5
    calc_type = "score"
    return generateTree(score_output, calc_type)
    



def generateJSON_counts(pd_csv):

    pd_csv["ICD 9 Code"] = pd_csv["ICD 9 Code"].astype(str)
    csv = Counter(pd_csv.set_index("ICD 9 Code").to_dict()["counts"])
    code_counts = Counter()
    
    for k,v in csv.items():
        cur_code = k
        count = 1
        while cur_code != None:
            if icd9.isCode(cur_code):
                code_counts[cur_code] += v
                cur_code = icd9.parent(cur_code)
            else:
                cur_code = None

        
    root_count = 0

    for i in code_counts:
        if icd9.depth(i) == 1:
            root_count += code_counts[i]
    code_counts["ICD 9 Root"] += root_count
    calc_type = "counts"
    return generateTree(code_counts, calc_type)

    
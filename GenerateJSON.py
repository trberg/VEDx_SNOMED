
from collections import Counter
import json
import sys
from DxCodeHandler.ICD9 import ICD9

icd9 = ICD9("NoDx")

#print (icd9.description("800-999"))

threshold_count = 0
threshold_score = 0
max_node_count = 400


def description_handle(code):
    
    if icd9.description(code) == None:
        return "None"
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
                temp["description"] = description_handle(child)
                temp["parent"] = icd9.parent(child)
                temp["depth"] = icd9.depth(child)
                children = addChildren(child, ancestors, code_counts)
                if children == None:
                    pass
                else:
                    temp["children"] = children
                    temp["_children"] = None

                try:
                    temp["size"] = code_counts[child]
                    
                    if temp["size"] > threshold_count:
                        output.append(temp)
                        is_output = True
                    else:
                        pass
                except KeyError:
                    temp["size"] = 1
                    output.append(temp)
                    is_output = True
                
        else:
            pass
    if output == []:
        return None
    else:
        return output


def getWeight(code, ancestors, code_counts):
    child_weights = []
    
    for child in icd9.children(code):
        if child in ancestors:
            if child == None:
                childWeight = 0
            else:
                childWeight = getWeight(child, ancestors, code_counts)

                try:
                    child_size = code_counts[child]
                except KeyError:
                    child_size = 1
            child_weights.append(childWeight + child_size)
        else:
            pass
    return sum(child_weights)


def creating_JSON_tree(code_list, code_counts, calc_type):
    
    all_codes = list(set(icd9.ancestors(code_list)))
    

    depth_count = Counter()
    for code in all_codes:
        depth_count[icd9.depth(code)] += 1

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
            temp["_children"] = None

        try:
            temp["size"] = code_counts[code]
        except KeyError:
            temp["size"] = 1
        
        if children == None:
            temp["node_weight"] = temp["size"]
        else:
            temp["node_weight"] = getWeight(code, ancestors, code_counts) + temp["size"]

        if calc_type in ["counts", "score"]:
            tree.append(temp)
            is_output = True
        else:
            Exception("Something is wrong")
    return tree


def weight_nodes(node):
    
    if "children" in node.keys():
        for child in node["children"]:
            cur_node = weight_nodes(child)
            cur_node_weight += cur_node["node_weight"]
            child_sizes += cur_node["size"]
    
    node["node_weight"] = cur_node_weight + child_sizes

    return node


def prune_nodes(node, weight):
    #return node, weight
    if "children" in node.keys():
        
        if node["node_weight"] <= weight:
            node["_children"] = node["children"]
            node["children"] = None
        else:
            new_children = []
            for child in node["children"]:
                new_child, weight = prune_nodes(child, weight)
                new_children.append(new_child)
            node["children"] = new_children
    return node, weight
    

def weight_tree(tree):

    weights = []

    tree, weights = weight_nodes(tree, weights)

    return tree


def prune_tree(tree):

    weights = []

    tree, weights = weight_nodes(tree, weights)

    weights.sort(reverse=True)
    weights = weights[:100]
    min_weight = min(weights)
    print (min_weight)
    tree, min_weight = prune_nodes(tree, min_weight)

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
        "depth": "null",
        "node_weight": 10000
    }
    #print (tree)
    return tree
    

def generateJSON_scores(pd_csv, datatype):

    #pd_csv["ICD 9 Code"] = pd_csv["ICD 9 Code"].astype(str)
    #pd_csv = pd_csv[pd_csv[datatype] != "#NUM!"]
    
    pd_csv[datatype] = pd_csv[datatype].astype(float)
    pd_csv = pd_csv[pd_csv[datatype] > threshold_score]

    

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

    
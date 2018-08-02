
from collections import Counter
import json
from DxCodeHandler.DxCodeHandler import ICD9
icd9 = ICD9()


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

                temp["description"] = icd9.description(child)
                temp["parent"] = icd9.parent(child)
                temp["depth"] = icd9.depth(child)
                try:
                    temp["size"] = code_counts[child]
                    
                    if temp["size"] > 0:
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


def creating_JSON_tree(code_list, code_counts):
    #all_codes = list(icd9.getAllCodes())

    all_codes = code_list
    parents = (sorted(list(set(icd9.abstract(all_codes, 1)))))
    ancestors = set(icd9.ancestors(all_codes))

    tree = []

    for code in parents:
        temp = {}
        temp["name"] = str(code)
        temp["description"] = icd9.description(code)
        temp["parent"] = icd9.parent(code)
        temp["depth"] = icd9.depth(code)
        children = addChildren(code, ancestors, code_counts)
        if children == None:
            pass
        else:
            temp["children"] = children

        try:
            temp["size"] = code_counts[code]
            tree.append(temp)
        except KeyError:
            pass

    return tree
    

def generateJSON_counts(pd_csv):
    
    pd_csv["ICD 9 Code"] = pd_csv["ICD 9 Code"].astype(str)
    csv = Counter(pd_csv.set_index("ICD 9 Code").to_dict()["counts"])
    code_counts = Counter()
    
    for k,v in csv.items():
        cur_code = k

        while cur_code != None:
            code_counts[cur_code] += v
            cur_code = icd9.parent(cur_code)

    root_count = 0
    for i in code_counts:
        if icd9.depth(i) == 1:
            root_count += code_counts[i]
    
    codes = list(code_counts.keys())
    code_counts["ICD 9 Root"] += root_count

    all_children = creating_JSON_tree(codes, code_counts)
    tree = {
        "size": code_counts["ICD 9 Root"],
        "name": "trauma",
        "description": "ICD 9 Root",
        "children": all_children,
        "parent": "null",
        "depth": "null"
    }
    
    #tree = [tree]
    #final_tree = (json.dumps(tree, indent=2))
    return tree
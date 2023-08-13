import json
import pandas as pd

character_df = pd.read_excel("Character Map.xlsx", index_col=0)

character_dict = character_df.T.to_dict()

node_list = []
link_list = []
character_list = []
character_map = {}

for character_name, relation_dict in character_dict.items():
    father_name = str(relation_dict["Father"])

    if character_name not in character_list:
        character_list.append(character_name)
        temp_node = {"id": character_name, "group": 1}
        node_list.append(temp_node)

    if father_name not in character_list:
        if father_name != "nan":
            character_list.append(father_name)
            temp_node = {"id": father_name, "group": 1}
            node_list.append(temp_node)

    if father_name != "nan":
        temp_link = {
            "source": character_name,
            "target": father_name,
            "value": 1,
        }
        link_list.append(temp_link)

character_map["nodes"] = node_list
character_map["links"] = link_list

with open("Character Map.json", "w") as file:
    json.dump(character_map, file, indent=4)

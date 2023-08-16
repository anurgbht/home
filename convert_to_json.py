import json
import string
import pandas as pd

gender_color_map = {"M": 1, "F": 5, "X": 3}


def add_a_to_consonant_ending(name_string):
    """Adds "a" to the end of a string if the last letter is a consonant.

    Args:
      name_string: The string to be checked.

    Returns:
      The string with "a" added to the end if the last letter is a consonant, or the
      original string if the last letter is a vowel.
    """

    # Get the last letter of the string.
    last_letter = name_string[-1]

    # Check if the last letter is a consonant.
    if not last_letter.isalpha():
        return name_string

    consonants = set("bcdfghjklmnpqrstvwxyz0123456789")
    if last_letter in consonants:
        return name_string + "a"
    else:
        return name_string


def remove_whitespace_and_special_characters(name_string: str):
    """Removes all white spaces and special characters from the beginning and end of a string.

    Args:
      name_string: The string to be cleaned.

    Returns:
      The cleaned string.
    """

    # Remove all leading and trailing whitespace.
    name_string = name_string.strip()

    # Remove all special characters.
    special_characters = set(string.punctuation)
    name_string = "".join(ch for ch in name_string if ch not in special_characters)

    return name_string


def process_data_field(
    node_list: list,
    link_list: list,
    character_list: list,
    character_name: str,
    field_names: str,
    group_value: int,
    relation_dict_gender_check: dict,
):
    """Processes a data field and adds it to the node list, link list, and character list.

    Args:
        node_list: The list of nodes.
        link_list: The list of links.
        character_list: The list of characters.
        character_name: The name of the character.
        field_names: The names of the fields.
        group_value: The group value.

    Returns:
        The updated node list, link list, and character list.
    """

    for field_name in field_names.split(","):
        field_name = standard_name(field_name)
        try:
            ## find field gender
            gender_value = gender_color_map[
                relation_dict_gender_check[field_name]["Gender"]
            ]
        except Exception as e:
            gender_value = gender_color_map["X"]
            if field_name.startswith("Arjun"):
                print(field_name, gender_value, e, relation_dict_gender_check)

        # Check if the field name is already in the character list.
        if field_name not in character_list and field_name != "nana":
            # Add the field name to the character list.
            character_list.append(field_name)

            # Create a node for the field name.
            temp_node = {"id": field_name, "group": gender_value}
            node_list.append(temp_node)

        # Check if the field name is not equal to nan.
        if field_name != "nana":
            # Create a link for the field name.
            if group_value == 3:
                temp_link = {
                    "source": character_name,
                    "target": field_name,
                    "value": gender_value,
                }
            else:
                temp_link = {
                    "source": field_name,
                    "target": character_name,
                    "value": gender_value,
                }
            link_list.append(temp_link)

    return node_list, link_list, character_list


def standard_name(name_str):
    return add_a_to_consonant_ending(remove_whitespace_and_special_characters(name_str))


if __name__ == "__main__":
    character_df = pd.read_excel("Character Map.xlsx", index_col=0)
    character_df.index = character_df.index.map(standard_name)

    character_dict = character_df.T.to_dict()

    with open("Character Dict.json", "w") as file:
        json.dump(character_dict, file, indent=4)

    node_list = []
    link_list = []
    character_list = []
    character_map = {}

    for character_name, relation_dict in character_dict.items():
        if character_name not in character_list:
            character_list.append(character_name)
            temp_node = {
                "id": character_name,
                "group": gender_color_map[str(relation_dict["Gender"])],
            }
            node_list.append(temp_node)

        node_list, link_list, character_list = process_data_field(
            node_list,
            link_list,
            character_list,
            character_name,
            str(relation_dict["Father"]),
            1,
            character_dict,
        )

        node_list, link_list, character_list = process_data_field(
            node_list,
            link_list,
            character_list,
            character_name,
            str(relation_dict["Mother"]),
            2,
            character_dict,
        )

        node_list, link_list, character_list = process_data_field(
            node_list,
            link_list,
            character_list,
            character_name,
            str(relation_dict["Kids"]),
            3,
            character_dict,
        )

    character_map["nodes"] = node_list
    character_map["links"] = link_list

    with open("Character Map.json", "w") as file:
        json.dump(character_map, file, indent=4)

import json

def order_nodes(nodes: dict):
    # Initialize adjacency list and indegree count
    adj_list = {}
    indegree = {}

    for node_id, node_data in nodes.items():
        # Initialize indegree for each node
        indegree[node_id] = 0
        # Initialize adjacency list for each node
        adj_list[node_id] = []

    # Populate adjacency list and indegree count
    for node_id, node_data in nodes.items():
        outputs = node_data.get("outputs", [])
        for output in outputs:
            connections = output.get("connections", [])
            for connection in connections:
                target_node_id = str(connection["node"])  # Convert node ID to string
                adj_list[target_node_id] = adj_list.get(target_node_id, [])  # Ensure key exists
                adj_list[target_node_id].append(node_id)
                indegree[node_id] += 1

    # Perform topological sort
    ordered_nodes = []
    queue = []

    # Add nodes with indegree 0 to the queue
    for node_id, count in indegree.items():
        if count == 0:
            queue.append(node_id)

    while queue:
        current_node_id = queue.pop(0)
        ordered_nodes.append(current_node_id)

        # Reduce the indegree of adjacent nodes
        for neighbor_id in adj_list.get(current_node_id, []):  # Ensure key exists
            indegree[neighbor_id] -= 1
            # If indegree becomes 0, add the node to the queue
            if indegree[neighbor_id] == 0:
                queue.append(neighbor_id)

    # Convert node IDs back to integers and return ordered nodes
    ordered_nodes = [int(node_id) for node_id in ordered_nodes]
    ordered_nodes.reverse()
    return ordered_nodes

def simplify(code: dict):
    simplified_code = {}
    for node_id, node_data in code.items():
        simplified_node_data = {
            "data": node_data.get("data", {}),
            "inputs": node_data.get("inputs", []),
            "outputs": node_data.get("outputs", [])
        }
        simplified_code[node_id] = simplified_node_data
    return simplified_code


def get_node_outputs(code,nodeId):
    for node_id, node_data in code.items():
        if node_id == nodeId:
            return node_data['outputs']

def get_node_input(code,nodeId):
    for node_id, node_data in code.items():
        if node_id == nodeId:
            return node_data['inputs']

def translate_from_json_to_py(codeData):
    codeList = ''''''
    code = simplify({node_id: codeData[str(node_id)] for node_id in order_nodes(codeData)})
    for node_id, node_data in code.items():
        if node_data['data']['type'] == "function":
            codeList += "@client.event\n"
            print(node_data)
            codeList += f"async def {node_data['data']['name']}({','.join(node_data['data']['inputs'])}):\n"
            codeList += "    "
        elif node_data['data']['type'] == "message" and node_data['data']['connectedIn']:
            codeList += "content, user, channel = message.content, message.author, message.channel\n"
            codeList += "    "
        elif node_data['data']['type'] == "callable" and node_data['data']['name'] == "send" and node_data['data']['connectedIn']:
            input_value = node_data['data']['inputs'][1][0]
            if str(input_value).startswith('"') or str(input_value).startswith('{{"'):
                codeList += f"await channel.send(f{input_value})\n"
            else:
                codeList += f"await channel.send(f'{input_value}')\n"
            if node_data['data']['connectedOut']:
                codeList += "    "
        elif node_data['data']['type'] == "callable" and node_data['data']['name'] == "print" and node_data['data']['connectedIn']:
            input_value = node_data['data']['str']
            if str(input_value).startswith('"') or str(input_value).startswith('{{"'):
                codeList += f"print(f{input_value})\n"
            else:
                codeList += f"print(f'{input_value}')\n"
            if node_data['data']['connectedIn']:
                codeList += "    "
        elif node_data['data']['type'] == "user":
            codeList += f'user_id, user_name = message.author.id, message.author.name\n'
            codeList += "    "
        elif node_data['data']['type'] == "channel":
            codeList += f'channel_id, channel_name = message.channel.id, message.channel.name\n'
            codeList += '    '
    return codeList

def main():
    code = json.load(open("C:\\Users\\amine\\OneDrive\\Documents\\GitHub\\Bot-Management\\Bots\\DBolt\\data\\code.json", "r+"))['code']
    print(translate_from_json_to_py(code))

if __name__ == '__main__':
    main()
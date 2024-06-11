var actionSocket = new D3NE.Socket("action", "Action object", "hint");
var stringSocket = new D3NE.Socket("string", "String value", "hint");
var integerSocket = new D3NE.Socket("integer", "Integer value", "hint");
var messageSocket = new D3NE.Socket("message", "Message object", "hint");
var userSocket = new D3NE.Socket("user", "User object", "hint");
var channelSocket = new D3NE.Socket("channel", "Channel object", "hint");


// Define "Send Message" component
var componentSendMessage = new D3NE.Component("Send Message", {
    builder(node) {
        var inpChannel = new D3NE.Input("Channel", channelSocket);
        var inpMessage = new D3NE.Input("Message", stringSocket);
        var out = new D3NE.Output("Action", actionSocket);
        var nodeType = "callable";
        var nodeName = "send";
        var inputs = [];
        node.data = {
            type: nodeType,
            name: nodeName,
            inputs: inputs
        };
        return node
            .addInput(inpChannel)
            .addInput(inpMessage)
            .addOutput(out);
    },
    worker(node, inputs, outputs) {
        var channel = inputs[0][0];
        var message = inputs[1][0];
        node.data.inputs = inputs;
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
        // For demonstration purposes, just log the message to console
    }
});

// Define "String" component
var componentString = new D3NE.Component("String", {
    builder(node) {
        var out = new D3NE.Output("String", stringSocket);
        var messageControl = new D3NE.Control(
            `<input type="text" placeholder="Enter text" value=${node.data.str || ''}>`,
            (el, c) => {
                el.value = c.getData('str') || '';
            
                function upd() {
                    c.putData("str", el.value); // Corrected from toString() to toString
                }
    
                el.addEventListener("input", ()=>{
                    upd();
                    editor.eventListener.trigger("change");
                });
                el.addEventListener("mousedown", function(e){e.stopPropagation();}); // prevent node movement when selecting text in the input field
                upd();
            }
        );
        var nodeType = "string";
        var nodeName = "";
        var nodeStr = '';
        if (!isNaN(node.data.outputs)){
            nodeStr = node.data.outputs.str || '';
        }
        node.data = {
            type: nodeType,
            name: nodeName,
            outputs: {
                str: nodeStr
            }
        };
        return node
            .addOutput(out)
            .addControl(messageControl);
    },
    worker(node, inputs, outputs) {
        // For demonstration purposes, just return a hardcoded string
        outputs[0] = node.data.str.replace(/^'+|'+$/g, '');
        node.data.outputs[0] = outputs[0].replace(/^'+|'+$/g, '');
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});

// Define "Integer" component
var componentInteger = new D3NE.Component("Integer", {
    builder(node) {
        var out = new D3NE.Output("Integer", integerSocket);
        var nodeType = "integer";
        var nodeName = "";
        node.data = {
            type: nodeType,
            name: nodeName
        };
        return node
            .addOutput(out);
    },
    worker(node, inputs, outputs) {
        // For demonstration purposes, just return a hardcoded integer
        outputs[0] = 42;
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});

// Define "Message" component
var componentMessage = new D3NE.Component("Message", {
    builder(node) {
        var inpMessage = new D3NE.Input("Message", messageSocket);
        var outUser = new D3NE.Output("User", userSocket);
        var outChannel = new D3NE.Output("Channel", channelSocket);
        var outContent = new D3NE.Output("Content", stringSocket);
        var nodeType = "message";
        var nodeName = "message";
        node.data = {
            type: nodeType,
            name: nodeName,
            outputs: []
        };
        return node
            .addInput(inpMessage)
            .addOutput(outContent)
            .addOutput(outChannel)
            .addOutput(outUser);
    },
    worker(node, inputs, outputs) {
        // For demonstration purposes, just return hardcoded values
        outputs[0] = "{content}";
        outputs[1] = "{channel}";
        outputs[2] = "{user}";
        node.data.outputs = outputs;
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});

// Define "User" component
var componentUser = new D3NE.Component("User", {
    builder(node) {
        var inpUser = new D3NE.Input("User", userSocket);
        var outId = new D3NE.Output("Id", stringSocket);
        var outUsername = new D3NE.Output("Username", stringSocket);
        var nodeType = "user";
        var nodeName = "user";
        node.data = {
            type: nodeType,
            name: nodeName
        };
        return node
            .addInput(inpUser)
            .addOutput(outId)
            .addOutput(outUsername);
    },
    worker(node, inputs, outputs) {
        // For demonstration purposes, just return hardcoded values
        outputs[0] = "{user_id}";
        outputs[1] = "{user_name}";
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});

// Define "Channel" component
var componentChannel = new D3NE.Component("Channel", {
    builder(node) {
        var inpChannel = new D3NE.Input("Channel", channelSocket);
        var outId = new D3NE.Output("Channel Id", integerSocket);
        var outName = new D3NE.Output("Channel Name", stringSocket);
        var nodeType = "channel";
        var nodeName = "channel";
        node.data = {
            type: nodeType,
            name: nodeName
        };
        return node
            .addInput(inpChannel)
            .addOutput(outId)
            .addOutput(outName);
    },
    worker(node, inputs, outputs) {
        // For demonstration purposes, just return hardcoded values
        outputs[0] = 1234;
        outputs[1] = "general";
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});

var componentOnMessage = new D3NE.Component("On Message", {
    builder(node) {
        var out = new D3NE.Output("Message", messageSocket);
        var nodeType = "function";
        var nodeName = "on_message";
        var inputs = ["message"]
        node.data = {
            type: nodeType,
            name: nodeName,
            inputs: inputs
        };
        return node
            .addOutput(out);
    },
    worker(node, inputs, outputs) {
        // No worker function since this component doesn't execute code in the editor
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});


var componentStringJoin = new D3NE.Component("String Join", {
    builder(node) {
        var inpString1 = new D3NE.Input("First String", stringSocket, false); // Allow multiple input strings
        var inpString2 = new D3NE.Input("Second String", stringSocket, false); // Allow multiple input strings
        var out = new D3NE.Output("Joined", stringSocket);
        var nodeType = "string";
        var nodeName = "string_join";
        node.data = {
            type: nodeType,
            name: nodeName,
            connectedIn: false,
            connectedOut: false,
            outputs: [""]
        };
        return node
            .addInput(inpString1)
            .addInput(inpString2)
            .addOutput(out);
    },
    worker(node, inputs, outputs, context) {
        var joined = inputs[0].join('') + inputs[1].join('');
        
        if (inputs.length > 2) {
            joined += inputs[2].join('');
        }

        outputs[0] = joined;
        node.data.outputs[0] = joined;

        // Check if there are any input connections
        var connectedIn = false;
        for (var i = 0; i < node.inputs.length; i++) {
            if (node.inputs[i].connections.length > 0) {
                connectedIn = true;
                break;
            }
        }
        
        // Check if there are any output connections
        var connectedOut = false;
        for (var i = 0; i < node.outputs.length; i++) {
            if (node.outputs[i].connections.length > 0) {
                connectedOut = true;
                break;
            }
        }

        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});

var componentPrintOut = new D3NE.Component("Print Out", {
    builder(node) {
        var inpString = new D3NE.Input("String", stringSocket);
        var out = new D3NE.Control(
            '<input readonly type="text">',
            (el, control) => {
                control.setValue = val => {
                    el.value = val;
                };
            }
        );
        var nodeType = "callable";
        var nodeName = "print";
        var nodeStr = node.data.str || '';
        node.data = {
            type: nodeType,
            name: nodeName,
            str: nodeStr
        };
        return node
            .addInput(inpString)
            .addControl(out);
    },
    worker(node, inputs, outputs) {
        var string = inputs[0][0];
        node.data.str = string;
        console.log(string);
        editor.nodes.find(n => n.id == node.id).controls[0].setValue(string);
        
        // Check if there are any input connections
        var connectedIn = false;
        
        // Check if there are any output connections
        var connectedOut = false;

        for (var i = 0; i < node.inputs.length; i++) {
            for(var j = 0; j < node.inputs[i].connections.length; j++) {
                if(isNaN(node.inputs[i].connections) && node.inputs[i].connections.length<1){
                    
                }
                else if (!isNaN(node.inputs[i].connections[j].output) && !isNaN(node.inputs[i].connections[j].node)) {
                    connectedIn = true;
                    break;
                }
            }
        }
        
        for (var i = 0; i < node.outputs.length; i++) {
            for(var j = 0; j < node.outputs[i].connections.length; j++) {
                if(isNaN(node.outputs[i].connections) && node.outputs[i].connections.length<1){

                }
                else if (!isNaN(node.outputs[i].connections[j].node) && !isNaN(node.outputs[i].connections[j].input)) {
                    connectedOut = true;
                    break;
                }
            }
        }
        // Update node data with connection status
        node.data.connectedIn = connectedIn;
        node.data.connectedOut = connectedOut;
    }
});
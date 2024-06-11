const socket = io();

// Define Elements Variables START//
const saveBtn = document.getElementById("save-btn");


// Define Elements Variables   END//
saveBtn.addEventListener("click", function(){
    saveEditorData();
});

window.onload = function(){
    socket.emit("get_code", { 'botName': window.location.href.split("/").pop() })
}

socket.on("code_upload", function(data){
    editor.fromJSON({id: "demo@0.1.0",nodes: data['code']});
});

// D3NE Part
// Define context menu
var menu = new D3NE.ContextMenu({
    SendMessage: componentSendMessage,
    String: {
        String: componentString,
        Join: componentStringJoin,
        Print: componentPrintOut
    },
    Number: {
        Integer: componentInteger
    },
    Message:{
        Message: componentMessage,
        OnMessage: componentOnMessage,
    },
    User: componentUser,
    Channel: componentChannel
});

// Initialize node editor
var container = document.getElementById("nodeEditor");
var components = [componentSendMessage, componentString, componentInteger, componentMessage, componentOnMessage, componentUser, componentChannel, componentStringJoin, componentPrintOut]; // Add other components here
var editor = new D3NE.NodeEditor("demo@0.1.0", container, components, menu);
var engine = new D3NE.Engine("demo@0.1.0", components);
const node_editor = document.getElementById('nodeEditor');
editor.eventListener.on("change", async function() {
    await engine.abort();
    await engine.process(editor.toJSON());
});

editor.view.resize = function(){
    var width = this.container.node().parentElement.clientWidth;
    var height = this.container.node().parentElement.clientHeight;

    this.container
        .style('width', width + 'px')
        .style('height', height + 'px')
        .style('background-color', '#313131')
        .style('background-image', 'radial-gradient(rgba(255, 255, 255, 0.171) 3px, transparent 0)')
        .style('background-size', '30px 30px')
        .style('background-position', `${this.transform.x}px ${this.transform.y}px`);

    this.update();
}

editor.view.update = function(){
    updateBackgroundPosition();
    this.updateConnections();
    this.$cd.scan();
}




editor.eventListener.on('connectioncreate connectionremove', (node) => {
    if(isNaN(node)){
        return;
    }
    else{
        var connectedInCount = node.inputs.filter(input => input.connections.length > 0).length;
        console.log(connectedInCount);
        if (connectedInCount >= 2 && node.inputs.length === 2) {
            var inpString3 = new D3NE.Input("Third String", stringSocket, false);
            node.addInput(inpString3);
            editor.view.updateConnections({ node });
            editor.view.updateNode(node);
        }
    }
});


// Resize and render the editor
editor.eventListener.trigger("change");
editor.view.resize();

// Optionally, set up event listeners, node connections, etc.

// Functions
function saveEditorData(){
    var data = editor.toJSON().nodes;
    var botName = window.location.href.split("/").pop();
    socket.emit("saveEditorData", {'data': data, 'botName': botName});
}

socket.on('codeSaved', function(){
    alert("Bot Saved Successfuly!!!");
    showMessage("Code Saved Successfuly!!!", "green");
});

function updateBackgroundPosition(){
    var t = editor.view.transform;
    var style = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;

    editor.view.view.style('transform', style);
    moveBg(editor.view.transform);
}
function moveBg(transform){
    node_editor.style.backgroundPositionX = `${transform.x}px`;
    node_editor.style.backgroundPositionY = `${transform.y}px`;
    node_editor.style.backgroundSize = `${transform.k * 30}px ${transform.k * 30}px`;
    node_editor.style.backgroundImage = `radial-gradient(rgba(255, 255, 255, 0.173) ${transform.k * 3}px, transparent 0px)`
    return node_editor.style.backgroundPositionX + " " + node_editor.style.backgroundPositionY;
}

const displayMessage = document.querySelector("body > div.message");


function showMessage(message, color){
    displayMessage.classList.toggle('active');
    displayMessage.style.background = color;
    displayMessage.innerText = message;
    setTimeout(function(){
        displayMessage.classList.toggle('active');
    }, 3000);
}

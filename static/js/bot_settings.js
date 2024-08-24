const socket = io({autoConnect: true});

function getProps() {
    let propsList = document.querySelector('.properties-list').getElementsByTagName('li');
    let propsDict = {};

    for (let i = 0; i < propsList.length; i++) {
        let prop = propsList[i];
        let propKey = prop.querySelector('span').textContent.replace(':', '').trim();
        let input = prop.querySelector('input');
        let propValue = input.value;
        propsDict[propKey] = propValue.trim();
    }
    
    return propsDict;
}

function formatSecondsIntoTime(seconds) {
    if (seconds < 60) {
        return `${seconds}s`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}min ${remainingSeconds}s`;
    } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${remainingMinutes}min`;
    } else {
        const days = Math.floor(seconds / 86400);
        const remainingHours = Math.floor((seconds % 86400) / 3600);
        return `${days}day ${remainingHours}h`;
    }
}

function redirectToMainRoute() {
    window.location.href = "/";
}

function sendData() {
    let data = getProps();
    let botName = window.location.href.split('/').pop();
    data["bot_name"] = botName;
    socket.emit("saveSettings", data);

    alert("Bot Saved Successfully!")
    redirectToMainRoute();
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleStatusBtn = document.querySelector('.toggle-status-btn');
    const saveBtn = document.querySelector('.save-btn');

    socket.emit("connect");

    toggleStatusBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('ri-stop-circle-fill')) {
            icon.classList.replace('ri-stop-circle-fill', 'ri-play-circle-fill');
            icon.style.color = '#3ba55c';
            document.querySelector('.status-text').textContent = 'Status: Stopped';
        } else {
            icon.classList.replace('ri-play-circle-fill', 'ri-stop-circle-fill');
            icon.style.color = '#ed4245';
            document.querySelector('.status-text').textContent = 'Status: Running';
        }
    });

    saveBtn.addEventListener('click', sendData);
});

socket.on('runtime_update', function(data) {
    let botName = window.location.href.split('/').pop();
    var runtime = data[botName];
    
    var runtimeElement = document.querySelector('.runtime');
    
    if (runtimeElement) {
        runtimeElement.textContent = `Running for: ${formatSecondsIntoTime(runtime)}`;
    }
});
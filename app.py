import threading
import subprocess
import time
import os
import logging
import docker
import docker.errors
import docker.types
from flask import Flask, render_template, request, redirect, jsonify
from json_m.json_m import*
from extensions.socketio import SocketIO
from datetime import datetime, timedelta
from extensions.utilities import *
from math import *


app = Flask(__name__)

socket = SocketIO(app=app)
def run():
    global socket
    global app
    # Start the Flask app in a separate thread
    flask_thread = threading.Thread(target=socket.run, kwargs={'app': app,'host': "0.0.0.0", 'debug': True, 'use_reloader': False, 'port': 2010})
    flask_thread.start()
    flask_thread.join(1)

app.jinja_env.globals.update(transform_snake_case_to_title=transform_snake_case_to_title)


def update_bots_json():
    # Get the list of items in the directory
    directory_contents = os.listdir("Bots")

    # Filter out only the directories
    folder_names = [item for item in directory_contents if os.path.isdir(os.path.join("Bots", item))]
    json_file("Bots/bots.json", Operation.CHANGE, "bots_names", folder_names)
    return folder_names

# Bots Names

BOTS = update_bots_json()
print(BOTS)

# Bot Process Class

class BotProcess(threading.Thread):
    def __init__(self, bot_name):
        super().__init__()
        self.bot_name = bot_name
        self._stop_event = threading.Event()
        self._is_alive = False
        self.image_path = f'images/{bot_name}_image.png'
        self.container = None
        self.first_run_time = None
        self.stop_run_time = None
        self.runtime = 0

        if json_file('Bots/bots.json', Operation.GET, 'bots_runtimes'):
            self.runtime = json_file('Bots/bots.json', Operation.GET, 'bots_runtimes').get(self.bot_name, 0)

        # Create a logger
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        self.file_handler = logging.FileHandler(f'Bots/{self.bot_name}/data/bot.log')
        self.file_handler.setLevel(logging.INFO)
        self.console_handler = logging.StreamHandler()
        self.console_handler.setLevel(logging.INFO)
        self.formatter = logging.Formatter('%(asctime)s - {} - %(levelname)s - %(message)s'.format(self.bot_name))
        self.incode_formatter = logging.Formatter('Output: %(message)s')
        self.file_handler.setFormatter(self.formatter)
        self.console_handler.setFormatter(self.formatter)
        self.logger.addHandler(self.file_handler)
        self.logger.addHandler(self.console_handler)

        # Initialize Docker client
        self.docker_client = docker.from_env()

    def run(self):
        print(f'Starting bot process for {self.bot_name}...')
        self.first_run_time = datetime.now()
        try:
            script_path = f'/app/{self.bot_name}/main.py'
            host_script_path = f'{os.getcwd()}/Bots/'

            while not self._stop_event.is_set():
                try:
                    # Start the container with a long-running command
                    self.container = self.docker_client.containers.run(
                        "python:3.11.9",
                        "/bin/bash -c 'while true; do sleep 1000; done'",
                        volumes={host_script_path: {'bind': '/app', 'mode': 'rw'}},
                        mem_limit="100m",
                        detach=True
                    )
                    self._is_alive = True

                    # Install the required modules
                    self.install_modules()

                    # Start the bot script
                    exec_cmd = f"python {script_path}"
                    self.log(f'Starting bot script with command: {exec_cmd}')
                
                    # Execute the bot script in the container
                    exec_result = self.container.exec_run(exec_cmd, stream=True, demux=True)
                    # Log the output and errors from the script
                    for line in exec_result.output:
                        print(line)
                        
                        if line[1]:
                            self.log(f'Output: {line[1].strip().decode("utf-8")}')
                        elif line[0]:
                            self.error(f'Error: {line[0].strip().decode("utf-8")}')
                    # Stream container logs
                    for line in self.container.logs(stream=True, follow=True):
                        self.log(line.strip().decode('utf-8'))
                except docker.errors.ContainerError as e:
                    print(f'Error in {self.bot_name}: {e}')
                    self.log(f'Error in {self.bot_name}: {e}')
                time.sleep(3600)
        except Exception as e:
            print(f'Error in {self.bot_name}: {str(e)}')
            self.log(f'Error in {self.bot_name}: {str(e)}')
        finally:
            print(f'Bot process for {self.bot_name} terminated.')
            self.log(f"Bot Process stopped, which was running before {format_seconds_into_time(self.runtime)}")

    def start(self):
        self._stop_event = threading.Event()
        self._is_alive = True
        super().start()

    def is_alive(self):return self._is_alive

    def stop(self):
        self._stop_event.set()
        self._is_alive = False
        if self.container:
            self.container.stop()
            self.container.remove()
        self.stop_run_time = datetime.now()
        self.save_runtime()

    def save_runtime(self):
        bots_runtimes = json_file("Bots/bots.json", Operation.GET, "bots_runtimes")
        if self.stop_run_time is None and bots_runtimes:
            bots_runtimes[self.bot_name] = floor((datetime.now() - self.first_run_time).total_seconds())
            self.runtime = bots_runtimes[self.bot_name]
            json_file("Bots/bots.json", Operation.CHANGE, "bots_runtimes", bots_runtimes)
    def log(self, message): self.logger.info(msg=message)
    def error(self, message): self.logger.error(msg=message)
    def warn(self, message): self.logger.warning(msg=message)
    def get_modules(self): 
        with open(os.path.join(os.getcwd(), "Bots", self.bot_name, "requirements.txt"), "r+") as f:
            return f.readlines()
    def setLoggingLevel(self, level): self.console_handler.setLevel(level)
    def install_modules(self):
        self.setLoggingLevel(logging.WARN)
        if self.container:
            self.warn("Upgrading pip...")
            self.container.exec_run("pip install --upgrade pip")
            self.warn(f'Installing modules...')
            requirements_path = f"/app/{self.bot_name}/requirements.txt"
            exit_code, output = self.container.exec_run(f"pip install -r {requirements_path} --root-user-action ignore")
            output = output.decode('utf-8')
            if exit_code != 0:
                self.setLoggingLevel(logging.ERROR)
                self.error(f'Error installing modules: {output}')
                # Additional debugging
                self.warn('Checking installed packages...')
                exit_code, check_output = self.container.exec_run("pip list")
                self.log(f'Installed packages: {check_output.decode("utf-8")}')
            else:
                self.log(f'Modules installed successfully!')
        self.setLoggingLevel(logging.INFO)

def get_bot_by_name(botname):
    global bot_processes
    return [bot for bot in bot_processes if bot.bot_name == botname][0]

def get_bot_code_by_name(botname):
    return json_file(f'Bots/{botname}/data/code.json', Operation.GET, "code")

def create_bot_processes():
    return [BotProcess(bot_name) for bot_name in BOTS]

@app.route('/')
def index():
    global bot_processes
    return render_template('index.html', bot_processes_list=bot_processes)

@app.route('/start_bot/<bot_name>')
def start_bot(bot_name):
    global bot_processes

    # Check if the bot is not already running
    if [bot for bot in bot_processes if bot.bot_name == bot_name][0].is_alive():
        return f'Bot {bot_name} is already running!'
    
    # Check if the bot_name is valid and has a corresponding token
    if bot_name in BOTS:
        old_process = [bot for bot in bot_processes if bot.bot_name == bot_name][0]
        bot_processes.remove(old_process)
        new_process = BotProcess(bot_name)
        bot_processes.append(new_process)
        new_process.start()

        return redirect("/")
    else:
        return f'Invalid bot name: {bot_name} or missing token!'


@app.route('/stop_bot/<bot_name>')
def stop_bot(bot_name):
    global bot_processes

    # Find the bot process in the list
    process_to_stop = next((process for process in bot_processes if process.bot_name == bot_name), None)

    if process_to_stop is not None:
        try:
            process_to_stop.stop()
            return redirect("/")
        except Exception as e:
            return f'Error stopping bot {bot_name}: {str(e)}'
    else:
        return f'Bot {bot_name} not found or not running!'
    
@app.route('/settings_bot/<bot_name>')
def bot_settings(bot_name):
    global bot_processes
    bot_process = [bot for bot in bot_processes if bot.bot_name == bot_name][0]
    props = json_file(f"Bots/{bot_name}/config.json", Operation.GET, "props")
    return render_template("bot_settings.html", bot=bot_process, props=props)

@app.route('/editor/<bot_name>')
def bot_editor(bot_name):
    global bot_processes
    bot = get_bot_by_name(bot_name)
    return render_template("bot_editor.html", bot=bot)


@app.route('/bot_logs/<bot_name>')
def bot_logs(bot_name):
    global bot_processes
    bot_process = [bot for bot in bot_processes if bot.bot_name == bot_name][0]
    return render_template("bot_log.html", bot=bot_process)

# Return Bot Code Json
@socket.on("get_code")
def get_code(data):
    code = get_bot_code_by_name(data["botName"])
    socket.emit("code_upload", {"code": code})


@socket.on('saveSettings')
def handle_message_from_client(data):
    update_bot_data(data)

@socket.on('saveEditorData')
def handle_message_from_client(data):
    code_data = data['data']
    bot_name = data['botName']
    if update_bot_code(code_data, bot_name):
        print(f"Bot ({bot_name}) code updated!!!")
        socket.emit('codeSaved')

def update_bot_code(code, bot_name):
    try:
        json_file(f"Bots/{bot_name}/data/code.json", Operation.CHANGE, "code", code)
        return True
    except Exception as e:
        return False

def update(**kwargs):
    global socketio
    while True:
        bot_processes:BotProcess = kwargs.get("bot_processes")
        runtime_data = {}
        log_data = {}
        for process in bot_processes:
            process.save_runtime()
            runtime_data[process.bot_name] = process.runtime
            with open(f"Bots/{process.bot_name}/data/bot.log", "r") as log_file:
                log_data[process.bot_name] = log_file.read()
        socket.emit('runtime_update', runtime_data)
        
        socket.emit("log_update", log_data)
        
        time.sleep(1)

if __name__ == '__main__':
    run()
    # Start the bot processes
    bot_processes = create_bot_processes()
    for process in bot_processes:
        run_on_start = json_file(f"Bots/{process.bot_name}/config.json", Operation.GET, "on_start_run")
        if not run_on_start:
            pass
        else:
            process.start()

    try:
        f_update = threading.Thread(target=update, kwargs={"bot_processes": bot_processes})
        f_update.start()
        while any(process.is_alive() for process in bot_processes):
            for process in bot_processes:
                if process.is_alive():
                    process.join(1)
    except KeyboardInterrupt:
        print("Interrupted. Stopping bots...")
        for process in bot_processes:
            process.stop()
        print("All bot processes terminated.")
        quit() 
    finally:
        exit(0)


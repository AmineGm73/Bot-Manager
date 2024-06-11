from json_m.json_m import json_file, Operation

conf_props = json_file("config.json", Operation.GET, "props")

# Main Code Start
import discord

intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.presences = True
intents.messages = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'Client : {client.user.name}, connected!')

@client.event
async def on_message(message: discord.Message):
    content, user, channel = message.content, message.author, message.channel
    await channel.send(content)


# Main Code End
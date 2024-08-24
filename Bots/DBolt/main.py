import discord

intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.presences = True
intents.messages = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    discord.utils.setup_logging()

@client.event
async def on_message(message: discord.Message):
    if message.author == client.user:
        return
    content, user, channel = message.content, message.author, message.channel
    await channel.send(content)

client.run("MTI2MDk4MTQ1MjQ2NDQ1NTczNA.G88dde.QFGZFTfkRkt2WumH2KNwiWRRtDufWl6VD4L4yk")

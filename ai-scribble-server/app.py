from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import base64
from io import BytesIO
from PIL import Image
from openai import OpenAI

# Init Flask + CORS
app = Flask(__name__)
CORS(app, supports_credentials=True)
client = OpenAI()


import random

word_pool = [
    "Penguin DJ",
    "Toaster Rocket",
    "Dancing Banana",
    "Flying Toilet",
    "Unicorn Pizza",
    "Skateboarding Cat",
    "Broccoli King",
    "Octopus Chef",
    "Cactus in Sunglasses",
    "Alien Playing Golf"
]

player_words = {}  # player -> assigned word


guesses = {}  # player_name -> guess

current_round = {
    "index": 0,
    "started": False,
    "reveal": False  # <- new
}

game_state = {"started": False}

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage
players = []
generated_images = []

# Serve uploaded images
@app.route("/uploads/<path:filename>")
def serve_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# Join endpoint
@app.route("/join", methods=["POST"])
def join():
    data = request.get_json()
    name = data.get("name")

    if name and name not in players:
        players.append(name)

    return jsonify({"players": players})


# Get all players
@app.route("/players", methods=["GET"])
def get_players():
    return jsonify({"players": players})


# Get all generated images
@app.route("/images", methods=["GET"])
def get_images():
    return jsonify({"images": generated_images})

@app.route("/game-state", methods=["GET"])
def get_game_state():
    return jsonify(game_state)

@app.route("/start-game", methods=["POST"])
def start_game():
    game_state["started"] = True
    return jsonify({"status": "started"})

# Submit drawing and return AI-generated image
@app.route("/submit-drawing", methods=["POST"])
def submit_drawing():
    data = request.get_json()
    player = data.get("player")
    word = data.get("word")
    image_b64 = data.get("imageData")

    if not player or not image_b64:
        return jsonify({"status": "error", "message": "Missing data"}), 400

    try:
        # Decode base64 image
        if image_b64.startswith("data:image"):
            image_b64 = image_b64.split(",")[1]

        image_data = base64.b64decode(image_b64)
        sketch = Image.open(BytesIO(image_data))

        # Fill transparent background with white
        if sketch.mode in ("RGBA", "LA"):
            background = Image.new("RGB", sketch.size, (255, 255, 255))
            background.paste(sketch, mask=sketch.split()[3])
            sketch = background

        # Save the original sketch
        filename = f"{player}_{word}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        sketch.save(filepath)

        # Generate realistic image with OpenAI
        with open(filepath, "rb") as f:
            result = client.images.edit(
                model="gpt-image-1",
                image=[f],
                prompt=f"Make the above hand drawing very realistic and funny by adding a lot of details."
            )

        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)

        gen_filename = f"{player}_{word}_real.png"
        gen_filepath = os.path.join(UPLOAD_FOLDER, gen_filename)
        with open(gen_filepath, "wb") as out:
            out.write(image_bytes)

        image_url = f"http://localhost:5050/uploads/{gen_filename}"

        # Add to image list for polling
        generated_images.append({
            "player": player,
            "word": word,
            "image_url": image_url
        })

        return jsonify({
            "status": "success",
            "filename": gen_filename,
            "image_url": image_url
        })

    except Exception as e:
        print("❌ Error processing image:", e)
        return jsonify({"status": "error", "message": str(e)}), 500


guesses_by_image = []  # list of { image_index: int, guesses: { player: guess } }


@app.route("/reset", methods=["POST"])
def reset_game():
    global players, generated_images, guesses_by_image, current_round, game_state
    players = []
    generated_images = []
    guesses_by_image = []
    current_round = {"index": 0, "started": False, "reveal": False}
    game_state = {"started": False}
    return jsonify({"status": "reset"})

@app.route("/submit-guess", methods=["POST"])
def submit_guess():
    data = request.get_json()
    player = data.get("player")
    guess = data.get("guess")
    image_index = data.get("image_index")

    # Expand storage if needed
    while len(guesses_by_image) <= image_index:
        guesses_by_image.append({"guesses": {}})

    guesses_by_image[image_index]["guesses"][player] = guess
    return jsonify({"status": "ok"})

@app.route("/next-image", methods=["GET"])
def next_image():
    if current_round["index"] < len(generated_images):
        img = generated_images[current_round["index"]]
        return jsonify(img)
    return jsonify({"done": not current_round["reveal"]})


@app.route("/assign-word", methods=["POST"])
def assign_word():
    data = request.get_json()
    player = data.get("player")

    if player:
        if player not in player_words:
            player_words[player] = random.choice(word_pool)
        return jsonify({"word": player_words[player]})
    return jsonify({"error": "No player provided"}), 400


@app.route("/guesses/<int:index>", methods=["GET"])
def get_guesses_for_image(index):
    if index < len(guesses_by_image):
        return jsonify(guesses_by_image[index]["guesses"])
    return jsonify({})

@app.route("/advance-round", methods=["POST"])
def advance_round():
    current_round["reveal"] = True
    return jsonify({"status": "reveal"})

@app.route("/next-round", methods=["POST"])
def next_round():
    current_round["index"] += 1
    current_round["reveal"] = False
    if current_round["index"] >= len(generated_images):
        current_round["started"] = False
    return jsonify({"status": "advanced"})

@app.route("/guesses", methods=["GET"])
def get_guesses():
    return jsonify(guesses)

@app.route("/all-images-ready", methods=["GET"])
def all_images_ready():
    return jsonify({
        "ready": len(generated_images) == len(players)
    })

@app.route("/current-round", methods=["GET"])
def get_current_round():
    return jsonify({"index": current_round["index"]})

@app.route("/scores", methods=["GET"])
def get_scores():
    scores = {}

    for idx, image in enumerate(generated_images):
        correct_word = image["word"].strip().lower()
        if idx < len(guesses_by_image):
            for player, guess in guesses_by_image[idx]["guesses"].items():
                if guess.strip().lower() == correct_word:
                    scores[player] = scores.get(player, 0) + 1

    return jsonify(scores)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
"""
Living Map of San Francisco - Flask Backend
A hackathon prototype that lets users drop persona markers on an interactive map.
"""

from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# ---------------------------------------------------------------------------
# In-memory store for persona identities
# Each entry: { "prompt": str, "lat": float, "lng": float,
#                "video_url": str, "persona": str }
# ---------------------------------------------------------------------------
identities: list[dict] = []


# ---------------------------------------------------------------------------
# MiniMax API helper  (isolated for easy future integration)
# ---------------------------------------------------------------------------
def generate_persona_video(prompt: str, lat: float, lng: float) -> dict:
    """
    Generate a persona video for the given prompt and location.

    TODO: Replace mock response with MiniMax API call
    -----------------------------------------------
    When integrating MiniMax, update this function to:
      1. Call the MiniMax video generation endpoint with the prompt.
      2. Parse the response to extract the video URL.
      3. Return the result in the same dict format below.
    -----------------------------------------------
    """
    # --- Mock response (remove after MiniMax integration) ---
    mock_video_url = "https://www.w3schools.com/html/mov_bbb.mp4"

    return {
        "status": "success",
        "video_url": mock_video_url,
        "persona": prompt,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    """Serve the main map page."""
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    """
    Accept a persona prompt and location, generate a video,
    and store the identity.

    Expects JSON: { "prompt": str, "lat": float, "lng": float }
    Returns JSON:  { "status": str, "video_url": str, "persona": str }
    """
    data = request.get_json(force=True)
    prompt = data.get("prompt", "").strip()
    lat = data.get("lat")
    lng = data.get("lng")

    if not prompt or lat is None or lng is None:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    result = generate_persona_video(prompt, lat, lng)

    if result["status"] == "success":
        identities.append({
            "prompt": prompt,
            "lat": lat,
            "lng": lng,
            "video_url": result["video_url"],
            "persona": result["persona"],
        })

    return jsonify(result)


@app.route("/identities", methods=["GET"])
def get_identities():
    """Return all stored persona identities."""
    return jsonify(identities)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

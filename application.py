from flask import Flask, request, render_template, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("Missing GOOGLE_API_KEY in environment variables")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash-latest")

@app.route('/')
def home():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    problem = data.get("problem")
    language = data.get("language")
    mode = data.get("mode")

    if not problem or not language or not mode:
        return jsonify({"error": "Missing required fields"}), 400

    mode_prompts = {
        "brief": "Give only the code and a short, concise explanation.",
        "detail": "Give the code with a detailed step-by-step explanation.",
        "pro": "First step:- explain the question what to do Second step:- explain bruteforce approach and then give it code and explain it Third step:- explain its optimization approach and then write it code forth step:- expain all the expected question dobts"
    }

    instruction = mode_prompts.get(mode, "Give code with explanation.")

    prompt = f"""
    Solve this DSA problem in {language}.

    Problem: {problem}

    Instructions: {instruction}
    """

    try:
        response = model.generate_content(prompt)
        if response and hasattr(response, "candidates") and len(response.candidates) > 0:
            solution = response.candidates[0].content.parts[0].text
        else:
            solution = "Not able to generate response"

        return jsonify({"solution": solution})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/question_ans',methods=["POST"])
def question_ans():
    data=request.get_json()
    question = data.get("question", "") if data else ""
    response = model.generate_content(question)
    answer=response.candidates[0].content.parts[0].text

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True)

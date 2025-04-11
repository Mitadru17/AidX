from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

# Initialize flask 
app = Flask(__name__)
CORS(app)

# Initializing DeepSeek 
client = OpenAI(api_key="sk-e4eb5386e9814c8ea0c214fc36485e3f", base_url="https://api.deepseek.com")

def ai_med_response(user_message):
    try:
        response = client.chat.completions.create(
            model="deepseek-reasoner",
            messages=[
                {"role": "system", "content": "You are a medicine recommender AI, You give a medicine recommendation based on symptoms, don't talk a lot give med and reason only."},
                {"role": "user", "content": user_message},
            ],
            stream=False
        )
        return response.choices[0].message.content  # Extract AI ka reply
    except Exception as e:
        return "I'm having trouble processing your request. Please try again."

@app.route('/ask', methods=['POST'])
def ask():
#Handle frontend chat request
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"response": "Invalid request"}), 400

    user_message = data["message"]
    ai_response = ai_med_response(user_message)
    
    return jsonify({"response": ai_response})

if __name__ == '__main__':
    app.run(debug=True)

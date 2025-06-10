import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.rag_service import RAGService

app = Flask(__name__)
CORS(app)
rag_service = RAGService()

@app.route("/", methods=["GET"])
def hello():
    return "Hello Flask"

@app.route("/ingest", methods=["POST"])
def ingest():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    doc_id = rag_service.ingest_document(file)
    return jsonify({"status": "Ingestion completed", "document_id": doc_id})

@app.route("/qa", methods=["POST"])
def qa():
    data = request.json
    question = data.get("question")
    answer = rag_service.answer_question(question)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port) 
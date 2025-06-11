import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.rag_service import RAGService

app = Flask(__name__)
CORS(app)
rag_service = RAGService()


@app.route("/ingest", methods=["POST"])
def ingest():
    doc_ids = []
    if "file" not in request.files:
        return jsonify({"error": "No files uploaded"}), 400
    
    files = request.files.getlist("file")
    for file in files:
        doc_id = rag_service.ingest_document(file)
        doc_ids.append(doc_id)

    return jsonify({"status": "Ingestion completed", "document_ids": doc_ids})

@app.route("/qa", methods=["POST"])
def qa():
    data = request.json
    question = data.get("question")
    answer = rag_service.answer_question(question)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port) 
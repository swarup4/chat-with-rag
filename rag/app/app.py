from flask import Flask, request, jsonify
from app import rag

app = Flask(__name__)

@app.route("/ingest", methods=["POST"])
def ingest():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    doc_id = rag.ingest_document(file)
    return jsonify({"status": "Ingestion started", "document_id": doc_id})


@app.route("/documents", methods=["GET"])
def list_documents():
    docs = rag.get_documents()
    return jsonify(docs)


@app.route("/qa", methods=["POST"])
def qa():
    data = request.json
    question = data.get("question")
    document_ids = data.get("document_ids")
    answer = rag.answer_question(question, document_ids)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(debug=True)
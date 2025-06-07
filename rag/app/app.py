from flask import Flask, request, jsonify
from app import rag
from app.schemas import QARequest, QAResponse

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
    qa_request = QARequest.model_validate(data)
    answer = rag.answer_question(qa_request.question, qa_request.document_ids)
    response = QAResponse(answer=answer)
    return jsonify(response.model_dump())


if __name__ == "__main__":
    app.run(debug=True)
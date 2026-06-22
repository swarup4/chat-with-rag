from tempfile import NamedTemporaryFile

from langchain_community.document_loaders import PyPDFLoader


def save_temp_pdf(contents: bytes) -> str:
    temp = NamedTemporaryFile(delete=False, suffix=".pdf")
    temp.write(contents)
    temp.close()
    return temp.name


def load_pdf(path: str):
    # "layout" preserves word spacing; the default "plain" mode jams words
    # together on some PDFs (e.g. "PATTAYABANGKOK"), wrecking retrieval + BM25.
    loader = PyPDFLoader(path, extraction_mode="layout")
    return loader.load()

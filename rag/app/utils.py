from tempfile import NamedTemporaryFile

from langchain_community.document_loaders import PyPDFLoader


def save_temp_pdf(contents: bytes) -> str:
    temp = NamedTemporaryFile(delete=False, suffix=".pdf")
    temp.write(contents)
    temp.close()
    return temp.name


def load_pdf(path: str):
    loader = PyPDFLoader(path)
    return loader.load()

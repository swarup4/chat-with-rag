from langchain.document_loaders import PyPDFLoader
from tempfile import NamedTemporaryFile


def save_temp_pdf(file):
    temp = NamedTemporaryFile(delete=False, suffix=".pdf")
    temp.write(file.read())
    temp.close()
    return temp.name

def load_pdf(path):
    loader = PyPDFLoader(path)
    return loader.load()
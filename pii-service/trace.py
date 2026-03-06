import traceback

try:
    import spacy
except Exception as e:
    with open("traceback_error.txt", "w") as f:
        traceback.print_exc(file=f)

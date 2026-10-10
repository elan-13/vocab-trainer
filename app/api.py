from fastapi import FastAPI

app = FastAPI(title="Spaced Repetition Vocabulary Trainer")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Spaced Repetition Vocabulary Trainer API. Go to /docs for the API documentation."}

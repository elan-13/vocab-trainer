import threading
import time
import socket
import pytest
import uvicorn
from app.api import app
from srs_sdk.api.words_api import WordsApi
from srs_sdk.configuration import Configuration
from srs_sdk.api_client import ApiClient
from srs_sdk.models.word_create import WordCreate
from srs_sdk.models.review_create import ReviewCreate

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

@pytest.fixture(scope="module")
def live_server():
    port = get_free_port()
    config = uvicorn.Config(app=app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config=config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    # Wait for server to bind
    for _ in range(50):
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.1):
                break
        except OSError:
            time.sleep(0.05)
    else:
        pytest.fail("Live test server failed to start")

    base_url = f"http://127.0.0.1:{port}"
    yield base_url

    server.should_exit = True
    thread.join(timeout=2.0)

def test_sdk_full_flow(live_server):
    # Configure SDK with the live test server URL
    configuration = Configuration(host=live_server)
    with ApiClient(configuration) as api_client:
        words_api = WordsApi(api_client)

        # 1. Add a word
        word_data = WordCreate(
            word="Perseverance",
            language="English",
            translation="Persistence in doing something despite difficulty."
        )
        created_word = words_api.create_word(word_data)
        assert created_word.id is not None
        assert created_word.word == "Perseverance"
        assert created_word.language == "English"
        assert created_word.interval == 0

        word_id = created_word.id

        try:
            # 2. Fetch due words (newly created word must be due)
            due_words = words_api.get_due_words()
            assert any(w.id == word_id for w in due_words)

            # 3. Submit a review with score 5
            review_in = ReviewCreate(score=5)
            schedule = words_api.review_word(word_id, review_in)
            assert schedule.new_repetition == 1
            assert schedule.new_interval == 5
            assert schedule.new_easiness_factor > 2.5

            # 4. Fetch history stats
            history = words_api.get_history(limit=50, offset=0)
            assert history.accuracy >= 0
            assert history.streak >= 0
            assert len(history.recent_reviews) > 0

        finally:
            # 5. Delete the word
            words_api.delete_word(word_id)

            # Verify word is gone from due list
            remaining_due = words_api.get_due_words()
            assert not any(w.id == word_id for w in remaining_due)

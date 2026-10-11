import os
import sys
from pathlib import Path

# Ensure srs_sdk package is discoverable regardless of execution environment
SDK_DIR = Path(__file__).resolve().parent.parent / "srs_sdk"
if str(SDK_DIR) not in sys.path:
    sys.path.insert(0, str(SDK_DIR))

# pyrefly: ignore [missing-import]
from srs_sdk.api.words_api import WordsApi
# pyrefly: ignore [missing-import]
from srs_sdk.configuration import Configuration
# pyrefly: ignore [missing-import]
from srs_sdk.api_client import ApiClient
# pyrefly: ignore [missing-import]
from srs_sdk.models.word_create import WordCreate
# pyrefly: ignore [missing-import]
from srs_sdk.models.review_create import ReviewCreate

def main():
    # 1. Initialize API Client with API Key authentication
    api_key = os.getenv("API_KEY", "srs-dev-secret-key-2026")
    config = Configuration(host="http://localhost:8000")
    
    with ApiClient(config, header_name="X-API-Key", header_value=api_key) as client:
        words_api = WordsApi(client)
        print("Connected to SRS Vocab Trainer API (Authenticated with API Key).\n")


        # 2. Add a new vocabulary card
        print("Adding a new word: 'Sonnenuntergang' (German)...")
        new_word = words_api.create_word(
            WordCreate(
                word="Sonnenuntergang",
                language="German",
                translation="Sunset"
            )
        )
        print(f"-> Created Word ID {new_word.id}: '{new_word.word}' ({new_word.language})")
        print(f"   Initial Repetition: {new_word.repetition}, Interval: {new_word.interval} days\n")

        # 3. Retrieve all due flashcards
        due_cards = words_api.get_due_words()
        print(f"Total cards due for review: {len(due_cards)}")
        for card in due_cards[:5]:
            print(f" - [{card.language}] {card.word} -> {card.translation}")
        print()

        # 4. Submit a spaced repetition review (Score 5: Perfect recall)
        print(f"Submitting review for word ID {new_word.id} with Score 5 (Perfect)...")
        schedule = words_api.review_word(
            new_word.id,
            ReviewCreate(score=5)
        )
        print(f"-> New Interval: {schedule.new_interval} days")
        print(f"-> New Repetition: {schedule.new_repetition}")
        print(f"-> New Easiness Factor: {schedule.new_easiness_factor:.2f}")
        print(f"-> Next Scheduled Review: {schedule.next_review}\n")

        # 5. Fetch overall history and stats
        stats = words_api.get_history(limit=5, offset=0)
        print("--- Progress & History ---")
        print(f"Overall Accuracy: {stats.accuracy}%")
        print(f"Current Streak: {stats.streak} day(s)")
        print(f"Total Logged Reviews: {len(stats.recent_reviews)}")

        # 6. Cleanup demo word
        print(f"\nCleaning up demo word ID {new_word.id}...")
        words_api.delete_word(new_word.id)
        print("Demo complete!")

if __name__ == "__main__":
    main()

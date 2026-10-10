from app.services.stats_service import calculate_accuracy, calculate_streak, calculate_difficult_words
from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional

class MockReview(BaseModel):
    id: int
    word_id: int
    score: int
    
class MockWord(BaseModel):
    id: int
    easiness_factor: float

def test_accuracy():
    assert calculate_accuracy([]) == 0.0
    
    reviews = [
        MockReview(id=1, word_id=1, score=5),
        MockReview(id=2, word_id=1, score=3),
        MockReview(id=3, word_id=1, score=1),
    ]
    assert calculate_accuracy(reviews) == 66.67

def test_streak():
    today = date(2023, 10, 5)
    
    # 3 days in a row
    dates = [
        date(2023, 10, 5),
        date(2023, 10, 5), # duplicate same day
        date(2023, 10, 4),
        date(2023, 10, 3)
    ]
    assert calculate_streak(dates, today) == 3
    
    # Missing today
    dates = [
        date(2023, 10, 4),
        date(2023, 10, 3)
    ]
    assert calculate_streak(dates, today) == 0

    # Gap
    dates = [
        date(2023, 10, 5),
        date(2023, 10, 3)
    ]
    assert calculate_streak(dates, today) == 1

def test_difficult_words():
    words = [
        MockWord(id=1, easiness_factor=2.0),
        MockWord(id=2, easiness_factor=1.5),
        MockWord(id=3, easiness_factor=1.5),
    ]
    reviews = [
        MockReview(id=1, word_id=3, score=1),
        MockReview(id=2, word_id=3, score=2),
        MockReview(id=3, word_id=2, score=0),
        MockReview(id=4, word_id=2, score=5),
    ]
    
    difficult = calculate_difficult_words(words, reviews)
    
    assert difficult[0].id == 3
    assert difficult[1].id == 2
    assert difficult[2].id == 1

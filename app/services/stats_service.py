from typing import List
from datetime import date, timedelta
from collections import defaultdict
from app.db.models import Word, Review
from app.schemas.history import HistoryResponse
from app.repositories.word_repo import word_repo
from app.repositories.review_repo import review_repo
from sqlalchemy.orm import Session
from datetime import datetime

def calculate_accuracy(reviews: List[Review]) -> float:
    if not reviews:
        return 0.0
    correct = sum(1 for r in reviews if r.score >= 3)
    return round((correct / len(reviews)) * 100, 2)

def calculate_streak(review_dates: List[date], today: date) -> int:
    """
    Streak is consecutive calendar days with at least one review, counting back from today.
    """
    unique_dates = sorted(list(set(review_dates)), reverse=True)
    
    streak = 0
    current_date = today
    
    for d in unique_dates:
        if d == current_date:
            streak += 1
            current_date = current_date - timedelta(days=1)
        elif d > current_date:
            # Future dates shouldn't happen, but ignore them if they do
            continue
        else:
            break
            
    return streak

def calculate_difficult_words(words: List[Word], reviews: List[Review], limit: int = 10) -> List[Word]:
    """
    Lowest current EF, tie-broken by most failed reviews.
    """
    failures = defaultdict(int)
    for r in reviews:
        if r.score < 3:
            failures[r.word_id] += 1
            
    sorted_words = sorted(words, key=lambda w: (w.easiness_factor, -failures.get(w.id, 0)))
    return sorted_words[:limit]

def get_history_stats(db: Session, limit: int, offset: int) -> HistoryResponse:
    all_reviews = db.query(Review).all()
    all_words = db.query(Word).all()
    
    accuracy = calculate_accuracy(all_reviews)
    
    review_dates = [r.review_date.date() for r in all_reviews]
    streak = calculate_streak(review_dates, datetime.utcnow().date())
    
    difficult_words = calculate_difficult_words(all_words, all_reviews, limit=10)
    
    recent_reviews = review_repo.get_recent(db, limit=limit, offset=offset)
    
    return HistoryResponse(
        accuracy=accuracy,
        streak=streak,
        difficult_words=difficult_words,
        recent_reviews=recent_reviews
    )

from sqlalchemy.orm import Session
from app.schemas.history import HistoryResponse
from app.repositories.word_repo import word_repo
from app.repositories.review_repo import review_repo

def get_history_stats(db: Session, limit: int, offset: int) -> HistoryResponse:
    # Stub for Phase 5. Real implementation in Phase 6.
    return HistoryResponse(
        accuracy=0.0,
        streak=0,
        difficult_words=word_repo.get_difficult_words(db, limit=10),
        recent_reviews=review_repo.get_recent(db, limit=limit, offset=offset)
    )

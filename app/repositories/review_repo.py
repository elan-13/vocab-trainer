from sqlalchemy.orm import Session
from app.db.models import Review
from typing import List

class ReviewRepo:
    def create(self, db: Session, review: Review) -> Review:
        db.add(review)
        db.commit()
        db.refresh(review)
        return review

    def get_recent(self, db: Session, limit: int = 50, offset: int = 0) -> List[Review]:
        return db.query(Review).order_by(Review.review_date.desc()).offset(offset).limit(limit).all()

review_repo = ReviewRepo()

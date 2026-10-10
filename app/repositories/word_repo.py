from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Word
from typing import List, Optional
from datetime import datetime

class WordRepo:
    def create(self, db: Session, word: Word) -> Word:
        db.add(word)
        db.commit()
        db.refresh(word)
        return word

    def get_by_id(self, db: Session, word_id: int) -> Optional[Word]:
        return db.query(Word).filter(Word.id == word_id).first()

    def get_by_word_and_language(self, db: Session, word: str, language: str) -> Optional[Word]:
        return db.query(Word).filter(
            func.lower(Word.word) == func.lower(word),
            func.lower(Word.language) == func.lower(language)
        ).first()

    def delete(self, db: Session, word: Word):
        db.delete(word)
        db.commit()

    def update(self, db: Session, word: Word):
        db.commit()
        db.refresh(word)
        return word

    def get_due_words(self, db: Session) -> List[Word]:
        return db.query(Word).filter(Word.next_review <= datetime.utcnow()).all()

    def get_upcoming_words(self, db: Session, limit: int = 50, offset: int = 0) -> List[Word]:
        return db.query(Word).filter(Word.next_review > datetime.utcnow()).order_by(Word.next_review.asc()).offset(offset).limit(limit).all()

word_repo = WordRepo()

from sqlalchemy.orm import Session
from app.db.models import Word, Review
from app.repositories.word_repo import word_repo
from app.repositories.review_repo import review_repo
from app.schemas.word import WordCreate
from app.schemas.review import ReviewCreate
from app.core.errors import WordNotFound, DuplicateWord
from app.services.srs import calculate_next
from datetime import datetime, timedelta

def create_word(db: Session, word_in: WordCreate) -> Word:
    existing = word_repo.get_by_word_and_language(db, word_in.word, word_in.language)
    if existing:
        raise DuplicateWord()
    
    word = Word(**word_in.model_dump())
    return word_repo.create(db, word)

def get_due_words(db: Session):
    return word_repo.get_due_words(db)

def delete_word(db: Session, word_id: int):
    word = word_repo.get_by_id(db, word_id)
    if not word:
        raise WordNotFound()
    word_repo.delete(db, word)

def review_word(db: Session, word_id: int, review_in: ReviewCreate):
    word = word_repo.get_by_id(db, word_id)
    if not word:
        raise WordNotFound()
    
    new_rep, new_int, new_ef = calculate_next(word.repetition, word.interval, word.easiness_factor, review_in.score)
    
    word.repetition = new_rep
    word.interval = new_int
    word.easiness_factor = new_ef
    word.next_review = datetime.utcnow() + timedelta(days=new_int)
    
    word_repo.update(db, word)
    
    review = Review(word_id=word.id, score=review_in.score)
    review = review_repo.create(db, review)
    
    return word

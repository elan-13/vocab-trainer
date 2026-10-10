from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.deps import get_db
from app.schemas.word import WordCreate, WordResponse
from app.schemas.review import ReviewCreate, ReviewScheduleResponse
from app.schemas.history import HistoryResponse
from app.services import word_service
from app.repositories.word_repo import word_repo
from app.services.stats_service import get_history_stats

router = APIRouter(prefix="/words", tags=["words"])

@router.post("/", response_model=WordResponse, status_code=status.HTTP_201_CREATED, operation_id="create_word")
def create_word(word_in: WordCreate, db: Session = Depends(get_db)):
    return word_service.create_word(db, word_in)

@router.get("/due/", response_model=List[WordResponse], operation_id="get_due_words")
def get_due_words(db: Session = Depends(get_db)):
    return word_service.get_due_words(db)

@router.post("/{word_id}/review/", response_model=ReviewScheduleResponse, operation_id="review_word")
def review_word(word_id: int, review_in: ReviewCreate, db: Session = Depends(get_db)):
    word = word_service.review_word(db, word_id, review_in)
    return ReviewScheduleResponse(
        new_repetition=word.repetition,
        new_interval=word.interval,
        new_easiness_factor=word.easiness_factor,
        next_review=word.next_review
    )

@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT, operation_id="delete_word")
def delete_word(word_id: int, db: Session = Depends(get_db)):
    word_service.delete_word(db, word_id)

@router.get("/upcoming/", response_model=List[WordResponse], operation_id="get_upcoming_words")
def get_upcoming_words(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return word_repo.get_upcoming_words(db, limit=limit, offset=offset)

@router.get("/history/", response_model=HistoryResponse, operation_id="get_history")
def get_history(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return get_history_stats(db, limit, offset)

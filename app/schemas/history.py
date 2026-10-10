from pydantic import BaseModel
from typing import List
from .word import WordResponse
from .review import ReviewResponse

class HistoryResponse(BaseModel):
    accuracy: float
    streak: int
    difficult_words: List[WordResponse]
    recent_reviews: List[ReviewResponse]

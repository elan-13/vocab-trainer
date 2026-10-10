from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class ReviewCreate(BaseModel):
    score: int = Field(..., ge=0, le=5)

class ReviewResponse(BaseModel):
    id: int
    word_id: int
    score: int
    review_date: datetime

    model_config = ConfigDict(from_attributes=True)

class ReviewScheduleResponse(BaseModel):
    new_repetition: int
    new_interval: int
    new_easiness_factor: float
    next_review: datetime

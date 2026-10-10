from pydantic import BaseModel, Field, constr, ConfigDict
from datetime import datetime

# Pydantic v2 string constraints
StrictStr = constr(strip_whitespace=True, min_length=1)

class WordBase(BaseModel):
    word: StrictStr = Field(..., max_length=100)
    language: StrictStr = Field(..., max_length=50)
    translation: StrictStr = Field(..., max_length=100)

class WordCreate(WordBase):
    pass

class WordResponse(WordBase):
    id: int
    repetition: int
    interval: int
    easiness_factor: float
    next_review: datetime

    model_config = ConfigDict(from_attributes=True)

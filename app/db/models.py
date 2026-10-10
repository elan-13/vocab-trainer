from sqlalchemy import Column, Integer, String, Float, ForeignKey, CheckConstraint, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, index=True, nullable=False)
    language = Column(String, nullable=False)
    translation = Column(String, nullable=False)
    
    # SRS fields
    repetition = Column(Integer, default=0, nullable=False)
    interval = Column(Integer, default=0, nullable=False)
    easiness_factor = Column(Float, default=2.5, nullable=False)
    next_review = Column(DateTime, default=datetime.utcnow, nullable=False)

    reviews = relationship("Review", back_populates="word", cascade="all, delete-orphan", passive_deletes=True)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    review_date = Column(DateTime, default=datetime.utcnow, nullable=False)

    word = relationship("Word", back_populates="reviews")

    __table_args__ = (
        CheckConstraint('score >= 0 AND score <= 5', name='check_score_range'),
    )

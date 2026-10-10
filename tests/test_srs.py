from app.services.srs import calculate_next
import pytest

def test_srs_first_review_score_5():
    rep, interval, ef = calculate_next(repetition=0, interval=0, ef=2.5, score=5)
    assert rep == 1
    assert interval == 5
    assert round(ef, 2) == 2.60

def test_srs_second_review_score_5():
    rep, interval, ef = calculate_next(repetition=1, interval=5, ef=2.6, score=5)
    assert rep == 2
    assert interval == 14  # round(5 * 2.7) = 13.5 -> 14
    assert round(ef, 2) == 2.70

def test_srs_first_review_score_1():
    rep, interval, ef = calculate_next(repetition=0, interval=0, ef=2.5, score=1)
    assert rep == 0
    assert interval == 1
    assert round(ef, 2) == 1.96

def test_srs_ef_floor():
    # EF shouldn't drop below 1.3
    rep, interval, ef = calculate_next(repetition=0, interval=0, ef=1.5, score=0)
    assert rep == 0
    assert interval == 1
    assert ef == 1.3

def test_srs_score_3_4_first_review():
    rep, interval, ef = calculate_next(repetition=0, interval=0, ef=2.5, score=3)
    assert rep == 1
    assert interval == 2
    assert round(ef, 2) == 2.36

def test_srs_score_3_4_later_review():
    # max(prev + 1, round(prev * 1.2))
    # interval 10, prev * 1.2 = 12 -> 12
    rep, interval, ef = calculate_next(repetition=1, interval=10, ef=2.5, score=4)
    assert rep == 2
    assert interval == 12
    assert round(ef, 2) == 2.50

    # interval 2, prev * 1.2 = 2.4 -> 2, but prev + 1 = 3 -> max is 3
    rep, interval, ef = calculate_next(repetition=1, interval=2, ef=2.5, score=4)
    assert rep == 2
    assert interval == 3
    assert round(ef, 2) == 2.50

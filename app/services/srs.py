INTERVAL_SCORE_5_FIRST = 5
INTERVAL_SCORE_3_4_FIRST = 2
INTERVAL_MULTIPLIER_SCORE_3_4 = 1.2
EF_FLOOR = 1.3

def calculate_next(repetition: int, interval: int, ef: float, score: int) -> tuple[int, int, float]:
    """
    Calculate the next spaced repetition values based on the score.
    Returns: (new_repetition, new_interval, new_ef)
    """
    # 1. Update Easiness Factor (EF)
    # EF_new = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = ef + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
    new_ef = max(EF_FLOOR, new_ef)
    
    # 2. Determine interval and repetition
    if score < 3: # Score 0-2
        new_interval = 1
        new_repetition = 0
    else: # Score 3-5
        if repetition == 0: # 1st review
            if score == 5:
                new_interval = INTERVAL_SCORE_5_FIRST
            else: # Score 3-4
                new_interval = INTERVAL_SCORE_3_4_FIRST
        else: # 2nd and later
            if score == 5:
                new_interval = round(interval * new_ef)
            else: # Score 3-4
                new_interval = max(interval + 1, round(interval * INTERVAL_MULTIPLIER_SCORE_3_4))
        
        new_repetition = repetition + 1

    return new_repetition, new_interval, new_ef

def test_review_score_5(client):
    res = client.post("/words/", json={"word": "Gato", "language": "Spanish", "translation": "Cat"})
    word_id = res.json()["id"]
    
    rev_res = client.post(f"/words/{word_id}/review/", json={"score": 5})
    assert rev_res.status_code == 200
    data = rev_res.json()
    assert data["new_interval"] == 5
    assert data["new_repetition"] == 1

def test_review_invalid_score(client):
    res = client.post("/words/", json={"word": "Gato", "language": "Spanish", "translation": "Cat"})
    word_id = res.json()["id"]
    
    rev_res = client.post(f"/words/{word_id}/review/", json={"score": 7})
    assert rev_res.status_code == 422

def test_review_unknown_word(client):
    rev_res = client.post(f"/words/999/review/", json={"score": 3})
    assert rev_res.status_code == 404

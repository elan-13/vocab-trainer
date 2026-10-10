def test_create_word(client):
    response = client.post("/words/", json={"word": "Gato", "language": "Spanish", "translation": "Cat"})
    assert response.status_code == 201
    data = response.json()
    assert data["word"] == "Gato"
    assert "id" in data
    assert data["repetition"] == 0

def test_create_invalid_word(client):
    response = client.post("/words/", json={"word": "", "language": "Spanish", "translation": "Cat"})
    assert response.status_code == 422

def test_create_duplicate_word(client):
    client.post("/words/", json={"word": "Gato", "language": "Spanish", "translation": "Cat"})
    response = client.post("/words/", json={"word": "Gato", "language": "Spanish", "translation": "Another Cat"})
    assert response.status_code == 409
    assert response.json()["code"] == "DUPLICATE_WORD"

def test_delete_word(client):
    res = client.post("/words/", json={"word": "Gato", "language": "Spanish", "translation": "Cat"})
    word_id = res.json()["id"]
    
    del_res = client.delete(f"/words/{word_id}")
    assert del_res.status_code == 204
    
    get_res = client.get("/words/due/")
    assert len(get_res.json()) == 0

def test_delete_missing_word(client):
    del_res = client.delete("/words/999")
    assert del_res.status_code == 404
    assert del_res.json()["code"] == "WORD_NOT_FOUND"

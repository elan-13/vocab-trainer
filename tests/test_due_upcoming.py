def test_due_and_upcoming(client):
    client.post("/words/", json={"word": "DueWord", "language": "Spanish", "translation": "Cat"})
    
    due_res = client.get("/words/due/")
    assert len(due_res.json()) == 1
    
    upcoming_res = client.get("/words/upcoming/")
    assert len(upcoming_res.json()) == 0
    
    client.post(f"/words/{due_res.json()[0]['id']}/review/", json={"score": 5})
    
    due_res2 = client.get("/words/due/")
    assert len(due_res2.json()) == 0
    
    upcoming_res2 = client.get("/words/upcoming/")
    assert len(upcoming_res2.json()) == 1

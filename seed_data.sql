INSERT INTO words (id, word, language, translation, repetition, interval, easiness_factor, next_review) VALUES
(1, 'Hola', 'Spanish', 'Hello', 0, 0, 2.5, datetime('now', '-1 day')),
(2, 'Gato', 'Spanish', 'Cat', 1, 1, 2.36, datetime('now', '-2 days')),
(3, 'Perro', 'Spanish', 'Dog', 2, 6, 2.6, datetime('now', '+2 days')),
(4, 'Libro', 'Spanish', 'Book', 0, 0, 2.5, datetime('now')),
(5, 'Bonjour', 'French', 'Hello', 3, 14, 2.7, datetime('now', '+5 days')),
(6, 'Chat', 'French', 'Cat', 0, 0, 2.5, datetime('now', '-5 days')),
(7, 'Chien', 'French', 'Dog', 1, 1, 1.96, datetime('now')),
(8, 'Livre', 'French', 'Book', 5, 30, 2.8, datetime('now', '+15 days'));

INSERT INTO reviews (id, word_id, score, review_date) VALUES
(1, 1, 3, datetime('now', '-5 days')),
(2, 2, 3, datetime('now', '-3 days')),
(3, 3, 5, datetime('now', '-10 days')),
(4, 3, 5, datetime('now', '-4 days')),
(5, 5, 5, datetime('now', '-20 days')),
(6, 5, 5, datetime('now', '-15 days')),
(7, 5, 5, datetime('now', '-9 days')),
(8, 6, 0, datetime('now', '-5 days')),
(9, 7, 1, datetime('now', '-1 day')),
(10, 8, 5, datetime('now', '-30 days')),
(11, 8, 4, datetime('now', '-25 days')),
(12, 8, 5, datetime('now', '-20 days')),
(13, 8, 5, datetime('now', '-15 days'));

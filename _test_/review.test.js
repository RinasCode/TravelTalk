const request = require('supertest');
const app = require('../app'); // Adjust according to your project structure
const { Review, Author } = require('../models'); // Adjust import according to your project structure
const jwt = require('jsonwebtoken');
require('dotenv').config();

let author_token = '';
const AuthorData = {
    name: "Test Author",
    email: "test@mail.com",
    password: "12345"
};

beforeAll(async () => {
    const author = await Author.create(AuthorData);
    author_token = jwt.sign({ id: author.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
    await Author.destroy({ where: {} });
    await Review.destroy({ where: {} });
});

describe('ReviewController', () => {
    it('POST /reviews - Success Add Review', async () => {
        const res = await request(app)
            .post('/reviews')
            .set('Authorization', `Bearer ${author_token}`)
            .send({
                name: 'Hotel Lestari',
                rate: 1000000,
                address: 'Jl. Lestari No. 8, Semarang',
                review: 'Kamar luas dan pelayanan cepat.',
                image: 'http://example.com/image.jpg'
            });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Success Add Review');
        expect(res.body.reviewed).toHaveProperty('name', 'Hotel Lestari');
    });

    it('GET /reviews - Should return 200 and list all reviews', async () => {
        const res = await request(app).get('/reviews');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Success Read Review');
        expect(res.body.reviewed).toBeInstanceOf(Array);
    });

    it('GET /reviews/user - Should return 200 and list all reviews of the logged-in user', async () => {
        const res = await request(app)
            .get('/reviews/user')
            .set('Authorization', `Bearer ${author_token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Success Read User Reviews');
        expect(res.body.reviewed).toBeInstanceOf(Array);
    });

    it('GET /reviews/:id - Should return 200 and the review detail by ID', async () => {
        const review = await Review.create({
            name: 'Hotel Lestari',
            rate: 1000000,
            address: 'Jl. Lestari No. 8, Semarang',
            review: 'Kamar luas dan pelayanan cepat.',
            authorId: 1,
            image: 'http://example.com/image.jpg'
        });
        const res = await request(app).get(`/reviews/${review.id}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe(`Success read Review with id ${review.id}`);
    });

    it('DELETE /reviews/:id - Should return 200 and delete the review by ID', async () => {
        const review = await Review.create({
            name: 'Hotel Lestari',
            rate: 1000000,
            address: 'Jl. Lestari No. 8, Semarang',
            review: 'Kamar luas dan pelayanan cepat.',
            authorId: 1,
            image: 'http://example.com/image.jpg'
        });
        const res = await request(app)
            .delete(`/reviews/${review.id}`)
            .set('Authorization', `Bearer ${author_token}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toBe(`Success Delete Review with id ${review.id}`);
    });

    it('PUT /reviews/:id - Should return 200 and update the review by ID', async () => {
        const review = await Review.create({
            name: 'Hotel Lestari',
            rate: 1000000,
            address: 'Jl. Lestari No. 8, Semarang',
            review: 'Kamar luas dan pelayanan cepat.',
            authorId: 1,
            image: 'http://example.com/image.jpg'
        });
        const res = await request(app)
            .put(`/reviews/${review.id}`)
            .set('Authorization', `Bearer ${author_token}`)
            .send({ review: 'Updated review!' });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe(`Success Update Review with id ${review.id}`);
    });
});

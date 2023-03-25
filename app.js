const mongodb = require("mongodb")
const express = require("express");
const app = express()
let db = null;

app.use(express.json())
app.use(express.static('public'))
app.post("/attempts", async(req, res) => {
    try {
        const listQuestions = await db.collection('questions').aggregate([{ $sample: { size: 10 } }]).toArray();

        const attempts = {
            questions: listQuestions,
            completed: false,
            score: 0,
            _id: mongodb.ObjectId(),
            correctAnswers: {},
            startedAt: new Date(),
            __v: 0,
        };
        listQuestions.forEach(function(question) {
            attempts.correctAnswers[question._id] = question.correctAnswer;
            delete question.correctAnswer;
        });

        const result = await db.collection('attempts').insertOne(attempts);
        console.log(result)
        delete attempts.correctAnswers;

        return res.status(201).json(attempts);
    } catch (error) {
        console.log(error)
        res.status(404).send(error.message)
    }
})
app.post("/attempts/:id/submit", async(req, res) => {
    try {
        const { id: attemptId } = req.params;
        const body = req.body.userAnswers;

        const attempts = await db.collection('attempts').findOne({
            _id: mongodb.ObjectId(attemptId),
        });
        if (attempts.completed == true) return res.status(200).json(attempts);

        let score = 0;
        attempts.userAnswers = req.body.userAnswers;
        for (let questions in body) {
            if (attempts.correctAnswers[questions] == body[questions])
                score++;
        }

        if (score < 5) {
            attempts.scoreText = "Practice more to improve it :D";
        }
        if (5 <= score < 7) {
            attempts.scoreText = "Good, keep up!";
        }

        if (7 <= score < 9) {
            attempts.scoreText = "Well done!";
        }
        if (9 <= score <= 10) {
            attempts.scoreText = "Perfect!!";
        }
        attempts.score = score;
        attempts.completed = true;
        const result = await db.collection('attempts').updateOne({ _id: mongodb.ObjectId(attemptId) }, { $set: attempts });
        console.log(result)
        res.status(200).json(attempts);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

async function startServer() {
    const client = await mongodb.MongoClient.connect(`mongodb://localhost:27017/${ 'wpr-quiz '}`);
    // Set the db and collection variables before starting the server.
    db = client.db();
    console.log('connected to db.');
    // Now every route can safely use the db and collection objects.
    app.listen(3000);
    console.log('Server listening on port 3000');
}
startServer();
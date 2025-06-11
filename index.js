const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@programmingproject.e8odsjn.mongodb.net/?retryWrites=true&w=majority&appName=ProgrammingProject`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const foodCollection = client.db("foodNest").collection("foods");
    const reqfoodCollection = client.db("foodNest").collection("requestedFood");

    app.get("/availableFoods", async (req, res) => {
      const result = await foodCollection
        .find({ status: "available" })
        .toArray();
      res.send(result);
    });

    app.get("/availableFoods/:id", async (req, res) => {
      const id = req.params.id;
      const food = await foodCollection.findOne({ _id: new ObjectId(id) });
      res.send(food);
    });

    app.get("/featureFoods", async (req, res) => {
      const pipeline = [
        {
          $addFields: {
            quantityAsNumber: { $toInt: "$quantity" },
          },
        },
        {
          $sort: { quantityAsNumber: -1 },
        },
        {
          $limit: 6,
        },
      ];

      const result = await foodCollection.aggregate(pipeline).toArray();
      res.send(result);
    });

    app.get("/requestedFoods", async (req, res) => {
      const result = await reqfoodCollection.find().toArray();
      res.send(result);
    });

    app.get("/allFoods/:id", async (req, res) => {
      const id = req.params.id;

      const result = await foodCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/requestedFoods", async (req, res) => {
      const requestFood = req.body;
      const result = await reqfoodCollection.insertOne(requestFood);
      res.send(result);
    });

    app.get("/requestedFoods/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        user_email: email,
      };

      if (!email) {
        return res.status(400).send({ message: "email is required" });
      }
      const result = await reqfoodCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/allFoodsByEmail/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        donor_email: email,
      };
      if (!email) {
        return res.status(400).send({ message: "email is required" });
      }
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/availableFoods/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body.status;
      const result = await foodCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: updateStatus } }
      );
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const newFood = req.body;
      console.log(newFood);
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    app.put("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedFoods = req.body;
      const updatedDoc = {
        $set: updatedFoods,
      };
      const result = await foodCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("food nest server is cooking");
});

app.listen(port, () => {
  console.log(`food nest server is running on port ${port}`);
});

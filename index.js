const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("food nest server is cooking");
});

app.listen(port, () => {
    console.log(`food nest server is running on port ${port}`);
    
});

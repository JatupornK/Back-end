require("dotenv").config();
require("./config/passport");
const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const { default: rateLimit } = require("express-rate-limit");
const notFould = require("./middlewares/notFould");
const error = require("./middlewares/error");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const authenticateWithPassport = require("./middlewares/passportJwt");
const productRoute = require("./routes/productRoute");
// const db = require('./models')
// db.sequelize.sync({alter:true})

const app = express();
app.use(
  rateLimit({
    windowMs: 1000 * 60 * 15,
    max: 10000,
    message: { message: "Toomany request, Please try again later" },
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/auth", authRoute);
app.use("/users", authenticateWithPassport, userRoute);
app.use("/products", productRoute);

app.use(error);
app.use(notFould);
const port = process.env.PORT || 8000;
app.listen(port, () =>
  console.log(chalk.yellowBright.italic.bold(`server running on port ${port}`))
);
